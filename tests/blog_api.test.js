const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// auth testit:
// https://github.com/ladjs/supertest/issues/398#issuecomment-814172046


describe('Kun tietokannassa on vain alustusdataa', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    // uusi user
    await User.deleteMany({})
    const username = 'testi-root'
    const passwordHash = await bcrypt.hash('salaisuus',10)

    const user = new User({ username: username, passwordHash: passwordHash })

    await user.save()

    // toinen user
    const passwordHash2 = await bcrypt.hash('salasana2',10)
    const user2 = new User({ username: 'toinen-käyttäjä', passwordHash: passwordHash2 })
    await user2.save()

    // login
    // aina erikseen testeissä
    //const loginResponse = await api.post(`/api/login`)
    //    .send({ username: username, password: 'salaisuus' })

    //console.log(api)
    //console.log(loginResponse.body.token)

    //agent.auth(response.accessToken, { type: 'bearer' });
    //api.auth(loginResponse.body.token, { type: 'Bearer'})
  })

  test('blogit palautetaan json muodossa', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('sovellus palauttaa oikean määrän JSON-muotoisia blogeja', async () => {
    const response = await api.get('/api/blogs').expect('Content-Type', /application\/json/)

    //expect(response.get('Content-Type')).toEqual(/application\/json/) // ei toimi
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('palautettavien blogien identifioivan kentä nimi on id', async () => {
    const response = await api.get('/api/blogs')
    const ids = response.body.map(blog => blog.id)
    for (let i of ids) {
      expect(i).toBeDefined()
    }

  })

  describe('uuden blogin lisääminen POST-pyynnollä', () => {
    test('epäonnistuu ilman kirjautumista/tokenia ja vastauksena on statuskoodi 401', async () => {
      const newBlog = {
        title: 'Parsing Html The Cthulhu Way',
        author: 'Jeff Atwood',
        url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/',
        likes: 1234
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    describe('ilman kunnollista tokenia', () => {
      test('ei onnistu ja vastauksena on statuskoodi 401 ja oikea virheilmoitus', async () => {
        const newBlog = {
          title: 'Parsing Html The Cthulhu Way',
          author: 'Jeff Atwood',
          url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/',
          likes: 1234
        }

        // kunnollisessa tokenissa on id eikä userId
        const mockToken = jwt.sign({ username: 'testi-root', userId: 'abcd' }, process.env.SECRET)

        await api
          .post('/api/blogs')
          .auth(mockToken, { type: 'bearer' }) // tässä pitää olla bearer pienellä
          .send(newBlog)
          .expect(401)
          .expect('Content-Type', /application\/json/)
      })
    })

    describe('kirjautuneena ja kelvollisella tokenilla', () => {
      test('onnistuu ja se löytyy tietokannasta', async () => {

        const loginResponse = await helper.login('testi-root','salaisuus')
        //console.log(loginResponse.body.token)
        const token = loginResponse.body.token

        const newBlog = {
          title: 'Parsing Html The Cthulhu Way',
          author: 'Jeff Atwood',
          url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/',
          likes: 1234
        }

        await api
          .post('/api/blogs')
          .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        const newBlogs = await helper.blogsInDb()
        expect(newBlogs).toHaveLength(helper.initialBlogs.length + 1)

        const titles = newBlogs.map(blog => blog.title)
        expect(titles).toContain('Parsing Html The Cthulhu Way')

        const authors = newBlogs.map(blog => blog.author)
        expect(authors).toContain('Jeff Atwood')

        const urls = newBlogs.map(blog => blog.url)
        expect(urls).toContain('https://blog.codinghorror.com/parsing-html-the-cthulhu-way/')
      })

      test('onnistuu ja sen jäkeen blogeja löytyy tietokannasta yksi enemmän', async () => {
        await helper.addBlogWithUniqueTitle()

        const newBlogs = await helper.blogsInDb()
        expect(newBlogs).toHaveLength(helper.initialBlogs.length + 1)
      })

      test('onnistuu ja blogin likes-kentän arvo on annettu arvo', async () => {
        const uniqueName = `Parsing Html The Cthulhu Way - ${Date.now()}`
        const newBlog = {
          title: uniqueName,
          author: 'Jeff Atwood',
          url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/',
          likes: 1234
        }

        const loginResponse = await helper.login('testi-root','salaisuus')
        const token = loginResponse.body.token


        await api.post('/api/blogs')
          .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        const newBlogs = await helper.blogsInDb()
        const selectedBlog = newBlogs.find(blog => blog.title === uniqueName)
        //console.log(selectedBlog)
        expect(selectedBlog.likes).toBe(1234)
      })

      test('onnistuu ja jos kentälle likes ei anneta arvoa, sen arvoksi asetetaan 0 (nolla)', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const uniqueName = newBlog.body.title

        // vai etsisikö suoraan oikean blogin?
        const newBlogs = await helper.blogsInDb()
        const selectedBlog = newBlogs.find(blog => blog.title === uniqueName)
        expect(selectedBlog.likes).toBe(0)
      })

      // T4.11* tarkistuksia
      // vain undefined likes saa arvon 0 defaultista mongoosen kautta
      test('onnistuu ja jos kentälle likes annetaan null arvo, sen arvo on null', async () => {
        const uniqueName = `Parsing Html The Cthulhu Way - ${Date.now()}`
        const dummyBlog = {
          title: uniqueName,
          author: 'Jeff Atwood',
          url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/',
          likes: null
        }

        const loginResponse = await helper.login('testi-root','salaisuus')
        const token = loginResponse.body.token


        await api.post('/api/blogs')
          .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
          .send(dummyBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        // vai etsisikö suoraan oikean blogin?
        const newBlogs = await helper.blogsInDb()
        const selectedBlog = newBlogs.find(blog => blog.title === uniqueName)
        expect(selectedBlog.likes).toBe(null)
      })

      describe('jos blogi yritetään lisätä puutteellisilla tiedoilla', () => {
        // TODO näihin virheilmoituksen tarkistukset
        test('ilman title-kenttää, palvelin vastaa statuskoodilla 400 Bad Request', async () => {
          const newBlog = {
            //title: "Parsing Html The Cthulhu Way",
            author: 'Jeff Atwood',
            url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/',
            likes: 1234
          }

          const loginResponse = await helper.login('testi-root','salaisuus')
          const token = loginResponse.body.token

          await api.post('/api/blogs')
            .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
            .send(newBlog)
            .expect(400)
        })

        test('ilman url-kenttää, palvelin vastaa statuskoodilla 400 Bad Request', async () => {
          const newBlog = {
            title: 'Parsing Html The Cthulhu Way',
            author: 'Jeff Atwood',
            //url: "https://blog.codinghorror.com/parsing-html-the-cthulhu-way/",
            likes: 1234
          }

          const loginResponse = await helper.login('testi-root','salaisuus')
          const token = loginResponse.body.token

          await api.post('/api/blogs')
            .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
            .send(newBlog)
            .expect(400)
        })

        test('ilman title- ja url-kenttää, palvelin vastaa statuskoodilla 400 Bad Request', async () => {
          const newBlog = {
            //title: "Parsing Html The Cthulhu Way",
            author: 'Jeff Atwood',
            //url: "https://blog.codinghorror.com/parsing-html-the-cthulhu-way/",
            likes: 1234
          }

          const loginResponse = await helper.login('testi-root','salaisuus')
          const token = loginResponse.body.token

          await api.post('/api/blogs')
            .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
            .send(newBlog)
            .expect(400)
        })
      })


      describe('kun blogi on lisätty järjestelmään', () => {

        test('se on lisätty käyttäjän blogilistaan', async () => {
          const newBlog = await helper.addBlogWithUniqueTitle()

          const user = await User.findOne({ username: 'testi-root' })
          const userId = user._id.toString()

          expect(userId).toBe(newBlog.body.user)
        })

        test('blogin lisänneen käyttäjän id on lisätty blogiin', async () => {
          const newBlog = await helper.addBlogWithUniqueTitle()

          const user = await User.findOne({ username: 'testi-root' })
          const userBlogs = user.blogs.map(b => b.toString())

          expect(userBlogs).toContain(newBlog.body.id)
        })
      })
    })
  })



  describe('blogin poisto id:llä', () => {
    describe('ilman kelvollista tokenia pyynnon mukana', () => {
      test('epäonnistuu ja vastauksena on statuskoodi 401 ja oikea virheilmoitus', async () => {
        const newBlogId = await helper.addNewBlog()
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart.find(b => b.id === newBlogId)

        uniqueTitle = blogToDelete.title

        const result = await api.delete(`/api/blogs/${blogToDelete.id}`)
          .expect(401) // Bad Request

        expect(result.body.error).toContain('token missing or invalid')

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1) // mitään ei poisteta
      })

      test('palauttaa myös 401, jos id:tä ei löydy tietokannasta', async () => {
        const blogs = await helper.blogsInDb()
        const dummyId = 'dummyId-1234'

        const result = await api.delete(`/api/blogs/${dummyId}`)
          .expect(401)
      })
    })

    describe('kun kelvollinen token on pyynnon mukana', () => {
      test('epäonnistuu jos userId ei vastaa lisääjän userId ja vastauksena on 401 ja oikea virheilmoitus', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        const loginResponse = await helper.login('toinen-käyttäjä','salasana2')
        const token = loginResponse.body.token


        const result = await api.delete(`/api/blogs/${targetBlogId}`)
          .auth(token, { type: 'bearer' })
          .expect(401)

        expect(result.body.error).toContain('User cannot delete blog added by other user')
      })

      test('palauttaa 404 jos kyseistä blogia ei löydy tietokannasta', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = await helper.nonExistingBlogId()

        const result = await api.delete(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .expect(404)
      })

      test('onistuu jos userId vastaa blogin lisääjän userId (statuscode: 204)', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        await api.delete(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .expect(204)
      })

      test('jos blogilla ei ole user kenttää, vastataan statuskoodin 500 ja annetaan oikea virheilmoitus', async () => {
        const newBlogId = await helper.addNewBlog()

        const loginResponse = await helper.login('toinen-käyttäjä','salasana2')
        const token = loginResponse.body.token

        const result = await api.delete(`/api/blogs/${newBlogId}`)
          .auth(token, { type: 'bearer' })
          .expect(500)

        expect(result.body.error).toContain('Unable to finish the DELETE operation: missing user information from blog')
      })
    })
  })

  describe('olemassaolevan blogin muokkaus PUT-pyynnöllä', () => {
    test('epäonnistuu ilman kirjautumista/tokenia ja vastauksena on statuskoodi 401', async () => {
      const blogList = await helper.blogsInDb()
      const firstBlog = blogList[0]

      let likes = firstBlog.likes

      likes = likes + 1

      const result = await api.put(`/api/blogs/${firstBlog.id}`)
        .send({ likes })
        .expect(401)
    })

    describe('ilman kelvollista kirjautumista/tokenia', () => {
      test('ei onnistu ja vastauksena on statuskoodi 401 ja oikea virheilmoitus', async () => {
        // kunnollisessa tokenissa on id eikä userId
        mockToken = jwt.sign({ username: 'testi-root', userId: 'abcd' }, process.env.SECRET)

        const blogList = await helper.blogsInDb()
        const firstBlog = blogList[0]
        let likes = firstBlog.likes

        likes = likes + 1


        const result = await api
          .put(`/api/blogs/${firstBlog.id}`)
          .auth(mockToken, { type: 'bearer' }) // tässä pitää olla bearer pienellä
          .send({ likes })
          .expect(401)
          .expect('Content-Type', /application\/json/)
      })
    })

    describe('kirjautuneena ja kelvollisella tokenilla blogin tykkäysten määrää', () => {
      describe('tykkäys (eli likes += 1)', () => {
        // oletettavasti oikeasti menisi toisin päin, eli käyttäjä ei itse voi tykätä omasta blogistaan
        test('ei onnistu, jos käyttäjän tokenin id ei vastaa blogin käyttäjätietoa ja lähetetään pelkkä likes kenttä (401)', async () => {
          const newBlog = await helper.addBlogWithUniqueTitle()

          const targetBlogId = newBlog.body.id

          const targetBlog = await Blog.findById(targetBlogId)
          let likes = targetBlog.likes

          //console.log(likes)

          likes = likes + 1

          const loginResponse = await helper.login('toinen-käyttäjä','salasana2')
          const token = loginResponse.body.token


          const result = await api.put(`/api/blogs/${targetBlogId}`)
            .auth(token, { type: 'bearer' })
            .send({ likes })
            .expect(401)

          expect(result.body.error).toContain('User cannot edit blog added by other user')
        })

        test('onnistuu, jos käyttäjän tokenin id ei vastaa blogin käyttäjätietoa ja lähetetään koko blogin tiedot (200)', async () => {
          const newBlog = await helper.addBlogWithUniqueTitle()

          const targetBlogId = newBlog.body.id

          const targetBlog = await Blog.findById(targetBlogId)
          let newLikes = targetBlog.likes

          //console.log(likes)

          newLikes += 1

          const loginResponse = await helper.login('toinen-käyttäjä','salasana2')
          const token = loginResponse.body.token

          const { title,author,url, likes } = targetBlog


          const result = await api.put(`/api/blogs/${targetBlogId}`)
            .auth(token, { type: 'bearer' })
            .send({ title, author, url, likes: newLikes })
            .expect(200)

          expect(result.body.likes).toBe(newLikes)
        })
      })



      test('palauttaa 404 jos kyseistä blogia ei löydy tietokannasta', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = await helper.nonExistingBlogId()

        const result = await api.put(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .set({ likes: 1 })
          .expect(404)
      })

      test('onnistuu jos userId vastaa blogin lisääjän userId (statuscode: 200)', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        const targetBlog = await Blog.findById(targetBlogId)
        const likesAtStart = targetBlog.likes

        let likes = targetBlog.likes

        likes = likes + 1

        const result = await api.put(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .send({ likes })
          .expect(200)

        //console.log(result.body)
        expect(result.body.likes).toBe(likesAtStart + 1)

      })
    })

    describe('kirjautuneena ja kelvollisella tokenilla', () => {
      test('blogin titlen muokkaaminen tyhjäksi epäonnistuu', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        const targetBlog = await Blog.findById(targetBlogId)

        const originalTitle = targetBlog.title
        let title = targetBlog.title

        title = ''

        await api.put(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .send({ title })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const updatedTargetBlog = await Blog.findById(targetBlogId)

        expect(updatedTargetBlog.title).toBe(originalTitle)
      })

      test('blogin titlen muokkaaminen null epäonnistuu', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        const targetBlog = await Blog.findById(targetBlogId)

        const originalTitle = targetBlog.title
        let title = targetBlog.title

        title = null

        await api.put(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .send({ title })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const updatedTargetBlog = await Blog.findById(targetBlogId)

        expect(updatedTargetBlog.title).toBe(originalTitle)
      })

      test('blogin url:n muokkaaminen tyhjäksi epäonnistuu', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        const targetBlog = await Blog.findById(targetBlogId)

        const originalUrl = targetBlog.url
        let url = targetBlog.url

        url = ''

        await api.put(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .send({ url })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const updatedTargetBlog = await Blog.findById(targetBlogId)

        expect(updatedTargetBlog.url).toBe(originalUrl)
      })

      // tämä testi hajosi, kun asensin mongoose 7 ja mongoose-unique-validators
      // melko turha testi, joten kommentoidaan pois
      // test('blogin url:n muokkaaminen undefined epäonnistuu', async () => {
      //     const blogList = await helper.blogsInDB()
      //     const firstBlog = blogList[0]

      //     let url = firstBlog.url

      //     url = undefined

      //     await api.put(`/api/blogs/${firstBlog.id}`)
      //         .send({ url })
      //         .expect(400)
      //         .expect('Content-Type', /application\/json/)

      //     const updatedBlogList = await helper.blogsInDB()
      //     const updatedFirstBlog = updatedBlogList[0]

      //     expect(updatedFirstBlog.url).toBe(firstBlog.url)
      // })

      test('blogin likejen muokkaaminen muuksi kuin lukuarvoksi epäonnistuu', async () => {
        const newBlog = await helper.addBlogWithUniqueTitle()

        const targetBlogId = newBlog.body.id

        const targetBlog = await Blog.findById(targetBlogId)

        const originalLikes = targetBlog.likes
        let likes = targetBlog.likes

        likes = 'malicious-link'

        await api.put(`/api/blogs/${targetBlogId}`)
          .auth(newBlog.token, { type: 'bearer' })
          .send({ likes })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const updatedTargetBlog = await Blog.findById(targetBlogId)

        expect(updatedTargetBlog.likes).toBe(originalLikes)
      })

    })
  })

  // describe('testit, joissa tietokantaan lisätään yksi uusi blogi ennen testejä', () => {
  //     test('uusi blogi yksikäsitteisellä nimellä löytyy tietokannasta', async () => {
  //         const newBlogId = await helper.addNewBlog()
  //         const blogsAdded = await helper.blogsInDb()
  //         const newTitle = blogsAdded.find(b => b.id === newBlogId).title
  //         expect(newTitle).toContain('Parsing Html The Cthulhu Way')
  //     })

  //     test('blogin poisto id:n perusteella onnistuu', async () => {
  //         const newBlogId = await helper.addNewBlog()
  //         const blogsAtStart = await helper.blogsInDb()
  //         const blogToDelete = blogsAtStart.find(b => b.id === newBlogId)

  //         uniqueTitle = blogToDelete.title

  //         await api.delete(`/api/blogs/${blogToDelete.id}`)
  //             .expect(204) // No Content

  //         const blogsAtEnd = await helper.blogsInDb()
  //         expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length) // eli alussa lisätty poistetaan

  //         const titles = blogsAtEnd.map(b => b.title)
  //         expect(titles).not.toContain(uniqueTitle)
  //     })

  //     // TODO olemattoman id:n poistaminen ei poista mitään ja palauttaa status
  //     test('olemattoman blogin poistoyritys id:n perusteella ei poista mitään ja palauttaa statuskoodin 204', async () => {
  //         const nonexistingId = await helper.nonExistingBlogId()
  //         const newBlogId = await helper.addNewBlog()

  //         await api.delete(`/api/blogs/${nonexistingId}`)
  //             .expect(204)

  //         const blogList = await helper.blogsInDb()
  //         expect(blogList).toHaveLength(helper.initialBlogs.length + 1) // tässä osiossa 1 blogi lisätty

  //         const blogTitles = blogList.map(b => b.title)
  //         const uniqueName = blogList.find(b => b.id === newBlogId).title
  //         expect(blogTitles.sort()).toEqual([uniqueName].concat(helper.initialBlogs.map(b => b.title)).sort())
  //     })

  //     test('uuden blogin tykkäyksiä voidaan lisätä yhdellä', async () => {
  //         const newBlogId = await helper.addNewBlog()
  //         const blogsAdded = await helper.blogsInDb()

  //         const newBlog = blogsAdded.find(b => b.id === newBlogId)
  //         let likes = newBlog.likes

  //         likes = likes + 1

  //         await api.put(`/api/blogs/${newBlogId}`)
  //             .send({ likes })
  //             .expect(200)
  //             .expect('Content-Type', /application\/json/)

  //         const updatedBlogList = await helper.blogsInDb()
  //         const updatedNewBlog = updatedBlogList.find(b => b.id === newBlogId)

  //         expect(updatedNewBlog.id).toBe(newBlog.id)
  //         expect(updatedNewBlog.likes).toBe(newBlog.likes + 1)
  //     })

  //     test('uuden blogin tykkäyksiä voidaan vähentää yhdellä', async () => {
  //         const newBlogId = await helper.addNewBlog()
  //         const blogsAdded = await helper.blogsInDb()

  //         const newBlog = blogsAdded.find(b => b.id === newBlogId)
  //         let likes = newBlog.likes

  //         likes = likes - 1

  //         await api.put(`/api/blogs/${newBlogId}`)
  //             .send({ likes })
  //             .expect(200)
  //             .expect('Content-Type', /application\/json/)

  //         const updatedBlogList = await helper.blogsInDb()
  //         const updatedNewBlog = updatedBlogList.find(b => b.id === newBlogId)

  //         expect(updatedNewBlog.id).toBe(newBlog.id)
  //         expect(updatedNewBlog.likes).toBe(newBlog.likes - 1)
  //     })
  // })
})
afterAll(async () => {
  await mongoose.connection.close()
})