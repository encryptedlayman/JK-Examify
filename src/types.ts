export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  xp: number;
  streak: number;
  lastActive: string;
  badges: string[];
  rank: 'Beginner' | 'Intermediate' | 'Expert' | 'Master';
}

export interface MCQ {
  id: string;
  category: string;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examType: string[];
}

export interface TestResult {
  id?: string;
  userId: string;
  testType: 'Topic' | 'Sectional' | 'Full';
  category: string;
  topic: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  totalXP: number;
  period: 'Weekly' | 'Monthly' | 'AllTime';
}
