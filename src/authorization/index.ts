import { errors } from 'task-manager-model-ts'
import jwt from 'jsonwebtoken'
import { SwaggerSecurityHandler } from 'swagger-tools'
import config from '../config'

errors.register({
  ApiAuthKeyIsMissing: 401,
  InvalidAuthKey: 401,
})

export const apiKeyAuth: SwaggerSecurityHandler = (req, definition, apiKey, cb) => {
  if (!apiKey) {
    cb(new errors.ApiAuthKeyIsMissingError())
    return
  }
  try {
    const credentials: any = jwt.verify(apiKey as string, config.secret.jwt)
    req.trailers.credentials = credentials
    cb()
  } catch (err) {
    cb(new errors.InvalidAuthKeyError())
  }
}

export const getToken = (id: any, role: any) => {
  return jwt.sign({ id, role }, config.secret.jwt, config.jwtOptions)
}
