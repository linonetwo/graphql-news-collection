/* @flow @ts-check */
/* eslint-disable import/prefer-default-export */

import validator from 'validator';
import { GraphQLString, GraphQLNonNull } from 'graphql';
import {
  mutationWithClientMutationId,
} from 'graphql-relay';

import ValidationError from './ValidationError';
import UserType from './UserType';
import db from '../db';

export const me = {
  type: UserType,
  resolve(root, args, { user, users }) {
    return user && users.load(user.id);
  },
};

// Create mew user
function validate(input, { t, user }) {
  const errors = [];
  const data = {};
  if (!user) {
    throw new ValidationError([{ key: '', message: t('Only authenticated users can create new user.') }]);
  }

  if (typeof input.display_name === 'undefined' || input.display_name.trim() === '') {
    errors.push({ key: 'display_name', message: t('The display_name field cannot be empty.') });
  } else if (!validator.isLength(input.display_name, { min: 3, max: 100 })) {
    errors.push({ key: 'display_name', message: t('The display_name field must be between 3 and 100 characters long.') });
  } else {
    data.display_name = input.display_name;
  }

  if (typeof input.username !== 'undefined' && input.username.trim() !== '') {
    if (!validator.isLength(input.username, { min: 3, max: 100 })) {
      errors.push({ key: 'username', message: t('The username field cannot be between 3 and 100 characters long.') });
    } else {
      data.username = input.username;
    }
  }

  if (typeof input.password !== 'undefined' && input.password.trim() !== '') {
    if (!validator.isLength(input.password, { min: 8, max: 100 })) {
      errors.push({ key: 'password', message: t('The password field cannot be between 8 and 100 characters long.') });
    } else {
      data.password = input.password;
    }
  }

  if (typeof input.image_url !== 'undefined' && input.image_url.trim() !== '') {
    if (!validator.isLength(input.image_url, { max: 200 })) {
      errors.push({ key: 'image_url', message: t('The image_url field cannot be longer than 200 characters long.') });
    } else if (!validator.isURL(input.image_url)) {
      errors.push({ key: 'image_url', message: t('The image_url is invalid.') });
    } else {
      data.image_url = input.image_url;
    }
  }

  if (input.email) {
    data.emails = JSON.stringify([{ email: input.email, verified: false }]);
  }

  return { data, errors };
}

const inputFields = {
  display_name: {
    type: new GraphQLNonNull(GraphQLString),
  },
  username: {
    type: new GraphQLNonNull(GraphQLString),
  },
  password: {
    type: new GraphQLNonNull(GraphQLString),
  },
  email: {
    type: GraphQLString,
  },
  image_url: {
    type: GraphQLString,
  },
};

const outputFields = {
  newUser: {
    type: UserType,
  },
};

export const createUser = mutationWithClientMutationId({
  name: 'CreateUser',
  inputFields,
  outputFields,
  async mutateAndGetPayload(input, context) {
    const { data, errors } = validate(input, context);

    if (errors.length) {
      throw new ValidationError(errors);
    }

    const { id, display_name, image_url, emails } = (await db.table('users')
      .insert(data)
      .returning('*'))[0];
    return { id, display_name, image_url, emails };
  },
});
