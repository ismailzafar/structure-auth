import controllerInterface from './controllers/auth'
import migrations from './migrations/auth'
import modelInterface from './models/auth'
import routesInterface from './routes/auth'

export default function pluginInterface(props = {}) {

  const RootController = props.Controller
  const RootModel = props.Model

  const AuthModel = modelInterface(RootModel)
  const Controller = controllerInterface({
    AppModel: props.plugins.applications.Model,
    AuthModel,
    Controller: RootController,
    Model: RootModel,
    OrgModel: props.plugins.organizations.Model,
    UserModel: props.plugins.users.Model
  })

  return {
    migrations,
    routeName: 'auth',
    routes: routesInterface({
      Controller
    })
  }

}
