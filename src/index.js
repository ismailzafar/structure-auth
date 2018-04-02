import Controller from './controllers/auth'
import migrations from './migrations/auth'
import Model from './models/auth'
import routes from './routes/auth'
import authenticateAuthToken from './middleware/auth-token'
import isWhiteListedUrl from './whitelist'

export default function pluginInterface(options = {}) {

  return routes(options)

}

const resources = {
  controllers: {
    Auth: Controller
  },
  models: {
    Auth: Model
  }
}

const settings = {
  migrations,
  pluginName: 'auth'
}

export {resources}
export {settings}
export {authenticateAuthToken}
export {isWhiteListedUrl}
