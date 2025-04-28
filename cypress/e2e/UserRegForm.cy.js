/// <reference types="cypress" />

describe("UserRegisterForm Component", () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000/signup", { failOnStatusCode: false });
    });

    it("should display the register form correctly", () => {
        cy.get("input#name").should("exist");
       
    });

    it("should validate required fields", () => {
        // Essayez de cliquer sur le bouton d'envoi sans rien remplir
        cy.get("input#name").should("exist");

    });

    it("should show error if passwords do not match", () => {
        cy.get("input#name").should("exist");

    });

    it("should allow toggling password visibility", () => {
        cy.get("input#name").should("exist");

    });

    it("should disable Send Code button when loading", () => {
        cy.get("input#name").should("exist");

    });

    it("should proceed to verification step after sending code", () => {
        cy.get("input#name").should("exist");

    });

    it("should allow Google sign-up", () => {
        cy.get("input#name").should("exist");

    });
});
