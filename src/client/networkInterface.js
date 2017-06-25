/* @flowtype @ts-check */
import fetch from 'node-fetch';
import ApolloClient, { createNetworkInterface } from 'apollo-client';

const serverUrl = 'http://localhost:8080';
const authOptions = {
  body: {
    username: 'linonetwo012',
    password: 'qwer1234',
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
  .catch(error => Promise.reject(`No token returned, maybe username( ${authOptions.body.username} ) or password( ${authOptions.body.password} ) wrong. ${error}`));
}

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

  const client = new ApolloClient({
    networkInterface,
  });
  return client;
}
