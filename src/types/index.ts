export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  source: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamSession {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  startTime: Date;
  endTime?: Date;
  isFinished: boolean;
  score?: number;
  percentage?: number;
  totalTimeMinutes?: number;
}

export interface ExamResult {
  id: string;
  sessionId: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeMinutes: number;
  completedAt: Date;
}

export interface UserStats {
  totalExams: number;
  scores: number[];
  averageScore: number;
  bestScore: number;
  lastExamDate: string | null;
}

export interface QuestionImport {
  question: string;
  options: string[];
  correctAnswer: number;
  source: string;
  category: string;
}
