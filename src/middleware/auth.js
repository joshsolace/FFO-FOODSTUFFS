const passport = require("passport");
const pool = require("../db/index.db");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


passport.use(
  new GoogleStrategy(
    {
      clientID:"831203606301-i5enj0qnj5fouo6ge67qplovn9d2ucgh.apps.googleusercontent.com",
      clientSecret:"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",
      // callbackURL: "http://localhost:5163/auth/google/callback",
      callbackURL: process.env.NODE_ENV === "production" ? "https://ffo-foodstuffs.herokuapp.com" : "http://localhost:5163/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const currentUser = await pool.query(
          "SELECT * FROM users WHERE googleId = $1",
          [profile.id]
        );

        if (currentUser.rows.length > 0) {
          const token = jwt.sign({ id: currentUser.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          console.log(`user is ${currentUser.rows[0].id}`);
          console.log(`token is ${token}`);
          console.log(currentUser.rows[0]);
          done(null, currentUser.rows[0], token);
        } else {
          const user = await pool.query(
            "INSERT INTO users (googleId, username, photo, email) VALUES ($1, $2, $3, $4) RETURNING *",
            [
              profile.id,
              profile.displayName,
              profile._json.picture,
              profile.emails[0].value,
            ]
          );
          const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          console.log(`user is ${user.rows[0].id}`);
          console.log(`token is ${token}`);
          console.log(user.rows[0]);
          done(null, user.rows[0], token);
        }
      } catch (err) {
        console.error(err);
        done(err);
      }
    }
  )
);
 

passport.serializeUser((user, done) => {
  done(null, user); // Store only the user's id in the session
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
