import connectToDB from "@/lib/db";
import Category from "@/lib/models/category";
import { NextResponse } from "next/server";
import User from "@/lib/models/user";
import { Types } from "mongoose";

export const PATCH = async (req: Request, context: { params: any }) => {
  const categoryId = context.params.category;

  try {
    const { title } = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId) || !categoryId || !Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ message: "Invalid user ID or category ID" }, { status: 400 });
    }

    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    const category = await Category.findOne({ _id: categoryId, user: userId });

    if (!category) {
      return NextResponse.json({ message: "Category not found in database" }, { status: 404 });
    }

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, { title }, { new: true });

    return NextResponse.json({ message: "Category updated successfully", category: updatedCategory }, { status: 200 });
  
} catch (error: any) {
    return NextResponse.json({ message: `Error while updating category: ${error.message || error}` }, { status: 500 });
  }
};

export const DELETE = async (req: Request, context: { params: any }) => {
  const categoryId = context.params.category;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId) || !categoryId || !Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ message: "Invalid user ID or category ID" }, { status: 400 });
    }

    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const category = await Category.findOne({ _id: categoryId, user: userId });
    if (!category) {
      return NextResponse.json({ message: "Category not found in database" }, { status: 404 });
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({ message: "Category deleted successfully", deletedCategory }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error while deleting category: ${error.message || error}` }, { status: 500 });
  }
};
