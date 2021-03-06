/* @flow @ts-check */
/* eslint-disable no-param-reassign, no-underscore-dangle, max-len */

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import db from './db';

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    displayName: user.displayName,
    imageUrl: user.imageUrl,
    emails: user.emails,
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// JWT check
const jwtOption = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(new JwtStrategy(jwtOption, ({ id }, done) => {
  db.table('users').where({ id }).first()
    .then((user) => {
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
    // error or you could create a new account
    .catch(err => done(err, false));
}));


// 3rd party login

// Creates or updates the external login credentials
// and returns the currently authenticated user.
async function login(req, provider, profile, tokens) {
  let user;

  if (req.user) {
    // 首先看 users 表里是不是已经存了这个用户
    user = await db.table('users').where({ id: req.user.id }).first();
  }

  if (!user) {
    // 如果没有，就看看第三方登录表里有没有
    user = await db.table('logins')
      .innerJoin('users', 'users.id', 'logins.user_id')
      .where({ 'logins.provider': provider, 'logins.id': profile.id })
      .first('users.*');
    // 如果还是没有，就说明是用 email 注册的，看看 users 表里有没有这个 email
    if (!user && profile.emails && profile.emails.length && profile.emails[0].verified === true) {
      user = await db.table('users')
        .where('emails', '@>', JSON.stringify([{ email: profile.emails[0].value, verified: true }]))
        .first();
    }
  }
  // 还是没有，就帮他注册一个
  if (!user) {
    user = (await db.table('users')
      .insert({
        display_name: profile.displayName,
        emails: JSON.stringify((profile.emails || []).map(x => ({
          email: x.value,
          verified: x.verified || false,
        }))),
        image_url: profile.photos && profile.photos.length ? profile.photos[0].value : null,
      })
      .returning('*'))[0];
  }

  const loginKeys = { user_id: user.id, provider, id: profile.id };
  const { count } = await db.table('logins').where(loginKeys).count('id').first();

  if (count === '0') {
    await db.table('logins').insert({
      ...loginKeys,
      username: profile.username,
      tokens: JSON.stringify(tokens),
      profile: JSON.stringify(profile._json),
    });
  } else {
    await db.table('logins').where(loginKeys).update({
      username: profile.username,
      tokens: JSON.stringify(tokens),
      profile: JSON.stringify(profile._json),
      updated_at: db.raw('CURRENT_TIMESTAMP'),
    });
  }

  return {
    id: user.id,
    displayName: user.display_name,
    imageUrl: user.image_url,
    emails: user.emails,
  };
}

// https://github.com/jaredhanson/passport-google-oauth2
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/login/google/return',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const user = await login(req, 'google', profile, { accessToken, refreshToken });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// https://github.com/jaredhanson/passport-facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  profileFields: ['name', 'email', 'picture', 'link', 'locale', 'timezone', 'verified'],
  callbackURL: '/login/facebook/return',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    if (profile.emails.length) profile.emails[0].verified = !!profile._json.verified;
    profile.displayName = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
    const user = await login(req, 'facebook', profile, { accessToken, refreshToken });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// https://github.com/jaredhanson/passport-twitter
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/login/twitter/return',
  includeEmail: true,
  includeStatus: false,
  passReqToCallback: true,
}, async (req, token, tokenSecret, profile, done) => {
  try {
    if (profile.emails && profile.emails.length) profile.emails[0].verified = true;
    const user = await login(req, 'twitter', profile, { token, tokenSecret });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

export default passport;
