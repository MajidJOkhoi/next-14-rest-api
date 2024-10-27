import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    title: { type: "string", required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Category = models.Category || model("Category", CategorySchema);

export default Category;
