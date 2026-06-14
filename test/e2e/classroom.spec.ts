import { config } from 'dotenv';
import { test, expect, type APIRequestContext } from '@playwright/test';

// Load environment variables from .env file
config({ path: '.env' });

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:4000';

const STUDENT = {
  email: 'lexi.student@gmail.com',
  password: 'Password1_',
};

// Learning class from mock data
const LEARNING_CLASS = {
  id: '550e8400-e29b-41d4-a716-446655440101',
  slug: 'mastering-modular-architecture',
  title: 'Mastering Modular Architecture in NestJS',
};

async function login(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(`Login failed with status ${response.status()}: ${await response.text()}`);
  }
  const cookies = response.headers()['set-cookie'];
  const cookiesArray = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  const accessTokenCookie = cookiesArray.find((cookie: string) => cookie.includes('access_token='));
  const token = accessTokenCookie?.match(/access_token=([^;]+)/)?.[1];
  if (!token) {
    throw new Error('Access token not found in cookies');
  }
  return { token, data: await response.json() };
}

async function enroll(request: APIRequestContext, classId: string, token: string) {
  const response = await request.post(`${API_BASE}/enrollments/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Enrollment failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

async function getClassroom(request: APIRequestContext, classId: string, token: string) {
  const response = await request.get(`${API_BASE}/classroom/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Get classroom failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

async function resumeLearning(request: APIRequestContext, classId: string, token: string) {
  const response = await request.get(`${API_BASE}/classroom/${classId}/resume`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Resume learning failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

async function updateLessonProgress(request: APIRequestContext, lessonId: string, status: string, token: string) {
  const response = await request.patch(`${API_BASE}/classroom/lesson/${lessonId}/progress`, {
    data: { status },
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok()) {
    throw new Error(`Update lesson progress failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

async function completeLesson(request: APIRequestContext, lessonId: string, token: string) {
  const response = await request.post(`${API_BASE}/classroom/lesson/${lessonId}/complete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Complete lesson failed with status ${response.status()}: ${await response.text()}`);
  }
  return await response.json();
}

test.describe('Classroom Experience - API Only', () => {
  test('student can enroll in a class', async ({ request }) => {
    // Step 1: Login as student
    const { token } = await login(request, STUDENT.email, STUDENT.password);
    expect(token).toBeTruthy();

    // Step 2: Enroll in a learning class
    const enrollmentResponse = await enroll(request, LEARNING_CLASS.id, token);
    expect(enrollmentResponse.data).toBeTruthy();
    expect(enrollmentResponse.data.userId).toBeTruthy();
    expect(enrollmentResponse.data.classId).toBe(LEARNING_CLASS.id);
    expect(enrollmentResponse.data.status).toBe('ACTIVE');
  });

  test('student can get classroom data', async ({ request }) => {
    // Step 1: Login as student
    const { token } = await login(request, STUDENT.email, STUDENT.password);
    expect(token).toBeTruthy();

    // Step 2: Enroll in a learning class
    await enroll(request, LEARNING_CLASS.id, token);

    // Step 3: Get classroom data
    const classroomResponse = await getClassroom(request, LEARNING_CLASS.id, token);
    expect(classroomResponse.data).toBeTruthy();
    expect(classroomResponse.data.enrollment).toBeTruthy();
    expect(classroomResponse.data.projects).toBeTruthy();
    expect(classroomResponse.data.enrollment.class.title).toBe(LEARNING_CLASS.title);
  });

  test('student can resume learning from last visited lesson', async ({ request }) => {
    // Step 1: Login as student
    const { token } = await login(request, STUDENT.email, STUDENT.password);
    expect(token).toBeTruthy();

    // Step 2: Enroll in a learning class
    await enroll(request, LEARNING_CLASS.id, token);

    // Step 3: Resume learning
    const resumeResponse = await resumeLearning(request, LEARNING_CLASS.id, token);
    expect(resumeResponse.data).toBeTruthy();
    // The first lesson should be returned if no progress exists
  });

  test('student can update lesson progress', async ({ request }) => {
    // Step 1: Login as student
    const { token } = await login(request, STUDENT.email, STUDENT.password);
    expect(token).toBeTruthy();

    // Step 2: Enroll in a learning class
    await enroll(request, LEARNING_CLASS.id, token);

    // Step 3: Get classroom data to find a lesson ID
    const classroomResponse = await getClassroom(request, LEARNING_CLASS.id, token);
    const firstLesson = classroomResponse.data.projects[0]?.project.sections[0]?.lessons[0];
    if (!firstLesson) {
      test.skip();
      return;
    }

    // Step 4: Update lesson progress to IN_PROGRESS
    const progressResponse = await updateLessonProgress(request, firstLesson.id, 'IN_PROGRESS', token);
    expect(progressResponse.data).toBeTruthy();
    expect(progressResponse.data.status).toBe('IN_PROGRESS');
  });

  test('student can complete a lesson', async ({ request }) => {
    // Step 1: Login as student
    const { token } = await login(request, STUDENT.email, STUDENT.password);
    expect(token).toBeTruthy();

    // Step 2: Enroll in a learning class
    await enroll(request, LEARNING_CLASS.id, token);

    // Step 3: Get classroom data to find a lesson ID
    const classroomResponse = await getClassroom(request, LEARNING_CLASS.id, token);
    const firstLesson = classroomResponse.data.projects[0]?.project.sections[0]?.lessons[0];
    if (!firstLesson) {
      test.skip();
      return;
    }

    // Step 4: Complete the lesson
    const completeResponse = await completeLesson(request, firstLesson.id, token);
    expect(completeResponse.data).toBeTruthy();
    expect(completeResponse.data.status).toBe('COMPLETED');
  });
});
