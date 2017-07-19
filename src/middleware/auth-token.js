import AuthModel from '../models/auth'
import errorCodes from 'structure-error-codes'
import StructureComposeError from 'structure-compose-error'

const errorComposer = new StructureComposeError(errorCodes)

const apiRoot = `/api/${process.env.API_VERSION}`
const whitelistedRoutes = [
  `${apiRoot}$`,
  `${apiRoot}/auth/login$`,
  `${apiRoot}/auth/users/.*/password/reset`
]

function isWhiteListedUrl(url) {

  for (const route of whitelistedRoutes) {

    const re = new RegExp(route)

    if (re.test(url)) {
      return true
    }

  }

  return false

}

export default async function authenticateAuthToken(req, res, next) {

  return new Promise( async (resolve, reject) => {

    const logger = req.logger || console

    try {

      if (isWhiteListedUrl(req.originalUrl)) {
        return next()
      }

      const organizationId = req.headers.organizationid
      const applicationId = req.headers.applicationid
      const token = req.headers.authtoken

      const auth = new AuthModel({
        applicationId,
        logger: logger,
        organizationId
      })

      const valid = await auth.matchAuthToken(organizationId, token)

      if (!valid) {

        return next(errorComposer.compose(
          'AUTHENTICATION_FAILED',
          null,
          {status: 401}
        ))

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
