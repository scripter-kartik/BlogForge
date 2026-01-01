import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./database/db";
import { User } from "./models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: "google",
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        console.log("Credentials login successful:", {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
        });

        return {
          id: user._id.toString(),
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name || user.username,
          image: user.image,
          provider: "credentials",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("\n=== SIGNIN CALLBACK ===");
      console.log("Provider:", account?.provider);
      console.log("User email:", user?.email);

      try {
        await connectDB();

        if (account?.provider === "google") {
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const username =
              user.email?.split("@")[0].toLowerCase() || "user";
            existingUser = await User.create({
              email: user.email,
              name: user.name,
              username: username,
              image: user.image,
              provider: "google",
            });
            console.log("New Google user created");
          }

          user.id = existingUser._id.toString();
          user._id = existingUser._id.toString();
          user.username = existingUser.username;
        }

        console.log("=== SIGNIN CALLBACK END ===\n");
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, trigger }) {
      console.log("\n=== JWT CALLBACK START ===");
      console.log("Trigger:", trigger);
      console.log("Provider:", account?.provider || "refresh");

      if (user) {
        if (account?.provider === "credentials") {
          console.log("📝 Processing credentials login:", user.email);
          token._id = user._id || user.id;
          token.username = user.username;
          token.email = user.email;
          token.provider = "credentials";
          console.log("Credentials token set:", {
            _id: token._id,
            username: token.username,
            email: token.email,
          });
        } else if (account?.provider === "google") {
          console.log("Processing Google login:", user.email);
          token._id = user._id || user.id;
          token.username = user.username;
          token.email = user.email;
          token.provider = "google";
          console.log("Google token set:", {
            _id: token._id,
            username: token.username,
            email: token.email,
          });
        }
      } else {
        console.log("Token refresh - ensuring consistency");
      }

      console.log("Token final state:", {
        _id: token._id,
        username: token.username,
        email: token.email,
        provider: token.provider,
      });
      console.log("=== JWT CALLBACK END ===\n");

      return token;
    },

    async session({ session, token }) {
      console.log("\n=== SESSION CALLBACK START ===");
      console.log("Token username:", token.username);
      console.log("Token email:", token.email);

      if (token && session.user) {
        session.user._id = token._id;
        session.user.id = token._id;
        session.user.sub = token._id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.provider = token.provider;

        try {
          await connectDB();
          const user = await User.findById(token._id);
          if (user) {
            session.user.name = user.name || user.username;
            session.user.image = user.image;
            session.user.bio = user.bio;
          }
        } catch (error) {
          console.error("Session user fetch error:", error);
        }

        console.log("Session user final:", {
          _id: session.user._id,
          username: session.user.username,
          email: session.user.email,
          provider: session.user.provider,
        });
      }

      console.log("=== SESSION CALLBACK END ===\n");
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: false,

  secret: process.env.NEXTAUTH_SECRET,
};