@clientPage
Feature: Staffing tool create, edit and search the client

  @createClient
  Scenario: As a user, I can create client

    Given I am on the login page
      And I login with valid credentials
      And I navigate to the client page
    Then I should be navigated to the client page
    When I click on the Add new client button
    Then I should be navigated to the create client form
    When  I enter the client name
      And I select the domain as "AgriTech"
      And I select the country as "India"
      And I select the city as "Pune"
      And I enter the client start date
      And I click on the Add client button
    Then Client should be added successfully

  Scenario: As a user, I can navigate to the client detail page

    When I click on the client name
    Then I should be navigated to the client detail page
      And I validate client name
      And I validate client domain
      And I validate client country
      And I validate client city
      And I validate client start date

  Scenario: As a user, I can edit the existing client detail
    When I click on the Edit client button
    Then I should be navigated to the edit client form
    When I enter the first POC name
      And I enter the first POC email
      And I enter the first POC phone number
      And I enter the first POC designation
      And I enter the second POC name
      And I enter the second POC email
      And I enter the second POC phone number
      And I enter the second POC designation
      And I select the account manager as "any"
      And I enter the remark
      And I click on the save changes button
    Then I validate client first POC name
      And I validate client first POC email
      And I validate client first POC phone number
      And I validate client first POC designation
      And I validate client second POC name
      And I validate client second POC email
      And I validate client second POC phone number
      And I validate client second POC designation
      And I validate client account manager
      And I validate client remark