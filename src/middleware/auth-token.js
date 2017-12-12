import r from 'structure-driver'
import AuthModel from '../models/auth'
import errorCodes from 'structure-error-codes'
import StructureComposeError from 'structure-compose-error'

const errorComposer = new StructureComposeError(errorCodes)

const apiRoot = `/api/${process.env.API_VERSION}`
const whitelistedRoutes = [
  ['GET', `${apiRoot}$`],
  ['POST', `${apiRoot}/sync`],
  ['POST', `${apiRoot}/auth/login$`],
  ['POST', `${apiRoot}/auth/users/.*/password/reset`],
  ['GET', `${apiRoot}/users/existence/.*$`],
  ['POST', `${apiRoot}/users$`]
]

function isWhiteListedUrl(req) {

  for (const route of whitelistedRoutes) {

    if (route[0] !== req.method) {
      continue
    }

    const re = new RegExp(route[1])

    if (re.test(req.originalUrl)) {
      return true
    }

  }

  return false

}

async function checkAuthToken(req) {

  const logger = req.logger || console

  const organizationId = req.headers.organizationid
  const applicationId = req.headers.applicationid
  const token = req.headers.authtoken

  const auth = new AuthModel({
    applicationId,
    logger: logger,
    organizationId
  })

  return await auth.matchAuthToken(token)

}

async function checkAppSecret(req) {

  const applicationId = req.headers.applicationid
  const applicationSecret = req.headers.applicationsecret

  if (!applicationSecret) {
    return false
  }

  const res = await r
    .table('application_secrets')
    .getAll(applicationId, {index: 'applicationId'})
    .limit(1)

  return res.length && res[0].secret === applicationSecret

}

export default async function authenticateAuthToken(req, res, next) {

  return new Promise( async (resolve, reject) => {

    const logger = req.logger || console

    try {

      if (isWhiteListedUrl(req)) {
        return next()
      }

      const validAuthToken = await checkAuthToken(req)

      if (!validAuthToken) {

        const validAppSecret = await checkAppSecret(req)

        if (!validAppSecret) {

          return next(errorComposer.compose(
            'AUTHENTICATION_FAILED',
            null,
            {status: 401}
          ))

        }

      }

    } catch(e) {

      logger.error(e)

      return next(errorComposer.compose(
        'AUTHENTICATION_FAILED',
        null,
        {status: 401}
      ))

    }

    next()

  })

}
