// Updated NextAuth configuration with better session handling
// src/app/api/auth/[...nextauth]/route.js - UPDATED
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import bcrypt from "bcryptjs";

const authOptions = {
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
          const user = await User.findOne({ email: credentials.email });

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
    signIn: "/", // Redirect to home page instead of default sign-in page
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && account.provider === "google") {
        try {
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
              name: profile.name,
              username,
              email: profile.email,
              image: profile.picture,
            });
          }

          token._id = dbUser._id.toString();
          token.username = dbUser.username;
        } catch (error) {
          console.error("Error in NextAuth jwt callback:", error);
        }
      }

      if (user) {
        token._id = user.id;
        token.username = user.username;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token._id;
        session.user.username = token.username;
        session.user._id = token._id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
