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

import { createQuestion } from "../../frontend/hooks/data-fetching/course";

const { createJSDocTypeExpression } = require("typescript");

Cypress.Commands.add("login", (username, password) => {
  cy.visit("localhost:3000/admin/");
  cy.get("[name=username]").type(username);
  cy.get("[name=password]").type(password);
  cy.contains("Log in").click();
  cy.contains("OHQ");
});

Cypress.Commands.add("logout", () => {
  cy.visit("localhost:3000/admin/");
  cy.contains("Log out").click();
  cy.contains("OHQ");
});
