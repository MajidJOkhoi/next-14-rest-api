import connectToDB from "@/lib/db";
import Blog from "@/lib/models/blog";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const PATCH = async (req: Request, context: { params: any }) => {
  const blogId = context.params.blog;

  try {
    const { title, description } = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate userId and blogId
    if (!userId || !Types.ObjectId.isValid(userId) || !blogId || !Types.ObjectId.isValid(blogId)) {
      return NextResponse.json({ message: "Invalid user ID or Blog ID" }, { status: 400 });
    }

    await connectToDB();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    // Find and update the blog
    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, user: userId },
      { title, description },
      { new: true }
    );

    if (!blog) {
      return NextResponse.json({ message: "Blog not found in database" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog updated successfully", blog }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error while updating blog: ${error.message || error}` },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request, context: { params: any }) => {
  const blogId = context.params.blog;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate userId and blogId
    if (!userId || !Types.ObjectId.isValid(userId) || !blogId || !Types.ObjectId.isValid(blogId)) {
      return NextResponse.json({ message: "Invalid user ID or Blog ID" }, { status: 400 });
    }

    await connectToDB();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find and delete the blog
    const deletedBlog = await Blog.findOneAndDelete({ _id: blogId, user: userId });
    if (!deletedBlog) {
      return NextResponse.json({ message: "Blog not found in database" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog deleted successfully", blog: deletedBlog }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error while deleting blog: ${error.message || error}` },
      { status: 500 }
    );
  }
};
