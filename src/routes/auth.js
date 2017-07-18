import Controller from '../controllers/auth'
import {dispatch} from 'structure-dispatcher'

const express = require('express')
const routes = express.Router()

const controller = new Controller()
import schemaChangePassword from '../schemas/changePassword'
import schemaLogin from '../schemas/login'
import schemaResetPassword from '../schemas/resetPassword'

routes.post(`/login`,                               schemaLogin,          dispatch(controller, 'login'))
routes.post('/users/:email/password/reset/confirm', schemaResetPassword,  dispatch(controller, 'passwordResetConfirm'))
routes.post('/users/:email/password/reset',                               dispatch(controller, 'passwordResetRequest'))
routes.patch('/users/:id/password',                 schemaChangePassword, dispatch(controller, 'changePassword'))

export default function routeInterface(props = {}) {

  return {
    routeName: 'auth',
    routes
  }

}
