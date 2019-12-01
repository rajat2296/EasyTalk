var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../api/user/user.model');

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback : true
    },
    function(req, email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);
        else if (!user) 
          return done(null, false, { message: 'This user is not registered.' });
        /*else if(!user.is_activated)
          return done(null, false, { message: "You haven't verified your email address yet." });*/
        else if (!user.authenticate(password))
          return done(null, false, { message: 'This password is not correct.' });
        else
          return done(null, user);
      });
    }
  ));
};