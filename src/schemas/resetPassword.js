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

ajv.addKeyword('no_email', {
  async: true,
  format: 'email',
  type: 'string',
  compile: function checkEmailExists(sch, parentSchema) {

    return async function(data) {

      const res = await userModel.getByEmail(data)

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
    }
  },
  "required": ['email']
}

const validate = ajv.compile(schema)

export default function schemaCreate(req, res, next) {

  let email = (req.params.email) ? req.params.email.toLowerCase() : null

  validate({email})
    .then(() => {
      next()
    })
    .catch((res) => {
      next(res.errors)
    })

}
