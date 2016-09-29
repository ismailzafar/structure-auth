import codes from '../../../src/lib/error-codes'
import migrationItems from '../../../src/migrations/auth'
import Migrations from 'structure-migrations'
import MockHTTPServer from '../../helpers/mock-http-server'
import pluginsList from '../../helpers/plugins'
import r from '../../helpers/driver'
import RootModel from 'structure-root-model'

Migrations.prototype.r = r

describe('Routes', function() {

  beforeEach(function() {

    this.migration = new Migrations({
      db: 'test',
      plugins: pluginsList
    })

    return this.migration.process()

  })

  afterEach(function() {
    return this.migration.purge()
  })

  it('should not login a user; missing login data', async function() {

    var pkg = {
      username: 'robthebarron',
      password: 'forgotmywolf'
    }

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send(pkg)

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.BAD_DATA)

  })

  it('should not login a user; no user', async function() {

    var pkg = {
      username: 'robthebarron',
      password: 'forgotmywolf'
    }

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send(pkg)

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.NO_USER)

  })

  it('should not login a user; bad password', async function() {

    var res0 = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail1234@foo.com',
        username: 'tom1234335599',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send({
        username: 'tom1234335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.PASSWORD_MISMATCH)

  })

  it('should not login a user; missing organization', async function() {

    var res0 = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail1235@foo.com',
        username: 'tom1235335599',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send({
        organizationId: 1,
        username: 'tom1235335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.BAD_ORGANIZATION)

  })

  it('should not login a user; missing application', async function() {

    var org = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var res0 = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail1236@foo.com',
        username: 'tom1236335599',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send({
        organizationId: org.id,
        username: 'tom1236335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.BAD_APPLICATION)

  })

  it('should not login; missing application secret', async function() {

    var org = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var app = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/applications`)
      .send({
        title: 'Pizza ToGoGo',
        desc: 'We dont have a hut but we have dough',
        organizationId: org.id
      })
    app = app.body.pkg

    var res0 = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail1237@foo.com',
        username: 'tom1237135590',
        password: 'gonnacatchyou22',
        organizationId: org.id
      })
    const user = res0.body.pkg

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send({
        applicationId: app.id,
        organizationId: org.id,
        username: 'tom1237135590',
        password: 'gonnacatchyou22'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.BAD_APPLICATION)

  })

  it('should login a user with username', async function() {

    var org = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var app = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/applications`)
      .send({
        title: 'Pizza ToGoGo',
        desc: 'We dont have a hut but we have dough',
        organizationId: org.id
      })
    app = app.body.pkg

    var res0 = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail1238@foo.com',
        username: 'tom12381355954',
        password: 'gonnacatchyou22',
        organizationId: org.id
      })
    const user = res0.body.pkg

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send({
        applicationId: app.id,
        applicationSecret: app.secret,
        organizationId: org.id,
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })

    //expect(res.body.status).to.equal(200)
    expect(res.body.pkg.username).to.equal('tom12381355954')

  })

  it('should login a user with email', async function() {

    var org = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var app = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/applications`)
      .send({
        title: 'Pizza ToGoGo',
        desc: 'We dont have a hut but we have dough',
        organizationId: org.id
      })
    app = app.body.pkg

    var res0 = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22',
        organizationId: org.id
      })
    const user = res0.body.pkg

    var res = await new MockHTTPServer()
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .send({
        applicationId: app.id,
        applicationSecret: app.secret,
        organizationId: org.id,
        email: 'mail231239@foo.com',
        password: 'gonnacatchyou22'
      })

    //expect(res.body.status).to.equal(200)
    expect(res.body.pkg.username).to.equal('tom12391355912')

  })

})
