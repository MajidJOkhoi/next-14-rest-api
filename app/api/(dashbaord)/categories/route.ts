import connectToDB from "@/lib/db";
import Category from "@/lib/models/category";
import { NextResponse } from "next/server";
import User from "@/lib/models/user";
import { Types } from "mongoose";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid or missing user ID" },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 }
      );
    }

    const categories = await Category.find({ user: new Types.ObjectId(userId) }).populate("user", "username");;

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error while getting categories: ${error.message || error}` },
      { status: 500 }
    );
  }
};

// POST request to create a new category
export const POST = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const { title } = await req.json();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid or missing user ID" },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 }
      );
    }

    const newCategory = new Category({
      title,
      user: new Types.ObjectId(userId),
    });

    await newCategory.save();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error while creating category: ${error.message || error}` },
      { status: 500 }
    );
  }
};
