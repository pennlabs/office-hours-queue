describe("Can authenticate", () => {
    it("Logs in successfully", () => {
        cy.login("admin", "ying1234");
    });
});
