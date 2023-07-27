// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('login', ({ username, password }) => {
  cy.request('POST', 'http://localhost:3003/api/login', {
    username,
    password,
  }).then(({ body }) => {
    localStorage.setItem('loggedBloglistUser', JSON.stringify(body))
    cy.visit('http://localhost:3003')
  })
})

Cypress.Commands.add('createBlog', ({ title, author, url }) => {
  cy.request({
    url: 'http://localhost:3003/api/blogs',
    method: 'POST',
    body: { title, author, url },
    headers: {
      Authorization: `Bearer ${
        JSON.parse(localStorage.getItem('loggedBloglistUser')).token
      }`,
    },
  })

  cy.visit('http://localhost:3003')
})

Cypress.Commands.add('createUser', ({ username, name, password }) => {
  cy.request({
    url: 'http://localhost:3003/api/users',
    method: 'POST',
    body: { username, name, password },
  })

  cy.visit('http://localhost:3003')
})

Cypress.Commands.add('likeBlog', blogTitle => {
  // oma log
  // eslint-disable-next-line no-unused-vars
  const log = Cypress.log({
    name: 'likeBlog',
    displayName: 'likeBlog',
    message: `Like blog ${blogTitle}`,
    consoleProps: () => {
      return {
        BlogTitle: blogTitle,
      }
    },
  })
  cy.get('.blogBox')
    .contains(blogTitle)
    .siblings()
    .find('button')
    .contains('like')
    .then(blog => {
      cy.get(blog)
        .parent()
        .find('span#likes')
        .invoke('text')
        .then(initialLikes => {
          cy.get(blog)
            .parent()
            //.should('not.have.class', 'blogBox').find('button').contains('like').click()
            .find('button')
            .contains('like')
            .click()
          cy.get(blog)
            .parent()
            .find('span#likes')
            .invoke('text')
            .should('not.eq', initialLikes)
        })
    })
})

Cypress.Commands.add('checkLikesOrder', () => {
  cy.request('GET', `${Cypress.env('BACKEND')}/blogs`).then(response => {
    const blogsInLikesOrder = response.body.sort((a, b) => b.likes - a.likes)
    cy.log(blogsInLikesOrder)
    for (let i = 0; i < blogsInLikesOrder.length; i++) {
      cy.get('.blogTitle')
        .eq(i)
        .invoke('text')
        .should('equal', blogsInLikesOrder[i].title)
    }
  })
})
