const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const mongoose = require('mongoose')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const path = require('path')

mongoose.set('strictQuery', false)
mongoose.connect(config.mongoUrl)

app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
// ei toimi näin, koska myös get haluaa tokenin
//app.use('/api/blogs', middleware.userExtractor,blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)

  if (process.argv.includes('build')) {
    console.log('Running test with production build frontend...')
    app.use(express.static(path.join(__dirname, 'build')))

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })
  }
}

if (process.env.NODE_ENV === 'production') {
  console.log('Production env: serving build as static site')
  app.use(express.static(path.join(__dirname, 'build')))

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })
}

app.use(middleware.errorHandler)

module.exports = app
