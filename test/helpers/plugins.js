import Plugin from '../../src/index'
import pluginsInteface from 'structure-plugins'
import RootController from 'structure-root-controller'
import RootModel from 'structure-root-model'
import r from './driver'
RootModel.prototype.r = r

import Organizations from 'structure-organizations'
import Applications from 'structure-applications'
import Users from 'structure-users'

const plugins = pluginsInteface({
  Controller: RootController,
  Model: RootModel,
  list: [
    Organizations,
    Applications,
    Users,
    Plugin
  ]
})

export default plugins
