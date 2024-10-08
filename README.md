# Allocate

<a href="https://coffeebeans.io/">
    <img alt="CoffeeBeans Logo" src="https://coffeebeans.io/images/home/cbLogoNew.svg">
</a>
<br></br>

## Table of Contents

- [Allocate](#allocate)
  - [Table of Contents](#table-of-contents)
  - [About the Application](#about-the-application)
    - [Features](#features)
  - [Development](#development)
    - [Built With](#built-with)
    - [Integrations](#integrations)
    - [Prerequisites](#prerequisites)
    - [Setup Instructions](#setup-instructions)
      - [Frontend (Client App)](#frontend-client-app)
      - [Backend (Service App)](#backend-service-app)
    - [Running tests](#running-tests)
    - [Docker Setup (Local)](#docker-setup-local)
  - [Technical Documentation](#technical-documentation)
  - [Contributing](#contributing)

## About the Application

Allocate is an open-source tool designed for staffing and talent management. It helps organizations optimize resource utilization by factoring in individual skills, professional experience, and current availability. Allocate also manages asset allocation and tracks client/project assignments.

### Features

- **Talent allocation** based on skills, experience, and availability.
- **Resource management** for assets assigned to individuals.
- **Client and project tracking** to manage team assignments.
- **Integrated reports** for insight into staffing and resource distribution.

## Development

Allocate uses an Nx monorepo setup for both client-side and server-side of the application, providing a scalable and modular approach to managing various parts of the app.

### Built With

Allocate is built using the following technologies:

- **[Nx](https://nx.dev/)**: Nx is a powerful build framework for managing monorepos. It provides tools for optimizing builds, testing, and development in large, complex projects like Allocate. The monorepo approach allows the client and server codebases to live together, making it easier to maintain and develop both simultaneously.
- **[ViteJs](https://vitejs.dev/)**: Vite is a fast and modern frontend build tool that significantly improves the development experience by providing instant server start, hot module replacement (HMR), and optimized build outputs. In Allocate, ViteJs is used to manage the client-side of the application, allowing developers to iterate quickly.

- **[Python Django](https://www.djangoproject.com/)**: Django is a high-level backend web framework known for its rapid development capabilities and robustness. It powers Allocate’s backend APIs, ensuring scalable, maintainable, and secure handling of business logic.

- **[PostgreSQL](https://www.postgresql.org/)**: PostgreSQL is a powerful, open-source relational database system. Allocate uses PostgreSQL for storing essential application data, including user profiles, staffing assignments, asset allocations, and reports. PostgreSQL provides reliability, strong SQL compliance, and extensibility features necessary for enterprise-grade applications like Allocate.

### Integrations

Allocate integrates with several third-party services to extend its functionality:

- **[Google OAuth](https://developers.google.com/identity/protocols/oauth2)**: Google OAuth is used for secure authentication in Allocate. It allows users to log in with their Google accounts, providing a seamless and secure sign-in experience without managing passwords internally.

- **[Zoho People](https://www.zoho.com/people/api/overview.html)**: Zoho People is a human resource management solution that helps Allocate import and manage talent data. By integrating with Zoho People, Allocate can automatically synchronize employee details, availability, and skillsets for accurate staffing allocation.

- **[Airtable](https://support.airtable.com/docs/api)**: Airtable provides structured data storage and an easy-to-use API interface. Allocate leverages Airtable for managing project and client assignments. This integration allows flexibility in managing team assignments with quick lookups and updates to project details.

- **[Slack Notifications](https://api.slack.com/)**: Slack integration enables Allocate to send real-time notifications to users. Whether it's about staffing updates, project changes, or new reports, Slack notifications keep the team informed about important changes within the platform.

### Prerequisites

Before setting up Allocate locally, ensure you have the following dependencies installed:

1. **Node.js**: Version >= 20.x

   - Node.js is required for running the frontend server and build processes in Allocate. Make sure you have version 20.x or higher to leverage the latest features of JavaScript and npm.

2. **PostgreSQL**: Version == 14.6

   - PostgreSQL is the relational database used by Allocate for storing data. Version 14.6 ensures compatibility with the database schema and features used in the application.

3. **Python**: Version >= 3.10.10

   - Python is required for running the backend, and version 3.10.10 or higher is necessary to support the Django framework and related packages used in Allocate.

4. **Poetry**: A Python dependency management tool

   - Poetry is used to manage Python dependencies in Allocate’s backend. It simplifies the process of installing and updating Python packages in a consistent and reproducible way.

5. **A C compiler**

   - A C compiler is needed for compiling native dependencies, particularly when installing Python packages that require compilation, such as database drivers.

6. **Python development libraries**: `python-dev` or `python3-dev`

   - These libraries are necessary to compile Python extensions and ensure that all required packages work smoothly.

7. **PostgreSQL development headers**: `libpq-dev`
   - `libpq-dev` is needed to install and use PostgreSQL-related packages for Python, ensuring the backend can interact with the database properly.

### Setup Instructions

#### Frontend (Client App)

1. Set environment variables: Configure the environment variables by creating a `.env` file using the template provided in `.env.example`.

2. Install all monorepo dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npx nx serve ui
```

4. View workspace graph

```bash
npx nx graph
```

5. View project details (replace <app name> with the actual project name)

```bash
npx nx show project <app name> --web
```

#### Backend (Service App)

1. Set environment variables: Update the apps/service/.env file with your backend environment settings, using .env.example as a reference.

2. Install backend dependencies and run initial backend setup after setting up local Database(Refer Service Readme):

```bash
npx nx run service:app-init
```

3. Update user permissions (if --role is not passed it takes default as super_admin):

```bash
npx nx run service:manage manage_user_groups --email=<your email> --role=<role name> --create
```

4. Run development for server app:

```bash
source apps/service/.env
npx nx serve service
```

### Running tests

To execute tests with Nx use the following syntax:

```
npx nx run-many -t lint test -p util-hooks util-data-values util-formatting ui-components ui service
```

Refer the [Nx Documentation](https://nx.dev/nx-api) for more CLI commands that can be used.

### Docker Setup (Local)

1. Set environment variables: Ensure the environment variables are configured for both the frontend and backend, using `.env.example` and `.env.db.example` as a template.

2. Start the app using Docker:

```bash
docker compose up
```

## Technical Documentation

For detailed technical documentation, including in-depth information about the project architecture, API references, and system design, please refer to the following link:

[Technical Documentation](https://coffee-book.coffeebeans.io/doc/technical-documentation-eOtMiGW4WL)

## Contributing

Please see our [contributing guide](/CONTRIBUTING.md).
