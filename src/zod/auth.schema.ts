import * as z from "zod";

export const signupSchema = z.object({
  username: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 character long' }),
  role: z.enum(["teacher", "student", "admin"], {
    errorMap: () => ({ message: 'Role must be mentioned' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 character long' }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
