@ProjectPage
Feature: Staffing tool create, edit and search the project

    @createProject
    Scenario: As a user, I can create Project
        Given I am on the login page
            And I login with valid credentials
            And I navigate to the Project page
        Then I should be navigated to the Project page
        When I click on the Add new project button
        Then I should be navigated to the create project form
        When I enter the project name
            And I select the client as "any"
            And I select the project status as "Hot"
            And I select the country as "India"
            And I select the city as "Pune"
            And I enter the project start date
            And I click on the Add project button
        Then Project should be added successfully

    Scenario: As a user, I can navigate to the project detail page
        When I click on the project name
        Then I should be navigated to the project detail page
            And I validate project name
            And I validate project country
            And I validate project city
            And I validate project start date

    Scenario: As a user, I can edit the existing project detail and verify the same in view detail page
        When I click on the Edit project button
        Then I should be navigated to the edit project form
        When I select the type of engagement as "any"
            And I select the currency as "USD"
            And I select the delivery mode as "Remote"
            And I enter the project POC name
            And I enter the project POC email
            And I enter the project POC phone number
            And I enter the project POC designation
            And I select the project account manager as "any"
            And I enter the project remark
            And I click on the project save changes button
        Then I validate project POC name
            And I validate project POC email
            And I validate project POC phone number
            And I validate project POC designation
            #And I validate project account manager
            And I validate project remark