import Dispatcher from 'structure-dispatcher'
import request from 'supertest-as-promised'
import Router from 'structure-router'
import Server from 'structure-server'

import plugins from './plugins'

function MockHTTPServer(options = {}) {

  const api = new Server({
    router: new Router({
      dispatcher: new Dispatcher(),
      routes: plugins.routes
    })
  })

  return request(api.server)
}

export default MockHTTPServer
