export interface Student {
  id: string;
  /** unique student code, e.g. AB123 */
  studentCode?: string;
  name: string;
  email: string;
  classId?: string;
  /** human-readable class name, e.g. Grade 1 */
  className?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  avatar?: string;
  /** student's active status */
  status?: 'active' | 'inactive';
  enrollmentDate?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects?: string[];
  classes?: string[];
  salary?: number;
  joiningDate?: string;
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  section: string;
  grade: number;
  teacherId: string;
  students: string[];
  subjects: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  classIds: string[];
}

export interface Exam {
  id: string;
  name: string;
  classId: string;
  subjectId: string;
  date: string;
  totalMarks: number;
  duration: number;
}

export interface Result {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  grade: string;
  remarks?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  available: number;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  author: string;
  targetRole?: string;
  targetClass?: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
