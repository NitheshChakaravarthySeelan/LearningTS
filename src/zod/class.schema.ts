import * as z from "zod";

export const createClassSchema = z.object({
  className: z.string().min(1, { message: 'Class Name is required' }),
});

export const addStudentToClassSchema = z.object({
  studentId: z.string().min(1, { message: 'Student Id is required' }),
  classId: z.string().min(1, { message: 'Class Id is required' }),
})

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type AddStudentToClassInput = z.infer<typeof addStudentToClassSchema>;
