import codes from '../lib/error-codes'
import {resources as applicationResources} from 'structure-applications'
import AuthModel from '../models/auth'
import logger from 'structure-logger'
import {resources as organizationResources} from 'structure-organizations'
import PasswordService from 'structure-password-service'
import RootController from 'structure-root-controller'
import RootModel from 'structure-root-model'
import TokenService from 'structure-token-service'
import {resources as userResources} from 'structure-users'

const AppModel = applicationResources.models.Application
const OrgModel = organizationResources.models.Organization
const r = new RootModel({table: 'root'}).r
const UserModel = userResources.models.User

/**
 * AuthController Class
 *
 * @public
 * @class AuthController
 */
export default class AuthController extends RootController {

 /**
  * AuthController constructor
  *
  * @public
  * @constructor
  * @param {Object} options - Options
  */
  constructor(options = {}) {
   super(Object.assign({}, {
     name: 'auth'
   }, options))
  }

 /**
  * Login a user
  *
  * @public
  * @param {Object} req - Express req
  * @param {Object} res - Express res
  */
  login(req, res) {

    const appModel = new AppModel()
    const auth = new AuthModel()
    let   model = null
    const orgModel = new OrgModel()
    const pkg = req.body
    const userModel = new UserModel()

    return new Promise( async (resolve, reject) => {

      var user = null

      try {
        if(pkg.username) {
          user = await userModel.getByUsername(pkg.username)
        } else if(pkg.email) {
          user = await userModel.getByEmail(pkg.email)
        }

        if(!user) {
          /*model = new RootModel({table: 'actions'})

          model.create({
            authenticated: false,
            err: 'NO_USER',
            username: pkg.username
          })*/

          logger.debug('NO USER')

          return reject({
            err: {
              code: codes.NO_USER,
              message: 'Could not get user: ' + (pkg.username || pkg.email),
              resource: 'AuthModel'
            }
          })
        }

        /*
        Make sure:
        @note Users do not actually belong to apps, but to organizations. However, users should
        be able to log into any application in which the user and the app are linked.

        1. The organization exists and is valid
        2. The application exists and secret is valid
        3. The application belongs to the organization provided
        4. The user belongs to the organization provided
        5. The password is valid
        6. Go ahead and generate a login token while the rest of this going on, just in case
        */
        var res = await Promise
          .all([
            orgModel.getById(pkg.organizationId),
            this.validateAppSecret(pkg.applicationId, pkg.applicationSecret),
            r.table('link_organizations_applications').filter({
              applicationId: pkg.applicationId,
              organizationId: pkg.organizationId
            }).limit(1),
            r.table('link_organizations_users').filter({
              organizationId: pkg.organizationId,
              userId: user.id
            }).limit(1),
            /*appModel.getReference({
              applicationId: pkg.applicationId,
              organizationId: pkg.organizationId
            }),
            auth.getReference({
              node: 'users',
              organizationId: pkg.organizationId,
              userId: user.id
            }),*/
            new PasswordService().verify(pkg.password, user.hash),
            new TokenService().issue(`${pkg.organizationId}${Date.now()}${user.id}`)
          ])

        const app   = res[1]
        const org   = res[0]
        const token = res[5]

        auth.login({
          applicationId: app.id,
          email: user.email,
          organizationId: org.id,
          //token,
          userId: user.id,
          username: user.username
        })

        user.token = token

        resolve(user)

      }
      catch(e) {

        /*const data = {
          applicationId: pkg.applicationId,
          authenticated: false,
          email: pkg.email,
          err: 'BAD_DATA',
          organizationId: pkg.organizationId,
          //password: pkg.password,
          userId: user.id,
          username: pkg.username
        }

        model = new RootModel({table: 'actions'})

        model.create(data)*/

        logger.debug('Auth: Bad data package')

        return reject({
          err: {
            code: codes.BAD_DATA,
            message: 'Bad data package',
            resource: 'AuthModel'
          }
        })
      }

    })

  }

  validateAppSecret(appId, secret) {

    const appModel = new AppModel()

    return new Promise( async (resolve, reject) => {

      if(!secret) {
        return reject({
          code: codes.BAD_APPLICATION,
          message: 'App not found'
        })
      }

      try {
        var app = await appModel.getById(appId)

        if(app.secret != secret) {
          reject({
            code: codes.BAD_APPLICATION,
            message: 'App invalid'
          })
        }

        resolve(true)
      }
      catch(e) {
        reject({
          code: codes.BAD_APPLICATION,
          message: 'App not found'
        })
      }

    })

  }

}
