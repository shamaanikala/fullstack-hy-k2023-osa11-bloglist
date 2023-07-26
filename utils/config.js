require('dotenv').config()

//const PORT = 3003
// Ex11.20 React uses the .env variable PORT
const PORT = process.env.BACKEND_PORT

const mongoUrl =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

module.exports = {
  mongoUrl,
  PORT,
}
