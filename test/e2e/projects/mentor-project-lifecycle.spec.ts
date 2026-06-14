import { expect, test, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3000';
const markdown = readFileSync(resolve(process.cwd(), 'assets/markdown/baby-pose-detection.md'), 'utf8');
const image = readFileSync(resolve(process.cwd(), 'assets/images/baby-pose-detection.png'));

const headings = [
  'Background',
  'Problem Statement',
  'Project Objectives',
  'Proposed Solution',
  'System Workflow',
  'Benefits',
  'Key Features',
  'Expected Outcomes',
];

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const contentJson = (imageUrl: string) => ({
  type: 'doc',
  content: [
    ...headings.flatMap((title) => [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: title }] },
      { type: 'paragraph', content: [{ type: 'text', text: `${title} content from the E2E markdown fixture.` }] },
    ]),
    { type: 'image', attrs: { src: imageUrl, alt: 'Baby Pose Detection' } },
  ],
});

async function expectOk(response: Awaited<ReturnType<APIRequestContext['get']>>) {
  if (!response.ok()) {
    throw new Error(`${response.url()} failed with ${response.status()}: ${await response.text()}`);
  }
}

async function registerMentor(request: APIRequestContext, mentor: { name: string; email: string; password: string }) {
  const response = await request.post(`${API_BASE}/auth/register`, {
    data: { ...mentor, role: 'mentor' },
  });
  await expectOk(response);
  const body = await response.json();
  expect(body.data.email).toBe(mentor.email);
}

async function login(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  await expectOk(response);
}

async function logout(request: APIRequestContext) {
  const response = await request.get(`${API_BASE}/auth/logout`);
  await expectOk(response);
}

async function uploadImage(request: APIRequestContext) {
  const presigned = await request.post(`${API_BASE}/media/presigned`, {
    data: {
      filename: 'baby-pose-detection.png',
      mimeType: 'image/png',
      size: image.byteLength,
      accessType: 'public',
      assetKind: 'IMAGE',
    },
  });
  await expectOk(presigned);
  const presignedBody = await presigned.json();

  const put = await request.put(presignedBody.data.url, {
    data: image,
    headers: { 'Content-Type': 'image/png' },
  });
  await expectOk(put);

  const confirm = await request.patch(`${API_BASE}/media/${presignedBody.data.mediaId}/confirm`, {
    data: { uploaded: true, actualSize: image.byteLength },
  });
  await expectOk(confirm);

  const url = await request.get(`${API_BASE}/media/${presignedBody.data.mediaId}/url`);
  await expectOk(url);
  const urlBody = await url.json();

  return {
    mediaId: presignedBody.data.mediaId as string,
    url: urlBody.data.url as string,
  };
}

