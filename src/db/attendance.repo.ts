import { Schema, model, Document, Types } from "mongoose";
import { IClass } from "../db/class.repo.ts"
import { IUser } from "./user.repo.ts"

export interface IAttendance extends Document {
  classId: IClass['_id'] | IClass;
  studentId: IUser['_id'] | IUser;
  status: 'Present' | 'Abscent';
}
const attendanceSchema = new Schema<IAttendance>(
  {
    classId:
    {
      type: Types.ObjectId,
      required: True,
      ref: 'Class',
    },
    studentId: [
      {
        type: Types.ObjectId[],
        ref: 'User',
      },
    ],
  },
  {timestamps: true}
);

export default Attendance = model<IAttendance>('Attendance', attendanceSchema)
