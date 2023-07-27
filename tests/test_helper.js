const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

// https://raw.githubusercontent.com/fullstack-hy2020/misc/master/blogs_for_test.md
const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingBlogId = async () => {
  const blog = new Blog({ title: 'nonexistant', url: 'will.be.removed' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const addNewBlog = async () => {
  const uniqueName = `Parsing Html The Cthulhu Way - ${Date.now()}`
  const blog = new Blog({
    title: uniqueName,
    author: 'Jeff Atwood',
    url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/'
  })
  await blog.save()

  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const login = async (username, password) => {
  const loginResponse = await api.post('/api/login')
    .send({ username: username, password: password })

  return loginResponse
}

const addBlogWithUniqueTitle = async () => {
  const uniqueName = `Parsing Html The Cthulhu Way - ${Date.now()}`
  const dummyBlog = {
    title: uniqueName,
    author: 'Jeff Atwood',
    url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/'
  }

  const loginResponse = await login('testi-root','salaisuus')
  const token = loginResponse.body.token

  const result = await api.post('/api/blogs')
    .auth(token, { type: 'bearer' }) // tässä pitää olla bearer pienellä
    .send(dummyBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  result.token = token
  return result
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingBlogId,
  addNewBlog,
  usersInDb,
  login,
  addBlogWithUniqueTitle
}