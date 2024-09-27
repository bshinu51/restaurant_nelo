import log4js from 'log4js'

const isDevEnv = process.env.NODE_ENV === 'development'
const logLevel = isDevEnv ? 'debug' : 'info'

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: { type: 'file', filename: '.app.log' },
    errorFile: { type: 'file', filename: '.errors.log' },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: logLevel },
    error: { appenders: ['console', 'errorFile'], level: 'error' },
  },
})

const logger = log4js.getLogger('debug')

export { logger }
