import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  // jos haluaa placeholder tekstin kursiivilla, ei voi tehdä näin
  // vaan pitää tehdä erillinen tyylitiedosto
  // const blogFormStyle = {
  //   placeHolder : {
  //     fontStyle: 'italic'
  //   }
  // }

  const createNewBlog = async event => {
    event.preventDefault()
    try {
      await createBlog({
        title,
        author,
        url
      })

      setTitle('')
      setAuthor('')
      setUrl('')
    } catch (error) {
      if (error.message) {
        console.log(error.message)
      }
    }



  }

  return (
    <div className="blogForm">
      <h2>create new</h2>
      <form onSubmit={createNewBlog}>
        <div>
                    title:
          <input
            type="text"
            value={title}
            id="title"
            onChange={event => setTitle(event.target.value)}
            placeholder='Type blog title...'
          />
        </div>
        <div>
                    author:
          <input
            type="text"
            value={author}
            id="author"
            onChange={event => setAuthor(event.target.value)}
            placeholder='Type blog author...'
          />
        </div>
        <div>
                    url:
          <input
            type="text"
            value={url}
            id="url"
            onChange={event => setUrl(event.target.value)}
            placeholder='Type blog url...'
          />
        </div>
        <button id="createButton" type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm