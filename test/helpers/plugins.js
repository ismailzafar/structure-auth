import {errors} from 'structure-dispatcher'
const Plugin = require('../../src/index')

export default [
  'structure-organizations',
  'structure-applications',
  'structure-users',
  'structure-groups',
  Plugin,
  errors()
]
