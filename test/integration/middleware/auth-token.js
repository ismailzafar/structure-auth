import Migrations from 'structure-migrations'
import {errors, respond} from 'structure-dispatcher'
import {plugins} from 'structure-middleware'
import {authenticateApplicationEntity} from 'structure-auth-entity'
import MockHTTPServer from '../../helpers/mock-http-server'
import pluginsList from '../../helpers/plugins'
import TestAPI from '../../helpers/test-api'
import OrgTestAPI from 'structure-organizations/test/helpers/test-api'
import AppTestAPI from 'structure-applications/test/helpers/test-api'
import UserTestAPI from 'structure-users/test/helpers/test-api'
import authenticateAuthToken from '../../../src/middleware/auth-token'
import middleware from '../../helpers/middleware'

const authTokenMiddleware = [
  authenticateApplicationEntity,
  authenticateAuthToken,
  plugins,
  respond(),
  errors()
]

const server =  new MockHTTPServer(middleware)
const orgTestApi = new OrgTestAPI(server)
const appTestApi = new AppTestAPI(server)
const userTestApi = new UserTestAPI(server)

const authTokenServer =  new MockHTTPServer(authTokenMiddleware)
const testApi = new TestAPI(authTokenServer)

/** @test {AuthTokenMiddleware} */
describe('Auth Token Middleware', function() {

  before(function() {

    this.migration = new Migrations({
      db: 'test',
      plugins: pluginsList
    })

    return this.migration.process()

  })

  beforeEach(async function() {
    const orgRes = await orgTestApi.create({
      title: 'work it'
    })
    this.orgId = orgRes.body.pkg.id

    const appRes = await appTestApi.create(this.orgId, {
      title: 'App 45'
    })
    this.appId = appRes.body.pkg.id

    const userRes = await userTestApi.create(this.orgId, this.appId, {
      username: 'testuser1',
      email: 'testuser1@mail.com',
      password: 'foo88',
      firstName: 'Pumpkin',
      lastName: 'Joe',
    })
    this.userId = userRes.body.pkg.id
  })

  afterEach(function() {
    return this.migration.purge()
  })

  it('shouldnt need auth for index', async function(done) {

    const req = {
      headers: {},
      originalUrl: '/api/0.1'
    }

    authenticateAuthToken(req, {}, function(error) {
      expect(error).to.equal(undefined)
      done()
    })

  })

  it('shouldnt need auth for /sync', async function(done) {

    const req = {
      headers: {},
      originalUrl: '/api/0.1/sync'
    }

    authenticateAuthToken(req, {}, function(error) {
      expect(error).to.equal(undefined)
      done()
    })

  })

  it('shouldnt need auth for /auth/login', async function(done) {

    const req = {
      headers: {},
      originalUrl: '/api/0.1/auth/login'
    }

    authenticateAuthToken(req, {}, function(error) {
      expect(error).to.equal(undefined)
      done()
    })

  })

  it('shouldnt need auth for /auth/users/:email/password/reset', async function(done) {

    const req = {
      headers: {},
      originalUrl: '/api/0.1/auth/users/fake@example.com/password/reset'
    }

    authenticateAuthToken(req, {}, function(error) {
      expect(error).to.equal(undefined)
      done()
    })

  })

  it('shouldnt need auth for /auth/users/:email/password/reset/confirm', async function(done) {

    const req = {
      headers: {},
      originalUrl: '/api/0.1/auth/users/fake@example.com/password/reset/confirm'
    }

    authenticateAuthToken(req, {}, function(error) {
      expect(error).to.equal(undefined)
      done()
    })

  })

  it('should fail for missing auth', function(done) {
    (async () => {

      await testApi.login(this.orgId, this.appId, {
        email: 'testuser1@mail.com',
        password: 'foo88'
      })

      const req = {
        headers: {},
        originalUrl: '/api/0.1/users'
      }

      authenticateAuthToken(req, {}, function(error) {
        expect(error.code).to.equal('AUTHENTICATION_FAILED')
        done()
      })

    })()
  })

  it('should fail with bad token', function(done) {
    (async () => {

      await testApi.login(this.orgId, this.appId, {
        email: 'testuser1@mail.com',
        password: 'foo88'
      })

      const req = {
        headers: {
          organizationid: this.orgId,
          applicationid: this.appId,
          authtoken: 'some old rubbish'
        },
        originalUrl: '/api/0.1/users'
      }

      authenticateAuthToken(req, {}, function(error) {
        expect(error.code).to.equal('AUTHENTICATION_FAILED')
        done()
      })

    })()
  })

  it('should pass with good token', function(done) {
    (async () => {
      const res = await testApi.login(this.orgId, this.appId, {
        email: 'testuser1@mail.com',
        password: 'foo88'
      })
      const token = res.body.pkg.token

      const req = {
        headers: {
          organizationid: this.orgId,
          applicationid: this.appId,
          authtoken: token
        },
        originalUrl: '/api/0.1/users'
      }

      authenticateAuthToken(req, {}, function(error) {
        expect(error).to.equal(undefined)
        done()
      })

    })()
  })

})
