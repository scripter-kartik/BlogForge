import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.provider === "google") {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        if (profile) {
          token.email = profile.email;
          token.name = profile.name;
          token.picture = profile.picture;

          try {
            await connectDB();

            let user = await User.findOne({ email: profile.email });

            if (!user) {
              console.log("Creating new user for:", profile.email);
              const baseUsername = profile.email.split("@")[0];

              let username = baseUsername;
              let counter = 1;
              while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
              }

              // ✅ Don't include password field at all for Google OAuth users
              user = await User.create({
                name: profile.name,
                username,
                email: profile.email,
                image: profile.picture,
                // No password field for Google OAuth users
              });

              console.log("User created successfully:", user._id);
            } else {
              console.log("Found existing user:", user._id);
            }

            token._id = user._id.toString();
            token.username = user.username;
          } catch (error) {
            console.error("Error in NextAuth jwt callback:", error);
            // Don't throw here, just log the error
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      session.user._id = token._id;
      session.user.username = token.username;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
