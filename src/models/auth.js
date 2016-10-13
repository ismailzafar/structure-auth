import logger from 'structure-logger'
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
            Node: 'User',
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
   * Determine if user auth token matches assignment
   *
   * @public
   * @param {Object} pkg - Data
   */
  matchAuthToken(pkg = {}) {

    return new Promise( async (resolve, reject) => {

      const matches = await this.r.table('auth_tokens').filter({
        organizationId: pkg.organizationId,
        token: pkg.token,
        userId: pkg.userId
      }).limit(1)

      if(!matches || matches.length == 0) {
        return reject({
          message: 'Auth token does not match user'
        })
      }

      return resolve(true)

    })

  }

  saveAuthToken(pkg) {

    let model = new RootModel({
      table: 'auth_tokens'
    })

    return model.create({
      organizationId: pkg.organizationId,
      token: pkg.token,
      userId: pkg.id
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
   * Facebook authentication
   *
   * @public
   * @param {Object} pkg - Login data
   * @todo Needs work
   */
  authByFacebook(pkg) {
    console.error('handle args', pkg)
    return new Promise( (resolve, reject) => {

      this.r.db(process.env.RETHINK_DB_NAME)
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
