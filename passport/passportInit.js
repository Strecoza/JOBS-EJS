const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passportInit = () => {
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          console.log("login try:", email);
          const user = await User.findOne({ email: email });
          if (!user) {
            console.log("User underfind!");
            return done(null, false, { message: "Incorrect credentials." });
          }

          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            console.log("login success:", user)
            return done(null, user);
          } else {
            console.log("Wrong login")
            return done(null, false, { message: "Incorrect credentials." });
          }
        } catch (e) {
          console.log("Error during login", e)
          return done(e);
        }
      }
    )
  );

  passport.serializeUser(async function (user, done) {
    console.log( "User ID:", user.id)
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log("deserialization:", id);
      const user = await User.findById(id);
      if (!user) {
        console.log("User underfind")
        return done(null, false);
      }
      console.log("deserialized user:", user)
      return done(null, user);
    } catch (e) {
      console.log("deserial error:", e)
      done(e);
    }
  });
};

module.exports = passportInit;