test('mentor can create publish update verify and delete project', async ({ request }) => {
  const timestamp = Date.now();

  const mentor = {
    name: `E2E Mentor ${timestamp}`,
    email: `e2e.mentor.${timestamp}@makerhub.test`,
    password: 'Password123!',
  };

  const otherMentor = {
    name: `E2E Other Mentor ${timestamp}`,
    email: `e2e.other.mentor.${timestamp}@makerhub.test`,
    password: 'Password123!',
  };

  const project = {
    title: `Baby Pose Detection ${timestamp}`,
    updatedTitle: `Baby Pose Detection Updated ${timestamp}`,
    summary: `Baby pose detection summary ${timestamp}`,
    updatedSummary: `Updated baby pose detection summary ${timestamp}`,
  };
  const slug = toSlug(project.title);

  await registerMentor(request, mentor);
  await login(request, mentor.email, mentor.password);

  const verify = await request.get(`${API_BASE}/auth/permissions`);
  await expectOk(verify);
  const permissions = await verify.json();
  expect(permissions.data.map((permission: { key: string }) => permission.key)).toEqual(
    expect.arrayContaining(['project:create', 'project:read', 'project:update', 'project:delete'])
  );

  const uploadedImage = await uploadImage(request);
  const create = await request.post(`${API_BASE}/projects`, {
    data: {
      title: project.title,
      slug,
      summary: project.summary,
      description: markdown,
      contentJson: contentJson(uploadedImage.url),
      coverAssetId: uploadedImage.mediaId,
      accessType: 'FREE',
      price: 0,
      currency: 'IDR',
    },
  });
  await expectOk(create);
  const created = await create.json();
  const projectId = created.data.id as string;
  expect(created.data.status).toBe('DRAFT');
  expect(created.data.contentJson).toBeTruthy();
  expect(created.data.coverAssetId).toBe(uploadedImage.mediaId);
  expect(created.data.coverAsset?.id).toBe(uploadedImage.mediaId);
  expect(created.data.toc).toHaveLength(headings.length);
  expect(created.data.toc.map((item: { title: string }) => item.title)).toEqual(headings);

  const draftList = await request.get(`${API_BASE}/projects/public?search=${encodeURIComponent(project.title)}`);
  await expectOk(draftList);
  expect(JSON.stringify(await draftList.json())).not.toContain(project.title);

  const publish = await request.post(`${API_BASE}/projects/${projectId}/publish`);
  await expectOk(publish);
  const published = await publish.json();
  expect(published.data.status).toBe('PUBLISHED');
  expect(published.data.publishedAt).toBeTruthy();

  await logout(request);

  const publicList = await request.get(`${API_BASE}/projects/public?search=${encodeURIComponent(project.title)}`);
  await expectOk(publicList);
  expect(JSON.stringify(await publicList.json())).toContain(project.title);

  const publicDetail = await request.get(`${API_BASE}/projects/public/${slug}`);
  await expectOk(publicDetail);
  const publicProject = await publicDetail.json();
  expect(publicProject.data.title).toBe(project.title);
  expect(publicProject.data.toc.map((item: { title: string }) => item.title)).toEqual(headings);
  expect(JSON.stringify(publicProject.data.contentJson)).toContain(uploadedImage.url);

  await registerMentor(request, otherMentor);
  await login(request, otherMentor.email, otherMentor.password);
  const forbiddenUpdate = await request.patch(`${API_BASE}/projects/${projectId}`, {
    data: { title: `Unauthorized ${timestamp}` },
  });
  expect(forbiddenUpdate.status()).toBe(403);

  await login(request, mentor.email, mentor.password);
  const update = await request.put(`${API_BASE}/projects/${projectId}`, {
    data: {
      title: project.updatedTitle,
      summary: project.updatedSummary,
    },
  });
  await expectOk(update);
  const updated = await update.json();
  expect(updated.data.title).toBe(project.updatedTitle);
  expect(updated.data.summary).toBe(project.updatedSummary);

  await logout(request);
  const updatedPublicDetail = await request.get(`${API_BASE}/projects/public/${slug}`);
  await expectOk(updatedPublicDetail);
  const updatedPublicProject = await updatedPublicDetail.json();
  expect(updatedPublicProject.data.title).toBe(project.updatedTitle);
  expect(updatedPublicProject.data.summary).toBe(project.updatedSummary);
  expect(updatedPublicProject.data.summary).not.toBe(project.summary);

  await login(request, mentor.email, mentor.password);
  const unpublish = await request.post(`${API_BASE}/projects/${projectId}/unpublish`);
  await expectOk(unpublish);
  const unpublished = await unpublish.json();
  expect(unpublished.data.status).toBe('DRAFT');

  await logout(request);
  const unpublishedPublicDetail = await request.get(`${API_BASE}/projects/public/${slug}`);
  expect(unpublishedPublicDetail.status()).toBe(404);

  await login(request, mentor.email, mentor.password);
  const republish = await request.post(`${API_BASE}/projects/${projectId}/publish`);
  await expectOk(republish);

  const deleteProject = await request.delete(`${API_BASE}/projects/${projectId}`);
  await expectOk(deleteProject);

  await logout(request);
  const removedList = await request.get(`${API_BASE}/projects/public?search=${encodeURIComponent(project.updatedTitle)}`);
  await expectOk(removedList);
  expect(JSON.stringify(await removedList.json())).not.toContain(project.updatedTitle);

  const removedDetail = await request.get(`${API_BASE}/projects/public/${slug}`);
  expect(removedDetail.status()).toBe(404);

  await login(request, mentor.email, mentor.password);
  await logout(request);
  const blockedAfterLogout = await request.post(`${API_BASE}/projects/${projectId}/publish`);
  expect(blockedAfterLogout.status()).toBe(401);
});
