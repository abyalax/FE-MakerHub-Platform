import type { ClassType, ContentStatus, EnrollmentStatus } from '~/layers/shared/app/common/enum';
import type { Category, Project, LessonProgress, ProjectProgress } from '~/layers/projects/types';

export interface LearningClass {
  id: string;
  mentorId: string;
  authorId: string;
  categoryId?: number | undefined;
  coverAssetId?: string | undefined;
  title: string;
  slug: string;
  description: string;
  classType: ClassType;
  status: ContentStatus;
  price: string | number;
  currency: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  coverUrl?: string | null;
  projectCount: number;
  mentor: {
    id: string;
    userId: string;
    name?: string;
    headline?: string;
    email?: string;
  };
  category?: Category | null;
  projects: LearningClassProject[];
  startProject?: Project;
}

export interface LearningClassProject {
  classId: string;
  projectId: string;
  sortOrder: number;
  project: Project;
}

export interface LearningProjectPayload {
  projectId: string;
  sortOrder: number;
}

export interface CreateLearningPayload {
  title: string;
  description: string;
  categoryId: number;
  coverAssetId?: string;
  classType?: ClassType;
  projects: LearningProjectPayload[];
}

export interface UpdateLearningPayload extends Partial<CreateLearningPayload> {
  status?: ContentStatus;
}

export interface Enrollment {
  id: string;
  userId: string;
  classId: string;
  status: EnrollmentStatus;
  progressPercent: string;
  enrolledAt: string;
  completedAt?: string;
  user: {
    id: string;
    email: string;
  };
  class: LearningClass;
  projectProgress: ProjectProgress[];
}

export interface ClassroomData {
  enrollment: Enrollment;
  projects: ClassroomProject[];
}

export interface ClassroomProject {
  classId: string;
  projectId: string;
  sortOrder: number;
  project: {
    id: string;
    title: string;
    sections: ClassroomSection[];
    progress?: ProjectProgress;
  };
}

export interface ClassroomSection {
  id: string;
  projectId: string;
  title: string;
  sortOrder: number;
  lessons: ClassroomLesson[];
}

export interface ClassroomLesson {
  id: string;
  sectionId: string;
  title: string;
  content?: string;
  isPreview: boolean;
  sortOrder: number;
  progress?: LessonProgress;
  videoAsset?: {
    id: string;
    publicUrl?: string;
  };
}

export interface LessonDetail extends ClassroomLesson {
  section: {
    id: string;
    projectId: string;
    title: string;
  };
}
