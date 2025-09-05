import { User } from "../../../lib/models/User.js";
import bcrypt from "bcryptjs";
import db from "../../../lib/database/db.js";



export async function POST(request) {
  try {
    await db();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          message: "please fill all the details",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 400 }
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashPassword });

    return Response.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
