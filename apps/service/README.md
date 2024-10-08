# Database Setup

## Table of Contents

- [Database Setup](#database-setup)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [PostgreSQL Setup](#postgresql-setup)
    - [Option 1: Install PostgreSQL Locally](#option-1-install-postgresql-locally)
    - [Option 2: Run PostgreSQL via Docker](#option-2-run-postgresql-via-docker)
  - [Google OAuth Setup](#google-oauth-setup)
  - [Steps to Generate Zoho Tokens](#steps-to-generate-zoho-tokens)
    - [1. Create a Zoho Application](#1-create-a-zoho-application)
    - [2. Generate Authorization Code](#2-generate-authorization-code)
    - [3. Exchange Authorization Code for Refresh Token](#3-exchange-authorization-code-for-refresh-token)
    - [4. Set Up Environment Variables](#4-set-up-environment-variables)

## Prerequisites

- **Docker** and **Docker Compose** installed on your local machine.
- **PostgreSQL** installed locally (optional, if running via Docker).
- Google Developer Console account to set up OAuth credentials.

---

## PostgreSQL Setup

### Option 1: Install PostgreSQL Locally

1. Download and install PostgreSQL from [here](https://www.postgresql.org/download/).
2. Once installed, configure the database:
   - Set the following environment variables in .env file:
     ```bash
     export DB_HOST=<DB_HOST>
     export DB_PORT=<DB_PORT>
     export DB_NAME=<DB_NAME>
     export DB_USER=<DB_USER>
     ```
   - Ensure PostgreSQL is running:
     ```bash
     pg_ctl start
     ```
   - Create the database:
     ```bash
     createdb $POSTGRES_DB -U $POSTGRES_USER
     ```

### Option 2: Run PostgreSQL via Docker

- Provide the env variables as in .env.db as follows

  ```bash
  POSTGRES_DB=<POSTGRES_DB>
  POSTGRES_USER=<POSTGRES_USER>
  POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
  ```

- Start the Docker Desktop and run the following docker compose command

  ```bash
   docker compose up
  ```

---

## Google OAuth Setup

1. Go to the [Google Developer Console](https://console.developers.google.com/).
2. Create a new project or use an existing project.
3. Navigate to **APIs & Services > Credentials**.
4. Create a new **OAuth 2.0 Client ID** under **Create Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: Add your application's authorized URIs
5. Copy the `Client ID` and `Client Secret` and set the following environment variables:
   ```bash
   export CBST_GOOGLE_AUTH_CLIENT_ID=<your-client-id>
   export CBST_GOOGLE_AUTH_CLIENT_SECRET=<your-client-secret>
   ```

## Steps to Generate Zoho Tokens

### 1. Create a Zoho Application

1. Go to the [Zoho Developer Console](https://api-console.zoho.com/).
2. Sign in with your Zoho account.
3. Click **Add Client** to create a new application.
4. Choose **Server-based Applications** as the client type.
5. Fill in the required details:
   - **Client Name**: Your application's name
   - **Client Domain**: Your application's domain
   - **Redirect URIs**: Set the redirect URI(s) where Zoho will send the authorization code.
6. Save the client to obtain your **Client ID** and **Client Secret**.

### 2. Generate Authorization Code

1. Construct the authorization URL:
   https://accounts.zoho.com/oauth/v2/auth?scope=AaaServer.profile.Read,ZohoForms.forms.ALL&client_id=<ZOHO_CLIENT_ID>&response_type=code&access_type=offline&redirect_uri=<YOUR_REDIRECT_URI>
2. Open the URL in your browser and sign in with your Zoho account.
3. Grant access to your application.
4. Zoho will redirect you to the redirect URI with an authorization code. Extract the code from the URL.

### 3. Exchange Authorization Code for Refresh Token

1. Use the authorization code to obtain the refresh token by making a POST request to: https://accounts.zoho.com/oauth/v2/token
   With the following parameters:
   - **client_id**: Your Zoho Client ID
   - **client_secret**: Your Zoho Client Secret
   - **grant_type**: authorization_code
   - **code**: The authorization code you obtained in the previous step
   - **redirect_uri**: The same redirect URI used previously
2. In the response, you will receive a refresh_token. Save this token.

### 4. Set Up Environment Variables

Add the following environment variables to your development environment:

```bash
export ZOHO_CLIENT_ID=<ZOHO_CLIENT_ID>
export ZOHO_CLIENT_SECRET=<ZOHO_CLIENT_SECRET>
export ZOHO_FORMS_REFRESH_TOKEN=<ZOHO_FORMS_REFRESH_TOKEN>
```
