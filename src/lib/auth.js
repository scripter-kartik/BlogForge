// /src/lib.auth.js

import { getToken } from "next-auth/jwt";

export async function getAuthenticatedUser(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.email) {
    throw new ApiError("Unauthorized", 401);
  }

  return {
    id: token._id,
    email: token.email,
    username: token.username,
    name: token.name,
  };
}
