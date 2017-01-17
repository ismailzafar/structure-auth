import Ajv from 'ajv'
const ajv = new Ajv({
  allErrors: false,
  format: 'full'
})

import {resources as applicationResources} from 'structure-applications'
import {resources as organizationResources} from 'structure-organizations'
import {resources as userResources} from 'structure-users'

const AppModel = applicationResources.models.Application
const OrgModel = organizationResources.models.Organization
const UserModel = userResources.models.User

const appModel = new AppModel()
const orgModel = new OrgModel
const userModel = new UserModel()

/*ajv.addKeyword('bad_app_info', {
  async: true,
  compile: function checkAppInfo(sch, parentSchema) {

    return async function(data) {

      try {
        const res = await this.validateAppSecret(pkg.applicationId, pkg.applicationSecret)

        return true
      }
      catch(e) {
        return false
      }

    }

  }
})*/

ajv.addKeyword('no_email', {
  async: true,
  format: 'email',
  type: 'string',
  compile: function checkDuplicateUserEmail(sch, parentSchema) {

    return async function(data) {

      const res = await userModel.getByEmail(data)

      if(res) return true

      return false

    }
  }
})

ajv.addKeyword('missing_username', {
  async: true,
  type: 'string',
  compile: function checkDuplicateUsername(sch, parentSchema) {

    return async function(data) {

      const res = await userModel.getByUsername(data)

      if(res) return true

      return false

    }
  }
})

const schema = {
  "$async": true,
  "properties": {
    "email": {
      "no_email": {},
      "format": "email",
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "username": {
      "missing_username": {},
      "type": "string"
    }
  },
  "required": ['password']
}

const validate = ajv.compile(schema)

export default function schemaCreate(req, res, next) {

  const pkg = req.body

  // Only support lowercase here, as RethinkDB is case sensitive
  if(pkg.email) pkg.email = pkg.email.toLowerCase()
  if(pkg.username) pkg.username = pkg.username.toLowerCase()

  validate(pkg)
    .then(() => {
      next()
    })
    .catch((res) => {
      next(res.errors)
    })

}
