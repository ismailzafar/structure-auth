import AppController  from '../../../src/controllers/applications'
import AppModel       from '../../../src/models/application'
import AuthController from '../../../src/controllers/auth'
import OrgModel       from '../../../src/models/organization'
import UserModel      from '../../../src/models/user'

/** @test {AuthController} */
describe('Auth', function() {


  /** @test {AuthController#login} */
  it('should not login; missing login data',  async function(done) {

    var auth = new AuthController()

    var req = {
      body: {
        username: 'foo'
      }
    }

    try {
      var res = await auth.login(req)
    }
    catch(e) {
      expect(e).to.be.an('object')

      done()
    }

  })

  /** @test {AuthController#login} */
  it('should not login; no user',  async function(done) {

    var auth = new AuthController()

    var req = {
      body: {
        username: 'foo',
        password: 'bar'
      }
    }

    try {
      var res = await auth.login(req)
    }
    catch(e) {
      expect(e).to.be.an('object')

      done()
    }

  })

  /** @test {AuthController#login} */
  it('should not login; bad password',  async function(done) {

    var auth      = new AuthController(),
        userModel = new UserModel()

    var user = await userModel.create({
      email: 'mail@foo.com',
      username: 'tom235590',
      password: 'gonnacatchyou22'
    })

    var req = {
      body: {
        username: 'tom235590',
        password: 'gonnacatchyou21'
      }
    }

    try {
      var res = await auth.login(req)
    }
    catch(e) {
      expect(e).to.be.an('object')

      done()
    }

  })

  /** @test {AuthController#login} */
  it('should login not log in; missing organization',  async function(done) {

    var auth      = new AuthController(),
        userModel = new UserModel()

    var user = await userModel.create({
      email: 'mail@foo.com',
      username: 'tom235591',
      password: 'gonnacatchyou22'
    })

    var req = {
      body: {
        organizationId: 1,
        username: 'tom235591',
        password: 'gonnacatchyou22'
      }
    }
    try {
      var res = await auth.login(req)
    }
    catch(e) {
      expect(e).to.be.an('object')

      done()
    }

  })

  /** @test {AuthController#login} */
  it('should login not log in; missing application',  async function(done) {

    var auth      = new AuthController(),
        orgModel  = new OrgModel(),
        userModel = new UserModel()

    var user = await userModel.create({
      email: 'mail3@foo.com',
      username: 'tom235593',
      password: 'gonnacatchyou22'
    })

    var req = {
      body: {
        organizationId: 1,
        username: 'tom235593',
        password: 'gonnacatchyou22'
      }
    }

    try {
      var res = await auth.login(req)
    }
    catch(e) {
      expect(e).to.be.an('object')

      done()
    }

  })

  /** @test {AuthController#login} */
  it('should not login; missing application secret',  async function(done) {

    var appModel  = new AppModel(),
        auth      = new AuthController(),
        orgModel  = new OrgModel(),
        userModel = new UserModel()

    var org = await orgModel.create({
      title: 'Pizza Club',
      desc: 'Where pizza is'
    })

    var app = await appModel.create({
      title: 'Pizza ToGo',
      desc: 'Ur Pizza Find You',
      __refs: [
        {organizationId: org.id}
      ]
    })

    var user = await userModel.create({
      email: 'mail4234@foo.com',
      username: 'tom23559234',
      password: 'gonnacatchyou22',
      __refs: [
        {organizationId: org.id}
      ]
    })

    var req = {
      body: {
        applicationId: app.id,
        organizationId: org.id,
        username: user.username,
        password: 'gonnacatchyou22'
      }
    }

    try {
      var res = await auth.login(req)
      console.error('res', res)
    }
    catch(e) {
      console.error('e', e)
      expect(e).to.be.an('object')

      done()
    }

  })

  /** @test {AuthController#login} */
  it('should login with username',  async function(done) {

    var appController = new AppController(),
        auth      = new AuthController(),
        orgModel  = new OrgModel(),
        userModel = new UserModel()

    var org = await orgModel.create({
      title: 'Pizza Club',
      desc: 'Where pizza is'
    })

    var app = await appController.create({
      body: {
        title: 'Pizza ToGo',
        desc: 'Ur Pizza Find You',
        __refs: [
          {organizationId: org.id}
        ]
      }
    })

    var user = await userModel.create({
      email: 'mail4235@foo.com',
      username: 'tom23559235',
      password: 'gonnacatchyou22',
      __refs: [
        {organizationId: org.id}
      ]
    })

    var req = {
      body: {
        applicationId: app.id,
        applicationSecret: app.secret,
        organizationId: org.id,
        username: user.username,
        password: 'gonnacatchyou22'
      }
    }

    var res = await auth.login(req)

    expect(res).to.be.an('object')
    expect(res.username).to.equal('tom23559235')

    done()

  })

  /** @test {AuthController#login} */
  it('should login with email',  async function(done) {

    var appController = new AppController(),
        auth      = new AuthController(),
        orgModel  = new OrgModel(),
        userModel = new UserModel()

    var org = await orgModel.create({
      title: 'Pizza Club',
      desc: 'Where pizza is'
    })

    var app = await appController.create({
      body: {
        title: 'Pizza ToGo',
        desc: 'Ur Pizza Find You',
        __refs: [
          {organizationId: org.id}
        ]
      }
    })

    var user = await userModel.create({
      email: 'mail4236@foo.com',
      username: 'tom23559236',
      password: 'gonnacatchyou22',
      __refs: [
        {organizationId: org.id}
      ]
    })

    var req = {
      body: {
        applicationId: app.id,
        applicationSecret: app.secret,
        organizationId: org.id,
        email: user.email,
        password: 'gonnacatchyou22'
      }
    }

    var res = await auth.login(req)

    expect(res).to.be.an('object')
    expect(res.username).to.equal('tom23559236')

    done()

  })

})
