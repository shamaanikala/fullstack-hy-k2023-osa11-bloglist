import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> -lomake toimii ja lähettää oikeat tiedot', async () => {
  const user = userEvent.setup()
  const createBlog = jest.fn()

  render(<BlogForm createBlog={createBlog} />)

  const createButton = screen.getByText('create')

  const titleInput = screen.getByPlaceholderText('Type blog title...')
  const authorInput = screen.getByPlaceholderText('Type blog author...')
  const urlInput = screen.getByPlaceholderText('Type blog url...')

  //screen.debug()

  await user.type(titleInput, 'Parsing Html The Cthulhu Way')
  await user.type(authorInput, 'Jeff Atwood')
  await user.type(urlInput, 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/')
  await user.click(createButton)

  //console.log(createBlog.mock.calls)
  // console.log
  //   [
  //     [
  //       {
  //         title: 'Parsing Html The Cthulhu Way',
  //         author: 'Jeff Atwood',
  //         url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/'
  //       }
  //     ]
  //   ]
  const mockBlog = {
    title: 'Parsing Html The Cthulhu Way',
    author: 'Jeff Atwood',
    url: 'https://blog.codinghorror.com/parsing-html-the-cthulhu-way/'
  }

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({ ...mockBlog })
})