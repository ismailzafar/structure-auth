import Controller from '../controllers/auth'
import Dispatcher from 'structure-dispatcher'

const dispatcher = new Dispatcher()
const dispatch = dispatcher.dispatch
const respond = dispatcher.respond
const express = require('express')
const routes = express.Router()

const controller = new Controller()
import schemaChangePassword from '../schemas/changePassword'
import schemaLogin from '../schemas/login'
import schemaResetPassword from '../schemas/resetPassword'

routes.post(`/login`, schemaLogin, dispatch(controller, 'login'), respond())
routes.post('/users/:email/password/reset', schemaResetPassword, dispatch(controller, 'passwordResetRequest'), respond())
routes.patch('/users/:id/password', schemaChangePassword, dispatch(controller, 'changePassword'), respond())

export default function routeInterface(props = {}) {

  return {
    routeName: 'auth',
    routes
  }

}
