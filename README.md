# Allocate

<a href="https://coffeebeans.io/">
    <img alt="CoffeeBeans Logo" src="https://coffeebeans.io/images/home/cbLogoNew.svg">
</a>
<br></br>

## About the Application

Allocate is a comprehensive tool developed for the purpose of staffing and management, ensuring the optimal utilization of talent resources within an organization. It achieves this by meticulously considering various factors such as individual skills, professional experience, and current availability.

## Development

Allocate uses Nx monorepo setup for both client-side and server side of the application
test change
### Built with

- [Nx](https://nx.dev/)
- [ViteJs](https://vitejs.dev/)
- [Python Django](https://www.djangoproject.com/)
- [PostgreSQL](https://www.postgresql.org/)

### Integrations

- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Zoho People](https://www.zoho.com/people/api/overview.html)
- [Airtable](https://support.airtable.com/docs/api)
- [Slack Notification](https://api.slack.com/)

### Prerequisites

- Node: version >=20.x
- PostgreSQL: version ==14.6
- Python: version >= 3.10.10
- Poetry
- A C compiler
- python-dev or python3-dev
- libpq-dev

### Setup

Set environment variables within each apps as mentioned in the .env.example to run on local.

```
# Install dependencies
npm install

# View graph of the workspace
npx nx graph

# View project details
npx nx show project <app name> --web

# Run development for client app
npx nx serve ui

# Run to initialize service app for first time
npx nx run service:app-init

# Update your user permissions (if --role is not passed it takes default as super_admin)
npx nx run service:manage manage_user_groups --email=<your email> --role=<role name> --create

# Run development for server app
source apps/service/.env
npx nx serve service
```

### Running tests

To execute tests with Nx use the following syntax:

```
npx nx run-many -t test -p ui service
```

Refer the [Nx Documentation](https://nx.dev/nx-api) for more CLI commands that can be used.

### Docker Local Setup
test

Set environment variables within each apps as mentioned in the .env.example to run on local

```
docker compose up
```

## Contributing

Please see our [contributing guide](/CONTRIBUTING.md).

## License
[MIT License](/LICENSE)