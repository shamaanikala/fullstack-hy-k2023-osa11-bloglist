const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
//const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')


mongoose.set('strictQuery',false)
// TODO Virheenkäsittely tälle
mongoose.connect(config.mongoUrl)

app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

app.use('/api/blogs',blogsRouter)
// ei toimi näin, koska myös get haluaa tokenin
//app.use('/api/blogs', middleware.userExtractor,blogsRouter) 
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler)

module.exports = app