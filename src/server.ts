// src/server.ts
import { Elysia } from 'elysia';
import { connectDB } from './config/db';
import { authRoutes } from './http/auth.routes';
import { classRoutes } from './http/class.routes';
import { studentRouter } from './http/student.routes';
import { attendanceRoutes } from './http/attendance.routes';
import { auth } from './middlewares/auth'; // Elysia authentication plugin
// Assuming other middleware like teacherOnly.ts and ownership.ts are also Elysia plugins
import { teacherOnly } from './middlewares/teacherOnly';
import { isClassOwner } from './middlewares/ownership';


// Initialize Elysia app
const app = new Elysia();

// Global hooks/plugins
app
  .onStart(async () => {
    await connectDB();
  })
  .use(auth)
  .use(teacherOnly)
  .use(isClassOwner);


app.get('/health', () => 'OK');

app
  .group('/api', (app) => app
    .use(authRoutes)
    .use(classRoutes)
    .use(studentRouter)
    .use(attendanceRoutes)
  )

app.onError(({ error, set }) => {
  if (error.status) {
    set.status = error.status;
  } else {
    set.status = 500;
  }
  console.error('Elysia error:', error);
  return {
    success: false,
    message: error.message || 'An internal server error occurred.',
    code: error.status || 500,
  };
});


export { app };
