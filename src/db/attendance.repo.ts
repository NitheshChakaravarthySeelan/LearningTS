import { Schema, model, Document, Ty {
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
  { timestamps: true }
);

const Attendance = model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
