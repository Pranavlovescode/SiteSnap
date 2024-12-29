import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const initializePassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
        passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
        const user = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        };
        console.log(profile)
        const userFound = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });

        if (userFound) {
          const jwtToken = await jwt.sign(
            { email: user.email, name: user.name , id: userFound.id},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          console.log("jwt token ", jwtToken);
          request.res.cookie("auth_token", jwtToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            domain: "localhost",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
          });

          request.res.cookie("user_data", JSON.stringify(user), {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            domain: "localhost",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          })

          return done(null, userFound);
        } else {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
            },
          });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.email);
  });

  passport.deserializeUser((email, done) => {
    const user = prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    done(null, user);
  });
};
