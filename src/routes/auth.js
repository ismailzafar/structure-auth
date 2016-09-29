import Controller from '../controllers/auth'
import Dispatcher from 'structure-dispatcher'

const dispatch = new Dispatcher().dispatch
const express = require('express')
const routes = express.Router()

export default function routeInterface(props = {}) {

  const controller = new Controller()

  routes.post(`/login`, dispatch(controller, 'login'))

  return {
    routeName: 'auth',
    routes
  }

}
