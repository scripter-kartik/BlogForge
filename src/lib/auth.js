// src/lib/auth.js - COMPLETE FIX with better username generation
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

// ✅ Helper function to generate unique username
async function generateUniqueUsername(email, name) {
  // Try email-based username first
  let baseUsername = email.split("@")[0].toLowerCase().trim();
  
  // Remove special characters and spaces
  baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');
  
  // If empty after cleanup, use name
  if (!baseUsername || baseUsername.length < 3) {
    baseUsername = (name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  // Ensure minimum length
  if (baseUsername.length < 3) {
    baseUsername = 'user' + baseUsername;
  }
  
  let username = baseUsername;
  let counter = 1;
  
  // Keep trying until we find a unique username
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }
  
  console.log(`✅ Generated unique username: ${username} (from base: ${baseUsername})`);
  return username;
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
          
          if (!user) {
            console.log("❌ User not found:", credentials.email);
            throw new Error("Invalid credentials");
          }

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
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: { 
    signIn: "/",
    error: "/",
  },

  callbacks: {
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
            
            // ✅ Generate unique username
            const username = await generateUniqueUsername(profile.email, profile.name);
            
            dbUser = await User.create({
              name: profile.name || username,
              username: username,
              email: profile.email,
              image: profile.picture || null,
              password: null,
              provider: "google",
              googleId: profile.sub || profile.id,
            });
            
            console.log("✅ New Google user created:", {
              _id: dbUser._id.toString(),
              username: dbUser.username,
              email: dbUser.email
            });
          } else {
            console.log("✅ Existing Google user found:", {
              _id: dbUser._id.toString(),
              username: dbUser.username,
              email: dbUser.email
            });
            
            // ✅ Update image if changed
            if (profile.picture && profile.picture !== dbUser.image) {
              dbUser.image = profile.picture;
              await dbUser.save();
              console.log("✅ Updated user image");
            }
          }

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
            username: token.username,
            email: token.email
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
          username: token.username,
          email: token.email
        });
      }

      // ✅ TOKEN REFRESH
      else if (!account && !user) {
        console.log("🔄 Token refresh - ensuring consistency");
        
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
        username: token.username,
        email: token.email,
        provider: token.provider
      });
      console.log("=== JWT CALLBACK END ===\n");
      
      return token;
    },

    async session({ session, token }) {
      console.log("\n=== SESSION CALLBACK START ===");
      console.log("Token username:", token.username);
      console.log("Token email:", token.email);
      
      if (token) {
        session.user = session.user || {};

        const userId = token._id || token.id || token.sub;
        
        session.user._id = userId;
        session.user.id = userId;
        session.user.sub = userId;
        session.user.username = token.username || null;
        session.user.email = token.email || session.user.email || null;
        session.user.name = token.name || session.user.name || null;
        session.user.image = token.picture || token.image || session.user.image || null;
        session.user.bio = token.bio || null;
        session.user.provider = token.provider || null;

        console.log("✅ Session user final:", {
          _id: session.user._id,
          username: session.user.username,
          email: session.user.email,
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
      console.log("=== SIGNIN CALLBACK END ===\n");
      
      return true;
    }
  },

  debug: process.env.NODE_ENV === 'development',
};