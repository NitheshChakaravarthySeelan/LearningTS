import {connectDB } from './src/config/db.ts'

async function  main() {
  await connectDB();
}

main().catch((err) => {
  console.error("Fatal startup error: ", err);
  process.exit(1);
});
