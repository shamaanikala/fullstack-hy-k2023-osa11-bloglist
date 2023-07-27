const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)


  // voiko tämän siirtää virheidenkäsittely middlewarelle?
  // onko siinä järkeä?
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response.status(200)
    .send({ token, username: user.username, name: user.name })
})

// oma funktio T5.2
loginRouter.post('/verify-token', async (request, response) => {
  const username = request.body.username
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  // tarkistus, jos joku vaihtaa usernamen
  if (username !== decodedToken.username) {
    logger.info('login.js: verify-token: request.body.username differs from token.username!')
    logger.info(`${username}, ${decodedToken.username}`)
    logger.info(Date())
    return response.status(401).json({ error: 'token invalid' })
  }
  return response.status(200).send({ username })
})

module.exports = loginRouter