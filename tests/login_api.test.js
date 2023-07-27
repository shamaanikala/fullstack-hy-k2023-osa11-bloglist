const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

describe('jos POST pyynnössä on viallinen token', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const username = 'testi-root'
    const passwordHash = await bcrypt.hash('salaisuus', 10)

    const user = new User({ username: username, passwordHash: passwordHash })

    await user.save()

    // toinen user
    const passwordHash2 = await bcrypt.hash('salasana2', 10)
    const user2 = new User({
      username: 'toinen-käyttäjä',
      passwordHash: passwordHash2,
    })
    await user2.save()
  })

  describe('verify-token palauttaa statuskoodin 401 ja oikean virheilmoituksen', () => {
    test('kun huono token ton tehty jsonwebtoken.sign() funktiolla', async () => {
      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1sdXVra2FpIiwiaWQiOiI2NDM2NWQ0YzEzNzc3NGU1NGIxZjk2NzUiLCJpYXQiOjE2ODE2NTM5NzQsImV4cCI6MTY4MTY1NzU3NH0.ioBRQtVi78j6b85kgSxNpK2aI4QBlwSHWEjDE-1URAo
      const dummyUser = { username: 'testi-root' }
      const mockToken = jwt.sign(
        { username: 'testi-root', userId: 'abcd' },
        process.env.SECRET
      )

      const result = await api
        .post('/api/login/verify-token')
        .auth(mockToken, { type: 'bearer' }) // tässä pitää olla bearer pienellä
        .send(dummyUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('token invalid')
    })

    test('kun huono token on kopioitu jsonwebtokenin luomasta tokenista', async () => {
      const dummyUser = { username: 'testi-root' }
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1sdXVra2FpIiwiaWQiOiI2NDM2NWQ0YzEzNzc3NGU1NGIxZjk2NzUiLCJpYXQiOjE2ODE2NTM5NzQsImV4cCI6MTY4MTY1NzU3NH0.ioBRQtVi78j6b85kgSxNpK2aI4QBlwSHWEjDE-1URAo'

      const result = await api
        .post('/api/login/verify-token')
        .auth(mockToken, { type: 'bearer' }) // tässä pitää olla bearer pienellä
        .send(dummyUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('invalid signature')
    })
  })
})

describe('jos POST-pyynnössä on kelvollinen token', () => {
  test('verify-token palauttaa 200', async () => {
    const user = { username: 'testi-root', password: 'salaisuus' }
    const loginResponse = await helper.login(user.username, user.password)
    const token = loginResponse.body.token

    await api
      .post('/api/login/verify-token')
      .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
      .send({ username: user.username })
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('verify-token palauttaa 401, jos käyttäjä on vaihtanut username', async () => {
    const user = { username: 'testi-root', password: 'salaisuus' }
    const loginResponse = await helper.login(user.username, user.password)
    const token = loginResponse.body.token

    const mockUser = { username: 'toinen-käyttäjä' }

    await api
      .post('/api/login/verify-token')
      .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
      .send(mockUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  // Tällä testillä voi testata vanhentuvaa tokenia.
  // Tällä hetkellä kyseinen toiminnallisuus ei ole päällä
  // test('voiko käyttää vanhaa omaa tokenia', async () => {
  //   const user = { username: 'testi-root', password: 'salaisuus' }
  //   const loginResponse = await helper.login(user.username, user.password)
  //   const oldToken = loginResponse.body.token

  //   // eslint-disable-next-line no-unused-vars
  //   const newLoginResponse = await helper.login(user.username, user.password)
  //   // eslint-disable-next-line no-unused-vars
  //   const token = loginResponse.body.token

  //   await api
  //     .post('/api/login/verify-token')
  //     .auth(oldToken, { type: 'bearer' }) // tässä pitää olla bearer pienellä
  //     .send({ username: user.username })
  //     .expect(401)
  //     .expect('Content-Type', /application\/json/)
  // })
})
