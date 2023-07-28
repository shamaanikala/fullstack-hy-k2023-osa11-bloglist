// kopioidaan notes-backendin middlewaret aluksi
const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  if (process.env.NODE_ENV === 'production' && request.body.password) {
    const loggedBody = { ...request.body, password: '********' }
    logger.info('Body   ', loggedBody)
  } else {
    logger.info('Body   ', request.body)
  }
  logger.info(Date())
  logger.info('---')
  next()
}

// const unknownEndpoint = (request, response) => {
//     response.status(404).send({ error: 'unknown endpoint '})
// }

const errorHandler = (error, request, response, next) => {
  //logger.error(error)
  logger.error(error.message)

  //logger.error(error)
  if (error.name === 'CastError') {
    // PUT
    //return response.status(400).send({ error: `Error while updating likes field: likes must be a number`})
    return response
      .status(400)
      .send({ error: `Error: ${error.name}: ${error.message}` })
  } else if (error.name === 'ValidationError') {
    // https://mongoosejs.com/docs/validation.html#validation-errors
    //console.log(error.errors)
    if (error.errors.likes) {
      //logger.error(error.errors.likes.name) // CastError
      logger.error(error.errors.likes.message)
      return response
        .status(400)
        .send({ error: 'likes field must be a number' })
    } else if (error.errors.url) {
      logger.error(error.errors.url.message)
      // eslint-disable-next-line quotes
      return response.status(400).send({ error: "url field can't be empty" })
    } else if (error.errors.title) {
      logger.error(error.errors.title.message)
      // eslint-disable-next-line quotes
      return response.status(400).send({ error: "title field can't be empty" })
    } else if (
      error.errors.username.message ===
      'Username must have at least 3 characters'
    ) {
      logger.error(error.errors.username.message)
      return response.status(400).send({
        error: `Username must have at least 3 characters (given username was: '${error.errors.username.value}')`,
      })
    }
    //console.log(`Required fields missing ${Object.keys(error.errors)}`)
    //return response.status(400).send({error: `Required fields missing ${Object.keys(error.errors)}`})
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    if (error.message === 'jwt must be provided') {
      logger.error(`Error: ${error.name}: ${error.message}`)
      //return response.status(400).send({ error: 'The token must be provided in the header.' })
      return response.status(401).send({ error: 'token missing or invalid' })
    } else if (error.message === 'invalid signature') {
      logger.error(`Error: ${error.name}: ${error.message}`)
      return response.status(401).send({ error: 'invalid signature' })
    }
  }

  next(error)
}

// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  //console.log(`userExtractor: ${request.token}`)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  //console.log(decodedToken)
  //console.log(request.body)
  const user = await User.findById(decodedToken.id)
  if (user) {
    request.user = user
  }
  next()
}

module.exports = {
  requestLogger,
  //unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
