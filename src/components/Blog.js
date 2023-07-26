import { useState } from 'react'

const Blog = ({ user, blog, like, remove }) => {

  const [blogOpen, setBlogOpen] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    width: 'fit-content',
    minWidth: '75%',
    marginTop: 5,
    borderRadius: 5
  }

  const opened = {
    marginLeft: 5,
    marginBottom: 5
  }

  // :hover voisi tehdä tämän avulla
  // https://stackoverflow.com/questions/32125708/how-can-i-access-a-hover-state-in-reactjs
  const blogTitle = {
    textDecoration: 'underline',
    fontWeight: 'bold'
  }

  const anonymousStyle = {
    color: 'grey',
    fontStyle: 'italic'
  }

  // klikattavan tekstin idea tämän perusteella:
  // https://stackoverflow.com/questions/43630991/by-clicking-text-how-to-change-clicked-text-to-another-text-in-react-js
  // eli luultavasti melkein mihin tahansa tagiin voi lisätä onClick()

  const toggleBlog = () => {
    setBlogOpen(!blogOpen)
  }

  return (
    <div className="blogBox" style={blogStyle}>
      {!blogOpen &&
      <div className="closed">
        <span onClick={toggleBlog} style={blogTitle} className='blogTitle'>{blog.title}</span> <span className='blogAuthor'> {blog.author}</span>
        <button id="viewBlogButton" onClick={toggleBlog}>view</button>
      </div>}
      {blogOpen &&
      <div className="opened" style={opened}>
        <span onClick={toggleBlog} style={blogTitle} className='blogTitle'>{blog.title}</span> <span className='blogAuthor'>{blog.author}</span>
        <button onClick={toggleBlog}>hide</button>
        <div className="blogUrl"><a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a></div>
        <div>likes <span id="likes">{blog.likes}</span> <button className="likeBUtton" onClick={() => like(blog.id)}>like</button></div>
        {!blog.user && <span style={anonymousStyle}>Anonymous</span>}
        {blog.user && <span className='blogUser'>{blog.user.name}</span>}
        {(!blog.user || user.username === blog.user.username) && <div className="removeDiv"><button className="removeButton" onClick={() => remove(blog.id,blog.title,blog.author)}>remove</button></div>}
      </div>
      }
    </div>
  )
}

export default Blog