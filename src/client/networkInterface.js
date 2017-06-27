/* @flowtype @ts-check */
import fetch from 'node-fetch';
import ApolloClient, { createNetworkInterface } from 'apollo-client';

const serverUrl = 'http://localhost:80';
const authOptions = {
  body: {
    username: 'crawlertest1',
    password: 'crawlertest1',
  },
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

function getJWT(): Promise<string> {
  // get the authentication token from API if it exists
  return fetch(`${serverUrl}/login/jwt`, {
    method: 'POST',
    headers: authOptions.headers,
    body: JSON.stringify(authOptions.body),
  })
  .then(response => response.json())
  .then(({ token }) => `Bearer ${token}`)
  .catch(error => Promise.reject(`No token returned, maybe username( ${authOptions.body.username} ) or password( ${authOptions.body.password} ) wrong or server error: ${error}`));
}

const logGraphQLErrors = {
  applyAfterware({ response }, next) {
    if (!response.ok) {
      response.clone().text().then((bodyText) => {
        console.error(`Network Error: ${response.status} (${response.statusText}) - ${bodyText}`);
        next();
      });
    } else {
      response.clone().json().then(({ errors }) => {
        if (errors) {
          console.error('GraphQL Errors:', errors.map(e => `${e.message} ${JSON.stringify(e.state)} in ${JSON.stringify(e.path)}`));
        }
        next();
      });
    }
  },
};

export default async function getGraphqlClient(): Promise<ApolloClient> {
  const token = await getJWT();
  const networkInterface = createNetworkInterface({
    uri: `${serverUrl}/graphql`,
  });

  networkInterface.use([
    {
      applyMiddleware(req, next) {
        if (!req.options.headers) {
          req.options.headers = {}; // Create the header object if needed.
        }
        req.options.headers.Authorization = token;
        next();
      },
    },
  ]);

  networkInterface.useAfter([logGraphQLErrors]);

  const client = new ApolloClient({
    networkInterface,
  });
  return client;
}
