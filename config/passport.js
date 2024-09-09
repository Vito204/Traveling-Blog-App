const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new localStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          //find the user by email
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, {
              message: "User not found with the email",
            });
          }
          //compare the password with the hashed password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect password",
            });
          }
          //password correct, retrieve the user object
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  //Store the user ID into the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  //Deserialize the user based on the ID
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
