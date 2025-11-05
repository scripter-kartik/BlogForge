// src/lib/auth.js - COMPLETE FIX FOR BOTH GOOGLE & MANUAL LOGIN
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
    _id: token._id || token.id || token.sub,
    id: token._id || token.id || token.sub,
    email: token.email,
    username: token.username,
    name: token.name,
    image: token.picture || token.image,
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
          
          // ✅ CRITICAL FIX: Select password field explicitly
          const user = await User.findOne({ email: credentials.email }).select("+password");
          
          if (!user) {
            console.log("❌ User not found:", credentials.email);
            throw new Error("Invalid credentials");
          }

          // ✅ Check if password exists (Google users won't have password)
          if (!user.password) {
            console.log("❌ No password set for user:", credentials.email);
            throw new Error("Please login with Google");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log("❌ Invalid password for:", credentials.email);
            throw new Error("Invalid credentials");
          }

          console.log("✅ Credentials login successful:", {
            _id: user._id.toString(),
            email: user.email,
            username: user.username
          });

          // ✅ CRITICAL FIX: Return _id consistently with Google login
          return {
            _id: user._id.toString(),
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Credentials auth error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: { 
    signIn: "/",
    error: "/", // Redirect to home on error
  },

  callbacks: {
    // ✅ FIXED JWT callback - Works for BOTH Google & Credentials
    async jwt({ token, account, profile, user, trigger }) {
      console.log("\n=== JWT CALLBACK START ===");
      console.log("Trigger:", trigger);
      console.log("Provider:", account?.provider || "refresh");
      
      // ✅ GOOGLE PROVIDER
      if (account?.provider === "google" && profile) {
        try {
          await connectDB();
          let dbUser = await User.findOne({ email: profile.email });

          if (!dbUser) {
            console.log("📝 Creating new Google user:", profile.email);
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
              password: null, // No password for Google users
            });
            console.log("✅ New Google user created with _id:", dbUser._id.toString());
          } else {
            console.log("✅ Existing Google user found with _id:", dbUser._id.toString());
          }

          // ✅ Store MongoDB _id consistently
          const mongoId = dbUser._id.toString();
          token._id = mongoId;
          token.id = mongoId;
          token.sub = mongoId;
          token.username = dbUser.username;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image || profile.picture || null;
          token.image = dbUser.image || profile.picture || null;
          token.provider = "google";
          
          console.log("✅ Google token set:", {
            _id: token._id,
            email: token.email,
            username: token.username
          });
        } catch (error) {
          console.error("❌ Google JWT callback error:", error);
          throw error;
        }
      }

      // ✅ CREDENTIALS PROVIDER
      else if (user && account?.provider === "credentials") {
        console.log("📝 Processing credentials login:", user.email);
        
        const userId = user._id || user.id;
        token._id = userId;
        token.id = userId;
        token.sub = userId;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.image = user.image;
        token.provider = "credentials";
        
        console.log("✅ Credentials token set:", {
          _id: token._id,
          email: token.email,
          username: token.username
        });
      }

      // ✅ TOKEN REFRESH (subsequent calls)
      else if (!account && !user) {
        console.log("🔄 Token refresh - ensuring consistency");
        
        // Ensure all ID fields are consistent
        if (token._id) {
          token.id = token._id;
          token.sub = token._id;
        } else if (token.id) {
          token._id = token.id;
          token.sub = token.id;
        } else if (token.sub) {
          token._id = token.sub;
          token.id = token.sub;
        }

        // Ensure image field is consistent
        if (token.picture && !token.image) {
          token.image = token.picture;
        } else if (token.image && !token.picture) {
          token.picture = token.image;
        }
      }

      // ✅ Handle session update trigger
      if (trigger === "update" && user) {
        console.log("🔄 Updating token with new user data");
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
        if (user.image) {
          token.picture = user.image;
          token.image = user.image;
        }
        if (user.bio !== undefined) token.bio = user.bio;
      }

      console.log("Token final state:", {
        _id: token._id,
        id: token.id,
        sub: token.sub,
        email: token.email,
        username: token.username,
        provider: token.provider
      });
      console.log("=== JWT CALLBACK END ===\n");
      
      return token;
    },

    // ✅ FIXED SESSION callback - Works for BOTH providers
    async session({ session, token }) {
      console.log("\n=== SESSION CALLBACK START ===");
      console.log("Token in session:", {
        _id: token._id,
        id: token.id,
        email: token.email,
        provider: token.provider
      });
      
      if (token) {
        session.user = session.user || {};

        // ✅ Use MongoDB _id consistently
        const userId = token._id || token.id || token.sub;
        
        // Set all ID variations for compatibility
        session.user._id = userId;
        session.user.id = userId;
        session.user.sub = userId;
        
        // Set user details
        session.user.username = token.username || null;
        session.user.email = token.email || session.user.email || null;
        session.user.name = token.name || session.user.name || null;
        session.user.image = token.picture || token.image || session.user.image || null;
        session.user.bio = token.bio || null;
        session.user.provider = token.provider || null;

        console.log("✅ Session user final:", {
          _id: session.user._id,
          email: session.user.email,
          username: session.user.username,
          provider: session.user.provider
        });
      }
      
      console.log("=== SESSION CALLBACK END ===\n");
      return session;
    },
    
    async signIn({ user, account, profile }) {
      console.log("\n=== SIGNIN CALLBACK ===");
      console.log("Provider:", account?.provider);
      console.log("User email:", user?.email);
      console.log("User _id:", user?._id);
      console.log("=== SIGNIN CALLBACK END ===\n");
      
      return true;
    }
  },

  debug: process.env.NODE_ENV === 'development',
};