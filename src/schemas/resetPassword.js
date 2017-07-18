import createSchemaMiddleware from 'structure-validation-schema-middleware'
import keywords from './keywords'

const schema = {
  "$async": true,
  "properties": {
    "email": {
      "known_email": true,
      "lowercase": true,
      "format": "email",
      "type": "string",
    },
    "newPassword": {
      "type": "string"
    },
    "passwordResetToken": {
      "type": "string"
    },
  },
  "required": ['newPassword', 'passwordResetToken']
}

export default createSchemaMiddleware(
  schema,
  null,
  keywords
)
