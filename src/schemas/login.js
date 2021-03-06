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
    "password": {
      "type": "string"
    },
    "username": {
      "known_username": true,
      "type": "string"
    }
  },
  "required": ['password']
}

export default createSchemaMiddleware(
  schema,
  null,
  keywords
)
