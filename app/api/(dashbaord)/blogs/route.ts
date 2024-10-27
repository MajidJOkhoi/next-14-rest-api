import connectToDB from "@/lib/db";
import Blog from "@/lib/models/blog";
import Category from "@/lib/models/category";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

// GET request for fetching blogs with filtering and populated user details

export const GET = async (req: Request) => {
  try {

    // Extract query parameters 
const { searchParams } = new URL(req.url);
const userId = searchParams.get("userId");
const categoryId = searchParams.get("categoryId");
const keywords = searchParams.get("keywords") as string;
const startDate = searchParams.get("startDate");
const endDate = searchParams.get("endDate");
const page = parseInt(searchParams.get("page") || "1", 10); 
const limit = parseInt(searchParams.get("limit") || "10", 10);


    // Validate userId and categoryId as MongoDB ObjectIds
      if (!userId || !Types.ObjectId.isValid(userId) || !categoryId || !Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ message: "Invalid or missing userId or categoryId" }, { status: 400 });
    }

    await connectToDB();

    // Verify if user and category exist
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const category = await Category.findById(categoryId);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    // Initialize filter object
    const filter: any = {
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    };

    // Keyword-based search in title or description
    if (keywords) {
      filter.$or = [
        { title: { $regex: keywords, $options: "i" } },
        { description: { $regex: keywords, $options: "i" } }
      ];
    }

    // Filter by createdAt date range
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

// page 2-1 = 1*10 = 10 
// page 3-1 = 2*10 = 20

  const skip = (page -1 ) * limit ;


    // Fetch and populate blogs sorted by creation date
    const blogs = await Blog.find(filter)
      .sort({ createdAt: "asc" }).skip(skip).limit(limit)
      .populate("user", "username");

    return NextResponse.json({"total blog":blogs.length,blogs},{status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { message: `Error while getting blogs: ${error.message}` },
      { status: 500 }
    );
  }
};

// POST request to create a new blog with populated user details
export const POST = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    // Validate userId and categoryId as MongoDB ObjectIds
    if (!userId || !Types.ObjectId.isValid(userId) || !categoryId || !Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ message: "Invalid or missing userId or categoryId" }, { status: 400 });
    }

    await connectToDB();

    // Verify if user and category exist
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const category = await Category.findById(categoryId);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    const { title, description } = await req.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ message: "Title and description are required" }, { status: 400 });
    }

    // Create and save the new blog entry
    const newBlog = new Blog({
      title,
      description,
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    });

    await newBlog.save();

    // Populate the user data in the newly created blog entry
    const populatedBlog = await Blog.findById(newBlog._id).populate("user", "username");

    return NextResponse.json(
      { message: "Blog created successfully", blog: populatedBlog },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: `Error while creating blog: ${error.message}` },
      { status: 500 }
    );
  }
};
