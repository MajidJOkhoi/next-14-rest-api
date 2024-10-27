// api path is localhost/api/user (auth) folder with paranthsis can be excluded from api url

import connectToDB from "@/lib/db";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

// GET all users
export const GET = async () => {
  try {
    await connectToDB();
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching users: ${error.message || error}` },
      { status: 500 }
    );
  }
};

// POST create a new user
export const POST = async (req: Request) => {
  try {
    await connectToDB();
    // parse data from request
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }
    //  hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error creating user: ${error.message || error}` },
      { status: 500 }
    );
  }
};

// PATCH update a user
export const PATCH = async (req: Request) => {
  try {
    await connectToDB();
    const { userId, username, email, password } = await req.json();

    // Validate if userId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error updating user: ${error.message || error}` },
      { status: 500 }
    );
  }
};

// DELETE a user
export const DELETE = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found" },
        { status: 404 }
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    await connectToDB();
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted", user: deletedUser },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error deleting user: ${error.message || error}` },
      { status: 500 }
    );
  }
};
