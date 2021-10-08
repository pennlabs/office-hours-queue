describe("Question Tests", () => {
    beforeEach(() => {
        cy.login("tjefferson", "pennlabs");
        cy.getCookie("csrftoken")
            .then((cookie) => cookie.value)
            .then((csrftokenBefore) => {
                cy.request({
                    url: "/api/courses/5/queues/6/clear/",
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrftokenBefore,
                    },
                });

                cy.logout();
            });
    });

    it("Tests question using API request (to test web sockets)", () => {
        const questionString = `fwaoieh${Math.floor(
            100 * Math.random()
        ).toString()}`;

        cy.login("bfranklin", "pennlabs");
        cy.visit("localhost:3000/");

        cy.getCookie("csrftoken").its("value").should("exist");
        cy.getCookie("sessionid").its("value").should("exist");
        cy.getCookie("csrftoken")
            .then((cookie) => cookie.value)
            .then((csrftokenStudent) => {
                cy.getCookie("sessionid")
                    .then((cookie) => cookie.value)
                    .then((sessionidStudent) => {
                        cy.clearCookies();

                        cy.login("tjefferson", "pennlabs");
                        cy.visit("localhost:3000/");

                        cy.getCookie("csrftoken")
                            .then((cookie) => cookie.value)
                            .then((csrftokenTA) => {
                                cy.getCookie("sessionid")
                                    .then((cookie) => cookie.value)
                                    .then((sessionidTA) => {
                                        cy.contains("LABS 621").click();
                                        cy.wait(3000);

                                        cy.clearCookies();

                                        cy.request({
                                            failOnStatusCode: true,
                                            url:
                                                "/api/courses/5/queues/6/questions/",
                                            method: "POST",
                                            headers: {
                                                cookie: `csrftoken=${csrftokenStudent}; sessionid=${sessionidStudent}`,
                                                "X-CSRFToken": csrftokenStudent,
                                            },
                                            body: {
                                                text: questionString,
                                                tags: [],
                                                askedBy: {
                                                    email:
                                                        "bfranklin@seas.upenn.edu",
                                                    firstName: "Benjamin",
                                                    lastName: "Franklin",
                                                    username: "bfranklin",
                                                },
                                            },
                                        });

                                        cy.setCookie("csrftoken", csrftokenTA);
                                        cy.setCookie("sessionid", sessionidTA);

                                        cy.contains(questionString, {
                                            timeout: 5000,
                                        }).should("be.visible");

                                        cy.contains("Reject").click();
                                        cy.contains("Select Reason").click();
                                        cy.contains("Not Specific").click();
                                        cy.get(".modal .button")
                                            .contains("Reject")
                                            .click();

                                        cy.logout();
                                    });
                            });
                    });
            });
    });

    it("Tests question by logging to student and teacher in succession", () => {
        const questionString = `fwaoieh${Math.floor(
            100 * Math.random()
        ).toString()}`;

        cy.login("bfranklin", "pennlabs");
        cy.visit("localhost:3000/");
        cy.contains("LABS 621").click();
        cy.get("textarea").type(questionString);
        cy.get("input").type("https://upenn.zoom.us/j/6017796013");

        cy.contains("Submit").click();

        cy.logout();
        cy.login("tjefferson", "pennlabs");
        cy.visit("localhost:3000/");

        cy.contains("LABS 621").click();
        cy.contains(questionString, { timeout: 5000 }).should("be.visible");

        cy.contains("Reject").click();
        cy.contains("Select Reason").click();
        cy.contains("Not Specific").click();
        cy.get(".modal .button").contains("Reject").click();

        cy.logout();
    });
});
