import Controller from '../controllers/auth'
import Dispatcher from 'structure-dispatcher'

const dispatch = new Dispatcher().dispatch
const express = require('express')
const routes = express.Router()

const controller = new Controller()
import schemaChangePassword from '../schemas/changePassword'
import schemaLogin from '../schemas/login'

routes.post(`/login`, schemaLogin, dispatch(controller, 'login'))
routes.patch('/users/:id/password', schemaChangePassword, dispatch(controller, 'changePassword'))

export default function routeInterface(props = {}) {

  return {
    routeName: 'auth',
    routes
  }

}
