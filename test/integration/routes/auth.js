import codes from '../../../src/lib/error-codes'
import Migrations from 'structure-migrations'
import MockHTTPServer from '../../helpers/mock-http-server'
import pluginsList from '../../helpers/plugins'

const server = new MockHTTPServer()

const createOrgAndApp = async function(){
  // getting an organization and application Ids
  var res0 = await new MockHTTPServer()
    .post(`/api/${process.env.API_VERSION}/organizations`)
    .send({
      title: 'work it'
    })

  const org = res0.body.pkg
  const orgId = org.id

  var app = await new MockHTTPServer()
    .post(`/api/${process.env.API_VERSION}/applications`)
    .set('organizationid', orgId)
    .send({
      desc: '',
      title: 'App 45'
    })

  const appId = app.body.pkg.id

  return {orgId, appId}

}

describe.only('Routes', function() {

  before(function() {

    this.migration = new Migrations({
      db: 'test',
      plugins: pluginsList
    })

    return this.migration.process()

  })

  afterEach(function() {
    return this.migration.purge()
  })

  it('should not login a user; missing username', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var pkg = {
      username: 'robthebarron',
      password: 'forgotmywolf'
    }

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send(pkg)

    expect(res.body.status).to.equal(400)
    expect(res.body.err.code).to.equal(codes.MISSING_USERNAME)

  })

  it('should not login a user; bad password', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1234@foo.com',
        username: 'tom1234335599',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'tom1234335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.PASSWORD_MISMATCH)

  })

  it.skip('should not login a user; missing organization', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1235@foo.com',
        username: 'tom1235335599',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        organizationId: 1,
        username: 'tom1235335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.BAD_ORGANIZATION)

  })

  it.skip('should not login a user; missing application', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var org = await server
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1236@foo.com',
        username: 'tom1236335599',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        organizationId: org.id,
        username: 'tom1236335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    //expect(res.body.err.code).to.equal(codes.BAD_APPLICATION)

  })

  it.skip('should not login; missing application secret', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var org = await server
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var app = await server
      .post(`/api/${process.env.API_VERSION}/applications`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        title: 'Pizza ToGoGo',
        desc: 'We dont have a hut but we have dough',
        organizationId: org.id
      })
    app = app.body.pkg

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1237@foo.com',
        username: 'tom1237135590',
        password: 'gonnacatchyou22',
        organizationId: org.id
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
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

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1238@foo.com',
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })

    //expect(res.body.status).to.equal(200)
    expect(res.body.pkg.username).to.equal('tom12381355954')

  })

  it('should login a user with email', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        password: 'gonnacatchyou22'
      })

    //expect(res.body.status).to.equal(200)
    expect(res.body.pkg.username).to.equal('tom12391355912')

  })

  it('should not login a deleted user', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })

    const user = res0.body.pkg

    await server
      .delete(`/api/${process.env.API_VERSION}/users/${user.id}`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send()

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        password: 'gonnacatchyou22'
      })

    //expect(res.body.err.code).to.equal(codes.NO_USER)
    expect(res.body.status).to.equal(400)

  })

  it('should not change password; missing old password', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .patch(`/api/${process.env.API_VERSION}/auth/users/${user.id}/password`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        newPassword: 'gonnacatchyou23'
      })

    expect(res.body.status).to.equal(400)

  })

  it('should not change password; missing new password', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .patch(`/api/${process.env.API_VERSION}/auth/users/${user.id}/password`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        oldPassword: 'gonnacatchyou22'
      })

    expect(res.body.status).to.equal(400)

  })

  it('should not change password; password property not allowed', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .patch(`/api/${process.env.API_VERSION}/auth/users/${user.id}/password`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        password: 'gonnacatchyou22'
      })

    expect(res.body.status).to.equal(400)

  })

  it('should not change password; old password incorrect', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .patch(`/api/${process.env.API_VERSION}/auth/users/${user.id}/password`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        oldPassword: 'gonnacatchyou23',
        newPassword: 'gonnacatchyou23'
      })

    expect(res.body.status).to.equal(400)

  })

  it('should change password', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .patch(`/api/${process.env.API_VERSION}/auth/users/${user.id}/password`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        oldPassword: 'gonnacatchyou22',
        newPassword: 'gonnacatchyou23'
      })

    expect(res.body.status).to.equal(200)

  })

  it('should request password change', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/users/${user.email}/password/reset`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send()

    expect(res.body.status).to.equal(201)
    expect(res.body.pkg).to.be.a('string')

  })

  it('should confirm password change', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/users/${user.email}/password/reset`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send()

    const passwordResetToken = res.body.pkg

    res = await server
      .post(`/api/${process.env.API_VERSION}/auth/users/${user.email}/password/reset/confirm`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        newPassword: 'gonnacatchyou24',
        passwordResetToken
      })

    expect(res.body.status).to.equal(201)
    expect(res.body.pkg).to.be.an('object')

  })

  it.skip('should reset password', async function() {
    this.timeout(5000)

    var org = await server
      .post(`/api/${process.env.API_VERSION}/organizations`)
      .send({
        title: 'Pizza Hut',
        desc: 'We dont have a hut though'
      })
    org = org.body.pkg

    var app = await server
      .post(`/api/${process.env.API_VERSION}/applications`)
      .send({
        title: 'Pizza ToGoGo',
        desc: 'We dont have a hut but we have dough',
        organizationId: org.id
      })
    app = app.body.pkg

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22',
        organizationId: org.id
      })
    const user = res0.body.pkg

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/users/${user.email}/password/reset`)
      .send()

    console.error('res.body', res.body, res.error)

    expect(res.body.status).to.equal(200)

  })

})
