const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/users');

function initialize() {
    const authenticateUser = async function (username, password, done) {
      const user = await User.findOne({ email: username }); // Use 'username' as the field to search for in your database
  
      if (!user) {
        return done(null, false, {
          message: 'Incorrect email. User not registered',
        });
      }
  
      try {
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (e) {
        return done(e);
      }
    }
  
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser)); // Use 'email' as the usernameField
    passport.serializeUser(function (user, done) {
      done(null, user.id);
    });
    passport.deserializeUser(async function (id, done) {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });
  }
  

module.exports = initialize;
