import { User } from '../db/user.repo.ts';
import { hashPassword, comparePassword } from '../lib/password.ts';
import { generateToken } from '../lib/jwt.ts';
import { signupSchema, loginSchema, SignupInput, LoginInput } from '../zod/auth.schema.ts';

export async function signup(userData: SignupInput) {
  const result = signupSchema.safeParse(userData);
  if (!result.success) {
    throw new Error("Invalid signup data");
  }

  const user = result.data;

  if (await User.exists(user.email)) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(user.password);
  try {
    const newUser = await User.create({
      name: user.username,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    });

    return newUser;

  } catch (err: any) {
    throw err;
  }
}

export async function login(credentials: LoginInput) {
  const result = loginSchema.safeParse(credentials);
  if (!result.success) {
    throw new Error("Invalid login data");
  }

  const { email, password } = result.data;

  const dbUser = await User.findOne({ email }).select("+password");
  if (!dbUser) {
    throw new Error("Invalid email or password");
  }

  const isValid = await comparePassword((password, dbUser.password));
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const jwtKey = generateToken({ userId: dbUser._id, role: dbUser.role });
  return {
    jwtKey,
    user: {
      id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
    },
  };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}
