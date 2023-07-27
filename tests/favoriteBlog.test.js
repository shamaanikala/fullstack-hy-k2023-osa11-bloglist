const listHelper = require('../utils/list_helper')

describe('favorite blog', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  const listWithBlogsWithoutLikes = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0,
      __v: 0
    }
  ]

  // https://raw.githubusercontent.com/fullstack-hy2020/misc/master/blogs_for_test.md
  const exampleListOfBlogs = [
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422b3a1b54a676234d17f',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    },
    {
      _id: '5a422b891b54a676234d17fa',
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      __v: 0
    },
    {
      _id: '5a422ba71b54a676234d17fb',
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
      __v: 0
    },
    {
      _id: '5a422bc61b54a676234d17fc',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0
    }
  ]

  test('when list has only one blog equals the blog in it', () => {
    // https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
    const result = listHelper.favoriteBlog(listWithOneBlog)
    console.log(result)

    expect(result).toEqual(listHelper.deconstructBlog(listWithOneBlog[0]))
  })

  test('when list has only blogs with zero likes, then any one of them can be favorite', () => {
    const result = listHelper.favoriteBlog(listWithBlogsWithoutLikes)
    const expectedList = listWithBlogsWithoutLikes.map(b => listHelper.deconstructBlog(b))
    expect(result).toEqual(expectedList[0])
        || expect(result).toEqual(expectedList[1])
        || expect(result).toEqual(expectedList[2])
  })

  test('when list has many blogs the favorite is the one with the most likes', () => {
    const theFavorite =  {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    }

    const result = listHelper.favoriteBlog(exampleListOfBlogs)
    expect(result).toEqual(theFavorite)
  })

  test('when list has favorite blog its likes are equal to the maximum likes of the bloglist', () => {
    const maximum = exampleListOfBlogs.reduce((max,item) => Math.max(max,item.likes),0)
    console.log(maximum)
    const result = listHelper.favoriteBlog(exampleListOfBlogs).likes
    expect(result).toBe(maximum)
  })

  test('when the list is empty there are no favorite blog', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual(null)
  })
})