import express from 'express'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import swaggerTools from 'swagger-tools'
import log4js from 'log4js'
import { PgManager, Task } from 'task-manager-model-ts'

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

const server = async(isDev: boolean, isTest: boolean) => {
  if (isDev) {
    logger.level = 'INFO'
  }

  let { port } = config.server
}