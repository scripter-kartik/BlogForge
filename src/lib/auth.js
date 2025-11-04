// src/lib/auth.js - UPDATED
import { getToken } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import bcrypt from "bcryptjs";

export async function getAuthenticatedUser(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.email) {
    throw new Error("Unauthorized");
  }

  return {
    id: token._id,
    email: token.email,
    username: token.username,
    name: token.name,
    image: token.picture,
  };
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select("+password");
          if (!user) throw new Error("Invalid credentials");

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Invalid credentials");

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.image,
          };
        } catch {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: { signIn: "/" },

  callbacks: {
    // ✅ JWT callback
    async jwt({ token, account, profile, user, trigger, session }) {
      // ✅ Handle Google Provider
      if (account?.provider === "google" && profile) {
        await connectDB();
        let dbUser = await User.findOne({ email: profile.email });

        if (!dbUser) {
          const baseUsername = profile.email.split("@")[0];
          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }
          dbUser = await User.create({
            name: profile.name || baseUsername,
            username,
            email: profile.email,
            image: profile.picture || null,
          });
        }

        token._id = dbUser._id.toString();
        token.username = dbUser.username;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.picture = dbUser.image || profile.picture || null;
      }

      // ✅ Handle credentials provider
      if (user) {
        token._id = user.id || token._id;
        token.username = user.username || token.username;
        token.email = user.email || token.email;
        token.name = user.name || token.name;
        token.picture = user.image || token.picture;
      }

      // ✅ If token.sub exists but no _id, fallback
      if (!token._id && token.sub) {
        token._id = token.sub;
      }

      return token;
    },

    // ✅ SESSION callback (CRITICAL UPDATE)
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};

        // ✅ Force Mongo _id only
        session.user._id = token._id;
        session.user.id = token._id;

        session.user.username = token.username || null;
        session.user.email = token.email || session.user.email || null;
        session.user.name = token.name || session.user.name || null;
        session.user.image = token.picture || session.user.image || null;
      }
      return session;
    },
  },
};
