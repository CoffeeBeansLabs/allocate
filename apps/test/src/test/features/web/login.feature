@loginPage
Feature: Staffing tool login and logout functionality

    @loginWithValidCredentials
    Scenario: As a user, I can log into the staffing tool

        Given I am on the login page
        When I login with valid credentials
        Then I should be navigated to the Dashboard page

    @logout
    Scenario: As a user, I can logout from the staffing tool

        Given I am on the dashboard page
        When I logout from the application
        Then I should be on the login page

    @loginWithInvalidCredentials @invalidEmail
    Scenario: As a user, I cannot log into the staffing tool with the invalid username

        Given I should be on the login page
        When I login with invalid credentials as username "testQA1@coffeebeans.io" and password "testpassword1"
        Then I should not be able to login

    @loginWithInvalidCredentials @wrongPassword
    Scenario: As a user, I cannot log into the staffing tool with the wrong password

        Given I should be on the login page
        When I login with invalid credentials as username "test@coffeebeans.io" and password "testpassword!1"
        Then I should not be able to login

    @loginWithoutCredentials @withoutEmailAddress
    Scenario: As a user, I cannot log into the staffing tool without credentials

        Given I should be on the login page
        When I login without crendentials
        Then I should not be able to login