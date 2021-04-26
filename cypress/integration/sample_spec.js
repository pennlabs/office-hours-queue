const { createJSDocTypeExpression } = require("typescript");

describe("First Test", () => {

  before(() => {
    cy.login('gautam2', 'gautam2')
  })

  after(() => {
    cy.logout()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('sessionId', 'csrftoken')
  })

  it ('Logs in', () => {
    const questionString = "fwaoieh" + Math.floor(100 * Math.random()).toString()

    cy.visit('localhost:3000/')
    cy.contains('cis cis101').click()
    cy.get('textarea').type(questionString)

    cy.contains('Submit').click()

    cy.logout()
    cy.login('gautam1', 'gautam1')
    cy.visit('localhost:3000/')

    cy.contains('cis cis101').click()
    cy.contains(questionString, { timeout: 5000 }).should('be.visible')
    cy.contains('Reject').click()
    cy.contains('Select Reason').click()
    cy.contains('Not Specific').click()
    cy.get('.modal .button').contains('Reject').click()
  })
});
