import { Schema, Document, Types, model } from "mongoose";
import { type IUser } from "../db/user.repo.ts"

export interface IClass {
  className: string,
  teacherIds: IUser['_id'] | IUser,
  studentIds: (IUser['_id'] | IUser)[],
}

const classSchema = new Schema<IClass>(
  {
    className: {
      type: String,
      required: true,
      unique: true,
    },
    teacherIds: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentIds: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ],
  },
  { timestamps: true }
);

export const ClassModel = model<IClass>("Class", classSchema);
