# graphql-news-collection

A crawler collecting news about GraphQL.

## Directory Layout

This project was started by [nodejs-api-starter](https://github.com/kriasoft/nodejs-api-starter)

```txt
.
├── /build/                     # The compiled output (via Babel)
├── /config/                    # Configuration files (for Docker containers etc.)
├── /locales/                   # Localization resources (i18n)
├── /migrations/                # Database schema migrations
├── /seeds/                     # Scripts with reference/sample data
├── /src/                       # Node.js application source files
│   ├── /emails/                # Handlebar templates for sending transactional email
│   ├── /routes/                # Express routes, e.g. /login/facebook
│   ├── /schema/                # GraphQL schema, types, fields and mutations
│   │   ├── /Node.js            # Relay's "node" definitions
│   │   ├── /User.js            # User related top-level fields and mutations
│   │   ├── /UserType.js        # User type, representing a user account (id, emails, etc.)
│   │   ├── /...                # etc.
│   │   └── /index.js           # Exports GraphQL schema object
│   ├── /app.js                 # Express.js application
│   ├── /DataLoaders.js         # Data access utility for GraphQL /w batching and caching
│   ├── /db.js                  # Database access and connection pooling (via Knex)
│   ├── /email.js               # Client utility for sending transactional email
│   ├── /passport.js            # Passport.js authentication strategies
│   ├── /redis.js               # Redis client
│   └── /server.js              # Node.js server (entry point)
├── /test/                      # Unit, integration and load tests
├── /tools/                     # Build automation scripts and utilities
├── docker-compose.yml          # Defines Docker services, networks and volumes
├── Dockerfile                  # Commands for building a Docker image for production
└── package.json                # The list of project dependencies
```

## dev

Enter the container:

```shell
docker-compose exec api /bin/sh
```

Change database schema (migration):

```shell
# after enter the container
npm run db:migrate
```