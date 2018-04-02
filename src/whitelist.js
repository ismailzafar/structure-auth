const apiRoot = `/api/${process.env.API_VERSION}`
const whitelistedRoutes = [
  ['GET', `${apiRoot}$`],
  ['POST', `${apiRoot}/sync`],
  ['POST', `${apiRoot}/auth/login$`],
  ['POST', `${apiRoot}/auth/users/.*/password/reset`],
  ['GET', `${apiRoot}/users/existence/.*$`],
  ['POST', `${apiRoot}/users$`]
]

module.exports = function isWhiteListedUrl(req) {

  for (const route of whitelistedRoutes) {

    if (route[0] !== req.method) {
      continue
    }

    const re = new RegExp(route[1])

    if (re.test(req.originalUrl)) {
      return true
    }

  }

  return false

}
