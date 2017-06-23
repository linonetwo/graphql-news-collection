/* @flow @ts-check */

import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import { me, createUser } from './User';
import { node, nodes } from './Node';
import { stories, createStory, updateStory } from './Story';
import { seeds, createSeed, useSeed, doneSeed } from './Seed';
import { createComment, updateComment } from './Comment';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      me,
      node,
      nodes,
      stories,
      seeds,
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser,
      createStory,
      updateStory,
      createSeed,
      useSeed,
      doneSeed,
      createComment,
      updateComment,
    },
  }),
});
