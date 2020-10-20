describe("Authenticated Snapshots", () => {
    before(() => {
        cy.login("admin", "ying1234");
    });

    after(() => {
        cy.logout();
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce("sessionid", "csrftoken");
    });

    it("Dashboard", () => {
        cy.visit("/");
        cy.matchImageSnapshot();
    });
});

describe("Unauthenticated Snapshots", () => {
    it("Landing page", () => {
        cy.visit("/");
        cy.matchImageSnapshot();
    });
});
