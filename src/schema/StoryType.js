/* @flow @ts-check */

import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './Node';

import CommentType from './CommentType';
import UserType from './UserType';

export default new GraphQLObjectType({
  name: 'Story',
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    author: {
      type: new GraphQLNonNull(UserType),
      resolve(parent, args, { users }) {
        return users.load(parent.author_id);
      },
    },

    title: {
      type: new GraphQLNonNull(GraphQLString),
    },

    url: {
      type: GraphQLString,
    },

    type: {
      type: GraphQLString,
    },

    comments: {
      type: new GraphQLList(CommentType),
      resolve(parent, args, { commentsByStory }) {
        return commentsByStory.load(parent.id);
      },
    },

    pointsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve(parent, args, { storyPointsCount }) {
        return storyPointsCount.load(parent.id);
      },
    },

    commentsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve(parent, args, { storyCommentsCount }) {
        return storyCommentsCount.load(parent.id);
      },
    },

    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parent.created_at;
      },
    },

    updatedAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parent.updated_at;
      },
    },
  },
});
