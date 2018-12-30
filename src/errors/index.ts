import { errors } from 'task-manager-model-ts'

const locales = require(`../config/${process.env.NODE_ENV || 'development'}.json`).locales
const localization = require(`./locale.${locales}.json`)

errors.update(localization)

errors.register({
  NotAuthorize: 400,
  NotAuthenticate: 400,
  ApiAuthKeyIsMissing: 400,
  InvalidVerifyCode: 400,
  InvalidMobileNumber: 400,
  InvalidEmail: 400,
  AccountExist: 400,
  NoFileFound: 400,
  SaveFileFailed: 400,
  FileSizeExtendLimit: 400,
  SuperAdmin: 400,
})

export default errors
