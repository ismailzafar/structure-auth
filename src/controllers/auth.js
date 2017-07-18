import codes from '../lib/error-codes'
import AuthModel from '../models/auth'
import PasswordService from 'structure-password-service'
import r from 'structure-driver'
import RootController from 'structure-root-controller'
import ShortIdService from 'structure-short-id-service'
import TokenService from 'structure-token-service'
import {UserModel} from 'structure-users'

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
   * Change password for user
   *
   * @public
   * @param {Object} req - Express req
   * @param {Object} res - Express res
   */
  changePassword(req, res) {

    const applicationId = req.headers.applicationid
    const organizationId = req.headers.organizationid

    let pkg = req.body
    const id = req.params.id
    const userModel = new UserModel({
      applicationId,
      logger: this.logger,
      organizationId
    })

    return new Promise( async (resolve, reject) => {

      try {
        const oldPassword = Object.assign({}, pkg).oldPassword
        const newPassword = Object.assign({}, pkg).newPassword

        if(pkg.password) {
          throw new Error({
            code: codes.MISSING_PASSWORDS,
            message: 'password property not allowed. Please use oldPassword and newPassword'
          })
        }

        if(!oldPassword || !newPassword) {
          throw new Error({
            code: codes.MISSING_PASSWORDS,
            message: 'Need oldPassword and newPassword properties'
          })
        }

        delete pkg.oldPassword
        delete pkg.newPassword

        // Validate old password
        const reqBodyWithOldPassword = Object.assign({}, req.body, {password: oldPassword})
        const reqWithOldPassword = Object.assign({}, req, {body: reqBodyWithOldPassword})

        let user = await this.login(reqWithOldPassword, res)

        // Create new password hash
        pkg.hash = await new PasswordService().issue(newPassword)
        delete pkg.password

        user = await userModel.updateById(id, pkg)

        // Auth new user
        const reqBodyWithNewPassword = Object.assign({}, req.body, {password: newPassword})
        const reqWithNewPassword = Object.assign({}, req, {body: reqBodyWithNewPassword})

        user = user = await this.login(reqWithNewPassword, res)

        resolve(user)

      } catch(e) {

        this.logger.error(e)
        reject(e)

      }

    })

  }

  /**
   * Login a user
   *
   * @public
   * @param {Object} req - Express req
   * @param {Object} res - Express res
   */
  login(req, res) {

    const applicationId = req.headers.applicationid
    const organizationId = req.headers.organizationid

    const auth = new AuthModel({
      applicationId,
      logger: this.logger,
      organizationId
    })
    const pkg = req.body
    const userModel = new UserModel({
      applicationId,
      logger: this.logger,
      organizationId
    })

    return new Promise( async (resolve, reject) => {

      var user = null

      try {
        if(pkg.username) {
          user = await userModel.getByUsername(pkg.username)
        } else if(pkg.email) {
          user = await userModel.getByEmail(pkg.email)
        }

        /*
        Make sure:
        @note Users do not actually belong to apps, but to organizations. However, users should
        be able to log into any application in which the user and the app are linked.

        1. The organization exists and is valid
        2. The application belongs to the organization provided
        3. The user belongs to the organization provided
        4. The password is valid
        */
        var res = await Promise
          .all([
            true,
            r.table('link_organizations_applications').filter({
              applicationId,
              organizationId
            }).limit(1),
            r.table('link_organizations_users').filter({
              organizationId,
              userId: user.id
            }).limit(1),
            new PasswordService().verify(pkg.password, user.hash)
          ])

        const app = res[0]
        const passwordIsValid = res[3]

        if(!passwordIsValid) {
          return reject({
            code: codes.PASSWORD_MISMATCH,
            message: 'Password is invalid',
            resource: 'AuthController'
          })
        }

        const token = new TokenService()
          .issue(`${organizationId}.${Date.now()}.${user.id}`)

        user.token = token

        auth.login({
          applicationId: app.id,
          email: user.email,
          organizationId,
          token,
          userId: user.id,
          username: user.username
        })

        resolve(user)

      } catch(e) {

        this.logger.error(e)

        this.logger.debug('Auth: Bad data package')

        return reject({
          code: codes.BAD_DATA,
          message: 'Bad data package',
          resource: 'AuthController'
        })

      }

    })

  }

  passwordResetConfirm(req, res) {

    const applicationId = req.headers.applicationid
    const organizationId = req.headers.organizationid

    const email = req.params.email
    const newPassword = req.body.newPassword
    const passwordResetToken = req.body.passwordResetToken
    const userModel = new UserModel({
      applicationId,
      logger: this.logger,
      organizationId
    })

    return new Promise( async (resolve, reject) => {

      try {

        let user = await userModel.getByEmail(email)

        // If there is no user
        if(!user) {
          return reject({
            code: 'USER_EMAIL_INVALID',
            message: 'This email could not be found for a user'
          })
        }

        // If token is invalid
        if(user.passwordResetToken !== passwordResetToken) {
          return reject({
            code: 'USER_PASSWORD_TOKEN_INVALID',
            message: 'This password reset token is invalid'
          })
        }

        // Create new password hash
        const hash = await new PasswordService().issue(newPassword)

        user = await userModel.updateById(user.id, {
          hash,
          passwordResetToken: null // Make sure reset token cannot be used again
        })

        resolve(user)

      } catch(e) {

        this.logger.error(e)
        reject(e)

      }

    })

  }

  passwordResetRequest(req, res) {

    const applicationId = req.headers.applicationid
    const organizationId = req.headers.organizationid

    const email = req.params.email
    const userModel = new UserModel({
      applicationId,
      logger: this.logger,
      organizationId
    })

    return new Promise( async (resolve, reject) => {

      try {

        let user = await userModel.getByEmail(email)

        // If there is no user
        if(!user) {
          return reject({
            code: 'USER_EMAIL_INVALID',
            message: 'This email could not be found for a user'
          })
        }

        const passwordResetToken = new ShortIdService().issue(`${email}${Date.now()}`)

        user = await userModel.updateById(user.id, {
          passwordResetToken
        })

        req.user = user

        resolve(passwordResetToken)

      } catch(e) {

        this.logger.error(e)
        reject(e)

      }

    })

  }

}
