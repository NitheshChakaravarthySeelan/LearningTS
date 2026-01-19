import { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string,
  email: string,
  password?: string,
  role: 'admin' | 'teacher' | 'student',
};

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    default: "student",
  },
},
  { timestamps: true });

export default const User = model<IUser>('User', userSchema);
