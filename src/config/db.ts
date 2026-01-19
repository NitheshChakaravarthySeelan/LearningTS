import mongoose from "mongoose";
import { env } from "./env.ts";

export async function connectDB() {
  let URL: string = env.MONGO_URI;
  if (!URL) {
    throw new Error("URL is not set for MongoDB");
  }

  try {
    await mongoose.connect(URL);
    console.log("MongoDB connected");
  } catch (error) {
    throw new Error("Error connecting with DB");
  }
}
