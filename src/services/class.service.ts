import { ClassModel } from "../db/class.repo.ts";
import { User } from "../db/user.repo.ts";
import { createClassSchema, addStudentToClassSchema } from "../zod/class.schema";

export async function createClass(className: string, teacherId: string) {
  const input = createClassSchema.parse(className);

  const newClass = new ClassModel({
    className: input.className,
    teacherIds: teacherId,
    studentIds: []
  });

  await newClass.save();
  return newClass;
}

export async function addStudentToClass(classId: string, studentId: string, teacherId: string) {
  const input = addStudentToClassSchema.parse({ studentId, classId });

  try {
    const classIsThere = await ClassModel.findById(input.classId);

    if (!classIsThere) {
      throw new Error("Class not found");
    }

    if (classIsThere.teacherIds.toString() !== teacherId) {
      throw new Error("Forbidden, not class teacher");
    }

    const user = await User.findById(input.studentId);

    if (!user) {
      throw new Error("User not found");
    }
    if (user.role != "student") {
      throw new Error("The user is not student");
    }

    const alreadyExist = await classIsThere.studentIds.some(
      id => id.toString() === input.studentId
    );

    if (alreadyExist) {
      return classIsThere;
    }
    classIsThere.studentIds.push(input.studentId);
    await classIsThere.save()
    return classIsThere;

  } catch (err) {
    throw new Error("Error adding student to class");
  }
}

export async function getClassById(classId: string, userId: string, userRole: 'teacher' | 'student' | 'admin') {
  // Populate while finding the class
  const classDoc = await ClassModel.findById(classId)
    .populate({
      path: 'studentIds',
      select: '_id name email'
    });
  if (!classDoc) {
    throw new Error("Class not found");
  }

  if (userRole === 'teacher') {
    if (classDoc.teacherIds.toString() !== userId) {
      throw new Error("The userId is not the teacher of the class");
    }
  }
  else if (userRole === 'student') {
    const userExist = classDoc.studentIds.some(
      id => id.toString() === userId
    );
    if (!userExist) {
      throw new Error("Student does not belong to the class");
    }
  }
  return classDoc;
}

export async function getAllStudents() {
  const user = await User.find({ role: 'student' });
  if (user.length === 0) {
    throw new Error("No student is available");
  }
  return user;
}
