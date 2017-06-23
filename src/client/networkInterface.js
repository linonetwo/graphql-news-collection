/* @flowtype @ts-check */
import fetch from 'node-fetch';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';

const serverUrl = 'http://localhost:8080';

const networkInterface = createNetworkInterface({
  uri: `${serverUrl}/graphql`,
});

networkInterface.use([
  {
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {}; // Create the header object if needed.
      }
      // get the authentication token from local storage if it exists
      fetch(`${serverUrl}/login/jwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: '',
          password: '',
        }),
      })
      .then(response => response.json())
      .then(({ token }) => {
        req.options.headers.Authorization = `Bearer ${token}`;
      })
      .catch((ex) => {
        console.log('parsing failed', ex);
      });

      next();
    },
  },
]);

const client = new ApolloClient({
  networkInterface,
});

client.mutate({
  variables: {
    input: { title: 'testseed1', type: 'Explore', url: 'http://fakeurl.com', clientMutationId: 'qwerasdf' },
  },
  mutation: gql`
    mutation createSeed($input: CreateSeedInput!) {
      createSeed(input: $input) {
        seed {
            id
            parentId
            url
            type
            title
            using
            done
          }
        clientMutationId
      }
    }
  `,
})
  .then(data => console.log(data))
  .catch(error => console.error(error));
