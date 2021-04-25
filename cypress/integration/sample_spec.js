
describe('My First Test', () => {
    it('Visits the Kitchen Sink', () => {
      cy.visit('https://ohq.io/')
      cy.contains('Log In')
    })
  })
  