import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import bcrypt from "bcrypt";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing in environment variables.");
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "mobileNumber",
      passwordField: "password",
    },
    async (mobileNumber, password, done) => {
      try {
        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.mobileNumber, mobileNumber));

        const user = users[0];
        if (!user) return done(null, false, { message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: (req) => req?.cookies?.clienttoken || null,
      secretOrKey: jwtSecret,
    },
    async (jwt_payload, done) => {
      try {
        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, jwt_payload.id));

        const user = users[0];
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
