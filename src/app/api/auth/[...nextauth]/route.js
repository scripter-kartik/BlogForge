// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import bcrypt from "bcryptjs";

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

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.image,
          };
        } catch (error) {
          // Let NextAuth handle the message (do not leak internal details)
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/", // customize as you already do
  },

  callbacks: {
    /**
     * jwt callback: runs when token is created/updated
     * ensure token contains stable fields: _id, email, name, username, picture
     */
    async jwt({ token, account, profile, user }) {
      // If signing in with an OAuth provider (Google)
      if (account && account.provider === "google" && profile) {
        try {
          await connectDB();

          // Normalize: find or create user by email
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
              name: profile.name || profile.email.split("@")[0],
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
        } catch (error) {
          console.error("Error in NextAuth jwt callback (google):", error);
        }
      }

      // If user object provided (credentials sign-in)
      if (user) {
        token._id = user.id || token._id;
        token.username = user.username || token.username;
        token.email = user.email || token.email;
        token.name = user.name || token.name;
        token.picture = user.image || token.picture;
      }

      // Ensure a stable sub for compatibility
      if (!token.sub && token._id) {
        token.sub = token._id;
      }

      return token;
    },

    /**
     * session callback: attach the token fields to session.user
     */
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token._id || token.sub || null;
        session.user._id = token._id || token.sub || null;
        session.user.username = token.username || null;
        session.user.email = token.email || session.user.email || null;
        session.user.name = token.name || session.user.name || null;
        session.user.image = token.picture || session.user.image || null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
