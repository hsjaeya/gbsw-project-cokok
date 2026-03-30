export type Role = 'STUDENT' | 'ADMIN';
export type Level = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
}

export interface Lecture {
  id: number;
  title: string;
  youtubeVideoId: string;
  durationSeconds?: number;
  isPreview: boolean;
  order: number;
}

export interface Section {
  id: number;
  title: string;
  order: number;
  lectures: Lecture[];
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: Level;
  category: Category;
  sections?: Section[];
  createdAt: string;
}

export interface CourseListItem {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: Level;
  category: Category;
  createdAt: string;
}

export interface CoursesResponse {
  courses: CourseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnrollmentItem {
  courseId: number;
  title: string;
  thumbnailUrl?: string;
  progressRate: number;
}

export interface ProgressResponse {
  totalLectures: number;
  completedLectures: number;
  progressRate: number;
  completedLectureIds: number[];
}

export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: '입문',
  ELEMENTARY: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};
