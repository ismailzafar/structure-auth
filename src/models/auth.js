import r from 'structure-driver'
import RootModel from 'structure-root-model'

/**
 * AuthModel Class
 *
 * @public
 * @class AuthModel
 */
export default class AuthModel extends RootModel {

  /**
   * AuthModel constructor
   *
   * @public
   * @constructor
   * @param {Object} options - Options
   */
  constructor(options = {}) {
    super(Object.assign({}, {
      table: 'auth',

      relations: {
        belongsTo: [
          {
            foreignKey: 'id',
            localField: 'user',
            localKey: 'userId'
          }
        ]
      }
    }, options))
  }

  /**
   * Login user
   *
   * @public
   * @param {Object} pkg - Login data
   */
  login(pkg = {}) {

    return Promise
      .all([
        this.saveLoginAction(pkg),
        this.saveAuthToken(pkg)
      ])

  }

  /**
   * Logout user
   *
   * @public
   * @param {Object} pkg - Logout data
   */
  logout(pkg = {}) {

    return RootModel.prototype.create.call(this, {
      unauthenticated: true,
      userId: pkg.id,
      username: pkg.username
    }, {table: 'actions'})

  }

  /**
   * Determine if user auth token is valid
   *
   * @public
   * @param {String} organizationId - ID of organization token exists on
   * @param {String} token - token to be validated
   * @returns {Boolean} - whether or not the token is valid
   */
  matchAuthToken(organizationId, token) {

    return new Promise( async (resolve, reject) => {

      if (!token) {
        return resolve(false)
      }

      const matches = await r
        .table('auth_tokens')
        .filter({
          organizationId: organizationId,
          token: token
        })
        .limit(1)

      if(!matches || matches.length === 0) {
        return resolve(false)
      }

      resolve(true)

    })

  }

  saveAuthToken(pkg) {

    let model = new RootModel({
      table: 'auth_tokens'
    })

    return model.create({
      organizationId: pkg.organizationId,
      token: pkg.token,
      userId: pkg.userId
    })

  }

  saveLoginAction(pkg) {

    let model = new RootModel({
      table: 'actions'
    })

    return model.create({
      applicationId: pkg.applicationId,
      authenticated: true,
      email: pkg.email,
      organizationId: pkg.organizationId,
      userId: pkg.id,
      username: pkg.username
    })

  }

  /**
   * Wipe all auth tokens for a user
   *
   * @public
   * @param {String} userId - ID of user to wipe tokens of
   * @param {String} token - token to be validated
   * @returns {Number} - number of tokens removed
   */
  wipeUserAuthTokens(userId) {

    return new Promise( async (resolve, reject) => {

      const res = await r
        .table('auth_tokens')
        .filter({userId})
        .delete()

      resolve(res.deleted)

    })

  }

  /**
   * Get 10 most recent user auth tokens
   *
   * @public
   * @param {String} userId - ID of user to get tokens of
   * @returns {Array.Object} - up to 10 most recent user auth tokens
   */
  getRecentUserAuthTokens(userId) {

    return new Promise( async (resolve, reject) => {

      const res = await r
        .table('auth_tokens')
        .filter({userId})
        .orderBy(r.desc('createdAt'))
        .limit(10)

      resolve(res)

    })

  }

  /**
   * Facebook authentication
   *
   * @public
   * @param {Object} pkg - Login data
   * @todo Needs work
   */
  authByFacebook(pkg) {

    return new Promise( (resolve, reject) => {

      r.db(process.env.RETHINK_DB_NAME)
        .table('users')
        .filter({
          strategies: {
            facebook: {
              id: pkg.profile.id
            }
          }
        })
        .limit(1)
        .run()
        .then( (res) => {
          console.log('handle res', res)
          resolve()
        })
        .catch( (err) => {
          console.error('handle err', err)
          reject()
        })

    })
  }

}
