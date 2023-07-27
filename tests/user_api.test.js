const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')

describe('kun tietokannassa on jo yksi käyttäjä', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salaisuus',10)
    const user = new User({ username: 'testi-root', passwordHash })

    await user.save()
  })

  test('tuo yksi käyttäjä löytyy tietokannasta', async () => {
    const usersInDb = await helper.usersInDb()

    expect(usersInDb).toHaveLength(1)
  })

  test('uuden käyttäjän voi lisätä, kun käyttäjänimi on käyttämätön', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api.post('/api/users').send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('uutta käyttäjää samalla nimellä ei voida luoda ja pyyntö palauttaa koodin 400', async () => {
    const usersAtStart = await helper.usersInDb()

    const badNewUser = {
      username: 'testi-root',
      name: 'Tätä Ei Tarvitsisi',
      password: 'salasana',
    }

    const result = await await api.post('/api/users').send(badNewUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    //console.log(result.body.error)
    //expect(result.body)
  })

  test('uutta käyttäjää samalla nimellä ei voida luoda ja pyyntö palauttaa oikean virheilmoituksen', async () => {
    const usersAtStart = await helper.usersInDb()

    const badNewUser = {
      username: 'testi-root',
      name: 'Tätä Ei Tarvitsisi',
      password: 'salasana',
    }

    const result = await api.post('/api/users').send(badNewUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    //console.log(result.body.error)
    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  describe('uutta käyttäjää ei voi luoda', () => {
    test('jos käyttäjänimi on alle 3 merkkiä pitkä ja pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: 'ab',
        name: 'Tätä Ei Tarvitsisi',
        password: 'salasana',
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain(`Username must have at least 3 characters (given username was: '${badNewUser.username}')`)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos salasana on alle 3 merkkiä pitkä ja pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: 'yksikäsitteinen',
        name: 'Tätä Ei Tarvitsisi',
        password: 's',
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('Password must have at least 3 characters')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos käyttäjänimi on tyhjä merkkijono, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: '',
        name: 'Tätä Ei Tarvitsisi',
        password: 'salasana',
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('`username` is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos käyttäjänimi on undefined, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: undefined,
        name: 'Tätä Ei Tarvitsisi',
        password: 'salasana',
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('`username` is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos käyttäjänimi on null, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: null,
        name: 'Tätä Ei Tarvitsisi',
        password: 'salasana',
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('`username` is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos salasana on tyhjä merkkijono, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: 'käyttäjänimi',
        name: 'Tätä Ei Tarvitsisi',
        password: '',
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('`password` is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos salasana on undefined, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: 'käyttäjänimi',
        name: 'Tätä Ei Tarvitsisi',
        password: undefined,
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('`password` is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos käyttäjänimi on null, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: 'käyttäjänimi',
        name: 'Tätä Ei Tarvitsisi',
        password: null,
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('`password` is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('jos sekä käyttäjänimi että salasana puuttuvat, pyyntö palauttaa koodin 400 sekä oikean virheilmoituksen', async () => {
      const usersAtStart = await helper.usersInDb()

      const badNewUser = {
        username: undefined,
        name: 'Tätä Ei Tarvitsisi',
        password: null,
      }

      const result = await api.post('/api/users').send(badNewUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      //console.log(result.body.error)
      expect(result.body.error).toContain('User creation failed: data missing for required `username`, `password`.')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})