import {errors, respond} from 'structure-dispatcher'
import {plugins} from 'structure-middleware'
import {authenticateApplicationEntity} from 'structure-auth-entity'

export default [
  authenticateApplicationEntity,
  plugins,
  respond(),
  errors()
]
