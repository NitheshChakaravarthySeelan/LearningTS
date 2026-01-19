import { Schema, Document, Types } from "mongoose";
import { IUser } from "user.repo.ts"

export interface IClass extends Document {
  className: String,
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
      type: Schema.Type.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentIds: [{
      type: Schema.Type.ObjectId,
      ref: "User",
      },
    ],
  },
  {timestamps: true}
);

export const ClassModel = model<IClass>("Class", classSchema);
