import { User } from "../../../lib/models/User.js";
import bcrypt from "bcryptjs";
import db from "../../../lib/database/db.js";

export async function POST(request) {
  try {
    await db();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Login Successfull",
        data: { id: user.id, email: user.email, name: user.name },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("ERROR", error);
    return Response.json(
      {
        success: false,
        message: "Internal error",
      },
      { status: 500 }
    );
  }
}
