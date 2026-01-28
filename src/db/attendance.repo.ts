import { Schema, model, Document, Types } from 'mongoose';
import { IClass } from './class.repo'; // Assuming IClass is defined in class.repo
import { IUser } from './user.repo';   // Assuming IUser is defined in user.repo

export interface IAttendance extends Document {
  classId: IClass['_id'] | IClass;
  studentId: IUser['_id'] | IUser; // Assuming this attendance record is for a single student
  status: 'present' | 'absent'; // Corrected typo
}

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: {
      type: Types.ObjectId,
      required: true, // Corrected casing
      ref: 'Class',
    },
    // If an attendance record is for a single student:
    studentId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['present', 'absent'], // Corrected typo and made consistent with type
      required: true,
      default: 'absent',
    },
  },
  { timestamps: true }
);

const Attendance = model<IAttendance>('Attendance', attendanceSchema);

export { Attendance, IAttendance }; // Export both the model and the interface