import passport from "passport";
import { UserDocument, User } from "@models/user.model";
import Local from "passport-local";
import { Error } from "mongoose";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";


export function initPassportJS() {
  passport.use(
    new Local.Strategy((username, password, done) => {
      User.findOne({ username })
        .exec()
        .then((user: UserDocument | null) => {
          if (!user) {
            return done(undefined, false, { message: `Username ${username} not found` });
          }
          if (!user.comparePassword(password)) {
            return done(undefined, false, { message: "Incorrect username or password" });
          }
          return done(undefined, user);
        })
        .catch((err: Error) => {
          return done(err);
        });
    })
    );
  passport.serializeUser((user, done) => done(undefined, user));
  passport.deserializeUser((id, done) =>
    User.findById(id)
      .exec()
      .then((user: UserDocument | null) => done(undefined, user))
      .catch((err: Error) => done(err))
  );
}

 

const GOOGLE_CLIENT_ID: string = "644639375370-tfk4cm41328shq8s5m38tsqt0d5pbaag.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET: string = "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";

const GITHUB_CLIENT_ID: string = "9ffae2cd460f5a32edd2";
const GITHUB_CLIENT_SECRET: string = "68fe874762ad0aab0dad937c6f3d45e46b2d7b28";

const FACEBOOK_APP_ID: string = "5768086816629777";
const FACEBOOK_APP_SECRET: string = "8e47751a9a71485bf896a0d8b2a16556";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken: string, refreshToken: string, profile: any, done: any) => {
      done(null, profile);
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken: string, refreshToken: string, profile: any, done: any) => {
      done(null, profile);
    }
  )
);

 


passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
    },
    (accessToken: string, refreshToken: string, profile: any, done: any) => {
      done(null, profile);
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});
