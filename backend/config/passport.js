const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔑 Google profile received:", profile.id, profile.displayName);

        // Ensure email exists
        if (!profile.emails || !profile.emails.length) {
          console.error("❌ No email found in Google profile");
          return done(new Error("No email found in Google profile"), null);
        }

        const email = profile.emails[0].value;

        // ✅ Check if a user already exists by email
        let user = await User.findOne({ email });
        if (user) {
          console.log("👤 Existing user found? true");
          // Optional: update googleId if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // ✅ If user does NOT exist, create a new one
        console.log("👤 Existing user found? false");
        user = await User.create({
          username: profile.displayName,
          email,
          googleId: profile.id,
          provider: 'google',
          isVerified: true,
        });

        console.log("🆕 New user created:", user.email);
        return done(null, user);
      } catch (err) {
        console.error("🔥 Error in GoogleStrategy:", err.message);
        return done(err, null);
      }
    }
  )
);

// Serialize user by ID
passport.serializeUser((user, done) => {
  console.log("📦 Serializing user:", user.id);
  done(null, user.id);
});

// Deserialize user by ID
passport.deserializeUser(async (id, done) => {
  try {
    console.log("📦 Deserializing user ID:", id);
    const user = await User.findById(id);
    if (!user) {
      console.error("❌ User not found during deserialization");
      return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (err) {
    console.error("🔥 Error in deserializeUser:", err.message);
    done(err, null);
  }
});

module.exports = passport;
