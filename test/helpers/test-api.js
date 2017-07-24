export default class TestAPI {

  constructor(server) {
    this.server = server
  }

  async login(orgId, appId, pkg) {
    return await this.server
      .post(`/api/${process.env.API_VERSION}/auth/login`)
      .set('organizationid', orgId)
      .set('applicationid', appId)
      .send(pkg)
  }

}
