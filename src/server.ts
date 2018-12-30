import fs from 'fs'
import path from 'path'
import jsyaml from 'js-yaml'
import express from 'express'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import swaggerTools from 'swagger-tools'
import log4js from 'log4js'
import { snakeCase } from 'lodash'
import { Manager } from 'task-manager-model-ts'

import config from './config'
import errors from './errors'
import controllers from './controllers'
import { apiKeyAuth } from './authorization'

log4js.configure({
  appenders: {
    out: { type: 'stdout', level: 'trace' },
    logFile: {
      type: 'dateFile', filename: 'logs/api', pattern: 'yyyyMMdd.log', alwaysIncludePattern: true, level: 'trace',
    },
  },
  categories: {
    default: { appenders: ['logFile', 'out'], level: 'trace' },
  },
})
export const logger = log4js.getLogger()

const server = async(isDev: boolean = false, isTest: boolean = false) => {
  if (isDev) {
    logger.level = 'INFO'
  }

  let { port } = config.server
  const instance = process.env.NODE_APP_INSTANCE
  if (instance) port += instance

  // loading swagger config
  const spec = fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8')
  const swagger = jsyaml.safeLoad(spec)
  swagger.host = config.swagger.host
  swagger.schemes = config.swagger.schemes

  // create/update db version
  try {
    const pgConfig = {
      pgConfig: {
        database: config.database,
        secret: config.secret,
      }
    }
    const manager = new Manager.PgManager(pgConfig)
    await manager.update()
    logger.info(`database version: ${manager.version}`)
  } catch (err) {
    return logger.error(err)
  }

  const app = express()
  const corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Key'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  app.use(fileUpload({ limits: { fileSize: 500 * 1024 * 1024 } }))

  const apiRouter = express.Router()

  if (isDev && !isTest) {
    const logMiddleware = log4js.connectLogger(
      logger,
      { level: 'auto', format: ':method :url :status :response-timems' },
    )
    apiRouter.use(/^((?!notification|message).)*$/, logMiddleware)
  }

  // simulate delay for development env
  app.use((req, res, next) => {
    setTimeout(next, 1000)
  })

  swaggerTools.initializeMiddleware(swagger, (middleware) => {
    apiRouter.use(middleware.swaggerMetadata())
    apiRouter.use(middleware.swaggerSecurity({
      apiKeyAuth,
    }))

    const options = {
      controllers,
      useStubs: isDev && !isTest, // Conditionally turn on stubs (mock mode)
      ignoreMissingHandlers: isDev && !isTest,
    }

    // Route validated requests to appropriate controller
    apiRouter.use(middleware.swaggerRouter(options))

    apiRouter.use((req, res, next) => {
      if (req.xhr) {
        res.header('Cache-Control', 'max-age=0, private, must-revalidate')
        res.header('Pragma', 'no-cache')
        res.header('Expires')
      }
      next()
    })

    // error handling
    apiRouter.use((err, req, res, next) => {
      if (!err.statusCode && !err.failedValidation) {
        logger.error(err)
      }
      let error: any = {}
      let statusCode = 500
      if (typeof err === 'string') {
        const e = new errors.InternalError()
        error.code = snakeCase(e.name).toUpperCase()
        error.message = `${errors.lang(e)} (${err})` || e.name
      } else if (err.failedValidation) {
        statusCode = 400
        error = err
      } else if (err.name) {
        error.code = snakeCase(err.name).toUpperCase()
        error.message = errors.lang(err) || err.name
        statusCode = err.statusCode || statusCode
      } else {
        error.code = err.code
        error.message = err.message
        statusCode = err.statusCode || statusCode
      }
      res.status(statusCode).send({ error })
      next()
     })
  })

  app.use('/docs', express.static('node_modules/swagger-ui/dist'))
  app.use('/files', express.static('files'))

  app.get('/api-docs', (req, res) => {
    res.json(swagger)
  })

  app.use('/', apiRouter)

  if (isTest) return app

  return app.listen(port, () => {
    logger.info(`server [${config.name}] running on port: ${port}`)
  })
}

export default () => server().catch((err: any) => {
  logger.error(err)
  throw err
})