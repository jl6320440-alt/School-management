import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as kv from "./kv_store";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0f9c0abd/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize demo data endpoint
app.post("/make-server-0f9c0abd/init-demo-data", async (c) => {
  try {
    // Check if data already exists
    const existingUsers = await kv.getByPrefix('user:');
    if (existingUsers.length > 0) {
      console.log('Demo data already initialized');
      return c.json({ success: true, message: "Demo data already exists" });
    }

    // Demo users
    const demoUsers = [
      {
        id: "demo-admin",
        email: "admin@school.com",
        password: "admin123",
        name: "Admin User",
        role: "admin",
      },
      {
        id: "demo-teacher",
        email: "teacher@school.com",
        password: "teacher123",
        name: "Sarah Williams",
        role: "teacher",
      },
      {
        id: "demo-student",
        email: "student@school.com",
        password: "student123",
        name: "Alice Johnson",
        role: "student",
        classId: "class-10a",
      },
      {
        id: "demo-parent",
        email: "parent@school.com",
        password: "parent123",
        name: "Robert Johnson",
        role: "parent",
        childIds: ["student:1"],
      },
    ];

    // Demo students
    const students = [
      {
        id: 'student:1',
        name: 'Alice Johnson',
        email: 'alice@school.com',
        classId: 'class-10a',
        rollNumber: '10A-001',
        dateOfBirth: '2008-05-15',
        guardianName: 'Robert Johnson',
        guardianPhone: '+1234567890',
        address: '123 Main St',
        enrollmentDate: '2023-01-15',
      },
      {
        id: 'student:2',
        name: 'Bob Smith',
        email: 'bob@school.com',
        classId: 'class-10a',
        rollNumber: '10A-002',
        dateOfBirth: '2008-08-20',
        guardianName: 'Mary Smith',
        guardianPhone: '+1234567891',
        address: '456 Oak Ave',
        enrollmentDate: '2023-01-15',
      },
      {
        id: 'student:3',
        name: 'Charlie Brown',
        email: 'charlie@school.com',
        classId: 'class-9a',
        rollNumber: '9A-001',
        dateOfBirth: '2009-03-10',
        guardianName: 'David Brown',
        guardianPhone: '+1234567892',
        address: '789 Elm St',
        enrollmentDate: '2023-01-15',
      },
    ];

    // Demo teachers
    const teachers = [
      {
        id: 'teacher:1',
        name: 'Dr. Sarah Williams',
        email: 'sarah@school.com',
        phone: '+1234567893',
        subjects: ['Mathematics', 'Physics'],
        classes: ['class-10a', 'class-10b'],
        salary: 5000,
        joiningDate: '2020-06-01',
      },
      {
        id: 'teacher:2',
        name: 'Prof. Michael Davis',
        email: 'michael@school.com',
        phone: '+1234567894',
        subjects: ['English', 'History'],
        classes: ['class-9a', 'class-9b'],
        salary: 4500,
        joiningDate: '2021-08-15',
      },
    ];

    // Demo classes
    const classes = [
      {
        id: 'class-10a',
        name: 'Grade 10',
        section: 'A',
        grade: 10,
        teacherId: 'teacher:1',
        students: ['student:1', 'student:2'],
        subjects: ['math', 'physics', 'chemistry', 'english'],
      },
      {
        id: 'class-9a',
        name: 'Grade 9',
        section: 'A',
        grade: 9,
        teacherId: 'teacher:2',
        students: ['student:3'],
        subjects: ['math', 'science', 'english', 'history'],
      },
    ];

    // Demo exams
    const exams = [
      {
        id: 'exam:1',
        name: 'Mid-Term Mathematics',
        classId: 'class-10a',
        subjectId: 'math',
        date: '2025-11-20',
        totalMarks: 100,
        duration: 120,
      },
      {
        id: 'exam:2',
        name: 'Final Physics',
        classId: 'class-10a',
        subjectId: 'physics',
        date: '2025-12-15',
        totalMarks: 100,
        duration: 180,
      },
    ];

    // Demo fees
    const fees = [
      {
        id: 'fee:1',
        studentId: 'student:1',
        amount: 1000,
        dueDate: '2025-11-30',
        status: 'paid',
        paidDate: '2025-11-01',
        description: 'Tuition Fee - November',
      },
      {
        id: 'fee:2',
        studentId: 'student:2',
        amount: 1000,
        dueDate: '2025-11-30',
        status: 'pending',
        description: 'Tuition Fee - November',
      },
    ];

    // Demo books
    const books = [
      {
        id: 'book:1',
        title: 'Advanced Mathematics',
        author: 'John Smith',
        isbn: '978-1234567890',
        category: 'Mathematics',
        copies: 10,
        available: 7,
      },
      {
        id: 'book:2',
        title: 'Physics Fundamentals',
        author: 'Jane Doe',
        isbn: '978-0987654321',
        category: 'Science',
        copies: 8,
        available: 5,
      },
    ];

    // Save all data
    const entries: [string, any][] = [
      ...demoUsers.map((u): [string, any] => {
        const { password, ...userData } = u;
        return [`user:${u.id}`, userData];
      }),
      ...students.map((s): [string, any] => [s.id, s]),
      ...teachers.map((t): [string, any] => [t.id, t]),
      ...classes.map((c): [string, any] => [c.id, c]),
      ...exams.map((e): [string, any] => [e.id, e]),
      ...fees.map((f): [string, any] => [f.id, f]),
      ...books.map((b): [string, any] => [b.id, b]),
    ];

    // Convert entries to separate keys and values arrays for server-side kv.mset
    const keys: string[] = [];
    const values: any[] = [];
    
    for (const entry of entries) {
      keys.push(entry[0]);
      values.push(entry[1]);
    }
    
    console.log(`Saving ${keys.length} entries to database`);
    await kv.mset(keys, values);
    
    console.log('Demo data initialized successfully');
    return c.json({ success: true, message: "Demo data initialized successfully" });
  } catch (error) {
    console.error("Error initializing demo data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Generic KV operations endpoints
// IMPORTANT: Specific routes must come before generic :key routes

// Prefix search endpoint (must be before generic routes)
app.post("/make-server-0f9c0abd/kv/prefix-search", async (c) => {
  try {
    const { prefix } = await c.req.json();
    const values = await kv.getByPrefix(prefix);
    return c.json({ success: true, values });
  } catch (error) {
    console.error("Error searching KV by prefix:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Generic key operations
app.get("/make-server-0f9c0abd/kv/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const value = await kv.get(key);
    return c.json({ success: true, value });
  } catch (error) {
    console.error("Error getting KV value:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-0f9c0abd/kv/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    const { value } = body;
    
    // Validate that value is not null or undefined
    if (value === null || value === undefined) {
      console.error(`Attempted to set null/undefined value for key: ${key}`);
      return c.json({ success: false, error: 'Value cannot be null or undefined' }, 400);
    }
    
    await kv.set(key, value);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error setting KV value:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-0f9c0abd/kv/:key", async (c) => {
  try {
    const key = c.req.param('key');
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting KV value:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// The following is for Deno deployment; guard it so local TypeScript checks won't fail.
// In Deno runtime the global `Deno` object exists and can be used to serve the app.
if (typeof Deno !== "undefined" && typeof (Deno as any).serve === "function") {
  (Deno as any).serve(app.fetch);
}