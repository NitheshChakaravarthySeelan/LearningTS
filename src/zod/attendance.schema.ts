import * as z from "zod";

export const startAttendanceSchema = z.object({
  classId: z.string().min(1, { message: 'Class Id is required' }),
})

export type StartAttendanceInput = z.infer<typeof startAttendanceSchema>;
