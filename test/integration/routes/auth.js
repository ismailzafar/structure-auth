import r from 'structure-driver'
import codes from '../../../src/lib/error-codes'
import Migrations from 'structure-migrations'
import MockHTTPServer from '../../helpers/mock-http-server'
import pluginsList from '../../helpers/plugins'
import middleware from '../../helpers/middleware'

const server = new MockHTTPServer(middleware)

const createOrgAndApp = async function() {
  // getting an organization and application Ids
  var res0 = await server
    .post(`/api/${process.env.API_VERSION}/organizations`)
    .send({
      title: 'work it'
    })

  const org = res0.body.pkg
  const orgId = org.id

  var app = await server
    .post(`/api/${process.env.API_VERSION}/applications`)
    .set('organizationid', orgId)
    .send({
      desc: '',
      title: 'App 45'
    })

  const appId = app.body.pkg.id

  return {orgId, appId}

}

describe('Routes', function() {

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

  it('should not login a user; bad password', async function() {

    const {orgId, appId} = await createOrgAndApp()

    await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1234@foo.com',
        username: 'tom1234335599',
        password: 'gonnacatchyou22'
      })

    var res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'tom1234335599',
        password: 'gonnacatchyou21'
      })

    expect(res.body.status).to.equal(400)
    expect(res.body.err.code).to.equal(codes.PASSWORD_MISMATCH)

  })

  it('should not login an unknown email', async function() {

    const {orgId, appId} = await createOrgAndApp()

    const res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1237@foo.com',
        password: 'gonnacatchyou22'
      })

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('EMAIL_UNKNOWN')

  })

  it('should not login an unknown username', async function() {

    const {orgId, appId} = await createOrgAndApp()

    const res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('USERNAME_UNKNOWN')

  })

  it('should login a user with username', async function() {

    const {orgId, appId} = await createOrgAndApp()

    await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1238@foo.com',
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })

    const res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })
    const user = res.body.pkg

    expect(res.body.status).to.equal(201)
    expect(user.token).to.be.a('string')
    expect(user.username).to.equal('tom12381355954')
    expect(user.email).to.equal('mail1238@foo.com')

    const res1 = await r.table('auth_tokens').filter({
      token: user.token
    })

    expect(res1.length).to.equal(1)
    expect(res1[0].token).to.equal(user.token)
    expect(res1[0].organizationId).to.equal(orgId)
    expect(res1[0].userId).to.equal(user.id)

  })

  it('should login a user with email', async function() {

    const {orgId, appId} = await createOrgAndApp()

    await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })

    const res = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        password: 'gonnacatchyou22'
      })
    const user = res.body.pkg

    expect(res.body.status).to.equal(201)
    expect(user.token).to.be.a('string')
    expect(user.username).to.equal('tom12391355912')
    expect(user.email).to.equal('mail231239@foo.com')

    const res1 = await r.table('auth_tokens').filter({
      token: user.token
    })

    expect(res1.length).to.equal(1)
    expect(res1[0].token).to.equal(user.token)
    expect(res1[0].organizationId).to.equal(orgId)
    expect(res1[0].userId).to.equal(user.id)

  })

  it('should not login a deleted user by username', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
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
        username: 'tom12391355912',
        password: 'gonnacatchyou22'
      })

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('USERNAME_UNKNOWN')

  })

  it('should not login a deleted user by email', async function() {

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
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

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('EMAIL_UNKNOWN')

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

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('OLDPASSWORD_MISSING')

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

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('NEWPASSWORD_MISSING')

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
    this.timeout(6000)

    const {orgId, appId} = await createOrgAndApp()

    var res0 = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: `mail231239@foo.com`,
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

  it('should not confirm password change; missing passwordResetToken', async function() {

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

    res = await server
      .post(`/api/${process.env.API_VERSION}/auth/users/${user.email}/password/reset/confirm`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail231239@foo.com',
        newPassword: 'gonnacatchyou24',
      })

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('PASSWORDRESETTOKEN_MISSING')

  })

  it('should not confirm password change; missing passwordResetToken', async function() {

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
        passwordResetToken
      })

    expect(res.body.status).to.equal(404)
    expect(res.body.err.code).to.equal('NEWPASSWORD_MISSING')

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

  it('should get 10 most recent token timestamps for a user', async function() {

    const {orgId, appId} = await createOrgAndApp()

    const res = await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'mail1238@foo.com',
        username: 'tom12381355954',
        password: 'gonnacatchyou22'
      })
    const user = res.body.pkg

    async function login() {
      await server
        .post(`/api/${process.env.API_VERSION}/auth/login`)
        .set('organizationid', orgId)
        .set('applicationid', appId)
        .send({
          username: 'tom12381355954',
          password: 'gonnacatchyou22'
        })
    }

    for (let i = 0; i < 11; i++) {
      await login()
    }

    const res2 = await server
      .get(`/api/${process.env.API_VERSION}/auth/users/${user.id}/tokens`)
      .set('organizationid', orgId)
      .set('applicationid', appId)

    expect(res2.body.status).to.equal(200)
    expect(res2.body.pkg.length).to.equal(10)

  })

  it('should return deleted 0 when wiping for user with no tokens', async function() {

    const {orgId, appId} = await createOrgAndApp()

    const res4 = await server
      .delete(`/api/${process.env.API_VERSION}/auth/users/12345/tokens`)
      .set('organizationid', orgId)
      .set('applicationid', appId)

    expect(res4.body.status).to.equal(200)
    expect(res4.body.pkg.deleted).to.equal(0)

  })

  it('should wipe auth tokens for a specific user', async function() {

    const {orgId, appId} = await createOrgAndApp()

    await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'test1@example.com',
        username: 'test1',
        password: 'password1'
      })

    const res1 = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'test1',
        password: 'password1'
      })
    const user1 = res1.body.pkg

    await server
      .post(`/api/${process.env.API_VERSION}/users`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        email: 'test2@example.com',
        username: 'test2',
        password: 'password2'
      })

    const res2 = await server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send({
        username: 'test2',
        password: 'password2'
      })
    const user2 = res2.body.pkg

    const res3 = await r.table('auth_tokens')

    expect(res3.length).to.equal(2)

    const res4 = await server
      .delete(`/api/${process.env.API_VERSION}/auth/users/${user1.id}/tokens`)
      .set('organizationid', orgId)
      .set('applicationid', appId)

    expect(res4.body.status).to.equal(200)
    expect(res4.body.pkg.deleted).to.equal(1)

    const res5 = await r.table('auth_tokens')

    expect(res5.length).to.equal(1)
    expect(res5[0].token).to.equal(user2.token)

  })

})
