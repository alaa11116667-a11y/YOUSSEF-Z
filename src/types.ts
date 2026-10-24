export type GradeLevel = 'grade1' | 'grade2' | 'grade3';

export interface RegisteredStudent {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  grade: GradeLevel;
  governorate?: string;
  registeredAt: string;
  stars: number;
  completedExamsCount?: number;
  solvedProblemsCount?: number;
}

export interface StudentUser {
  id?: string;
  name: string;
  phone?: string;
  parentPhone?: string;
  grade: GradeLevel;
  role: 'student';
  stars?: number;
}

export interface TeacherUser {
  name: string;
  role: 'teacher';
}

export type CurrentUser = StudentUser | TeacherUser;

export interface Question {
  id: string;
  text: string;
  diagramUrl?: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
  explanation: string;
  marks: number;
}

export interface Exam {
  id: string;
  grade: GradeLevel;
  title: string;
  unitTitle: string;
  timeLimitMinutes: number;
  totalMarks: number;
  createdAt: string;
  questions: Question[];
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentPhone?: string;
  grade: GradeLevel;
  score: number;
  totalMarks: number;
  submittedAt: string;
  cheatAlertsCount: number;
  answers: Record<number, number>; // questionIndex -> chosenOptionIndex
  isGraded: boolean; // Only true when Eng. Mohamed Alaa corrects and approves
  teacherNotes?: string;
  gradedAt?: string;
}

export interface Homework {
  id: string;
  grade: GradeLevel;
  title: string;
  chapter: string;
  imageUrl: string;
  description: string;
  dueDate: string;
  createdAt: string;
  submissionsCount?: number;
}

export interface PdfDocument {
  id: string;
  grade: GradeLevel;
  title: string;
  chapter: string;
  fileSize: string;
  downloadUrl: string; // Base64 dataUrl, local blob reference, or url
  previewSnippet: string;
  pagesCount: number;
  createdAt: string;
  directPdfUrl?: string;
  studySummary?: string;
  goldenFormulas?: string[];
}

export interface EngineerProblem {
  id: string;
  grade: GradeLevel;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  statement: string;
  diagramUrl?: string;
  unit: string;
  hints: string[];
  numericalAnswer: string;
  solutionSteps: string[];
  engineerInsight: string;
}

export interface EngineerSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  studentName: string;
  studentPhone?: string;
  grade: GradeLevel;
  numericalAnswer: string;
  writtenSteps: string;
  stepsImageUrl?: string;
  status: 'pending' | 'graded';
  starsAwarded: number;
  teacherFeedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface BoardCapture {
  id: string;
  grade: GradeLevel;
  title: string;
  lectureDate: string;
  imageUrl: string;
  unit: string;
  notes: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'normal' | 'urgent';
}

export interface Complaint {
  id: string;
  studentName: string;
  phone: string;
  grade: string;
  category: 'استفسار علمي' | 'شكوى تقنية' | 'اقتراح' | 'طلب امتحان';
  message: string;
  timestamp: string;
}

export interface AppStateData {
  students: RegisteredStudent[];
  exams: Exam[];
  submissions: ExamSubmission[];
  homeworks: Homework[];
  pdfs: PdfDocument[];
  engineerProblems: EngineerProblem[];
  engineerSubmissions: EngineerSubmission[];
  boardCaptures: BoardCapture[];
  announcements: Announcement[];
  complaints: Complaint[];
}
