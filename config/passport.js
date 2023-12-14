import { Strategy as LocalStrategy } from 'passport-local';
import admin from '../models/admin-data.js';

export default function configurePassport(passport) {
  passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
      const user = await admin.findOne({ username: username });
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      if (!user.validPassword(password)) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await admin.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
