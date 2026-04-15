export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type Level = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: '초안',
  PENDING: '심의 중',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: Role;
  profileImageUrl?: string | null;
}

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: '수강생',
  INSTRUCTOR: '강사',
  ADMIN: '관리자',
};

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

export interface Review {
  id: number;
  rating: number;
  content?: string;
  userId: number;
  courseId: number;
  user: { nickname: string; profileImageUrl?: string | null };
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  avgRating: number | null;
  totalCount: number;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: Level;
  status?: CourseStatus;
  rejectionReason?: string | null;
  category: Category;
  instructor?: { id: number; nickname: string; email: string } | null;
  sections?: Section[];
  createdAt: string;
  avgRating?: number | null;
  reviewCount?: number;
  enrollmentCount?: number;
}

export interface CourseListItem {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: Level;
  category: Category;
  createdAt: string;
  avgRating?: number | null;
  reviewCount?: number;
  enrollmentCount?: number;
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
  isCompleted: boolean;
  completedLectureIds: number[];
}

export interface MyReviewItem {
  id: number;
  rating: number;
  content?: string;
  createdAt: string;
  course: { id: number; title: string; thumbnailUrl?: string | null };
}

export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: '입문',
  ELEMENTARY: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};
