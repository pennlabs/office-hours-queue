import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";

addMatchImageSnapshotCommand();

Cypress.Commands.add("login", (username, password) => {
    cy.visit("/admin");
    cy.get("[name=username]").type(username);
    cy.get("[name=password]").type(password);
    cy.contains("Log in").click();
    cy.visit("/");
});

Cypress.Commands.add("logout", () => {
    cy.visit("/admin/logout");
});
