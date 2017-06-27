/* @flow @ts-check */
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';

import { stories } from '../channels';

import type { Story } from '../types';


async function createStory(client: ApolloClient, story: Story) {
  await client.mutate({
    variables: {
      input: story,
    },
    mutation: gql`
      mutation createStory($input: CreateStoryInput!) {
        createStory(input: $input) {
          story {
            id
            author {
              id
              displayName
            }
            title
          }
        }
      }
    `,
  });
}

export default async function Stories(client: ApolloClient) {
  const story = await stories.take();
  await createStory(client, story);
  console.log(`Story ${story.title} sent to server.`);
}
