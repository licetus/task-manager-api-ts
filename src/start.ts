import server from './server'

process.env.NODE_ENV = 'development'
const instance = process.env.NODE_APP_INSTANCE

if (!instance || instance === '0') server()
else setTimeout(server, 1000)
