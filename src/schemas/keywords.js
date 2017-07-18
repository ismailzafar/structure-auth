import {UserModel} from 'structure-users'

const userModel = new UserModel()

export default {
  "known_email": {
    "async": true,
    "format": "email",
    "type": "string",
    "compile": (sch, parentSchema) => {

      return async function(data) {

        const res = await userModel.getByEmail(data.toLowerCase())

        if (res) return true

        return false

      }
    },
    "errorHandler": function() {
      return {
        errorCode: "EMAIL_UNKNOWN",
        statusCode: 404
      }
    }
  },
  "known_username": {
    "async": true,
    "type": 'string',
    "compile": (sch, parentSchema) => {

      return async function(data) {

        const res = await userModel.getByUsername(data.toLowerCase())

        if (res) return true

        return false

      }
    },
    "errorHandler": function() {
      return {
        errorCode: "USERNAME_UNKNOWN",
        statusCode: 404
      }
    }
  }
}
