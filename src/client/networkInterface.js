/* @flowtype @ts-check */
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';


const networkInterface = createNetworkInterface({
  uri: 'http://localhost:8080/graphql',
});

networkInterface.use([
  {
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {}; // Create the header object if needed.
      }
      // get the authentication token from local storage if it exists
      req.options.headers.Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNmODhmY2E0LTU2NGUtMTFlNy05NjNlLWYzOTI2NjA5ZGI5OCIsImlhdCI6MTQ5ODAzNDQ5N30.rr4rsldehflOjQvZPIM-G4MKGJU2RyoGyzSGJE36xgs';
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
