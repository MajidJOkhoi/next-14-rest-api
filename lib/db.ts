// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nextjs14api";

const connectToDB = async () => {
  try {
    const connectionState = mongoose.connection.readyState;


    if (connectionState === 1) {
      console.log("Already connected to the database.");
      return;
    }

 
    if (connectionState === 2) {
      console.log("Connection to the database is in progress...");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'nextjs14api',
    
    });

    console.log("Connected to the database successfully.");
  } catch (error) {
    console.error(`Error connecting to the database: ${error}`);
    throw error; 
  }
};

export default connectToDB;
