const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const app = require('../src/app');
const { createDocumentRepository } = require('../src/repositories/documentRepository');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa documento local', async (t) => {
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const repository = createDocumentRepository({ storageDir });
  const server = app.createApp({ storageDir, owner: 'alice', repository }).listen(0);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(storageDir, { recursive: true, force: true });
  });
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const form = new FormData();
  form.append('file', new Blob(['conteudo do documento'], { type: 'text/plain' }), 'nota.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  assert.equal(uploadResponse.status, 201);
  const { document } = await uploadResponse.json();
  assert.deepEqual(Object.keys(document).sort(), ['id', 'originalName', 'owner', 'size', 'uploadedAt']);
  assert.equal(document.originalName, 'nota.txt');
  assert.equal(document.owner, 'alice');

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.deepEqual((await listResponse.json()).documents, [document]);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'conteudo do documento');
  assert.match(downloadResponse.headers.get('content-disposition'), /nota\.txt/);

  const otherOwnerServer = app.createApp({ storageDir, owner: 'bob', repository }).listen(0);
  t.after(() => new Promise((resolve) => otherOwnerServer.close(resolve)));
  await new Promise((resolve) => otherOwnerServer.once('listening', resolve));
  const otherOwnerUrl = `http://127.0.0.1:${otherOwnerServer.address().port}`;
  assert.deepEqual((await (await fetch(`${otherOwnerUrl}/documents`)).json()).documents, []);
  const forbiddenDownload = await fetch(`${otherOwnerUrl}/documents/${document.id}/download`);
  assert.equal(forbiddenDownload.status, 404);
});

test('valida arquivo obrigatório e impede acesso a documento de outro dono', async (t) => {
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const server = app.createApp({ storageDir, owner: 'bob' }).listen(0);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(storageDir, { recursive: true, force: true });
  });
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const missingFile = await fetch(`${baseUrl}/upload`, { method: 'POST', body: new FormData() });
  assert.equal(missingFile.status, 400);
  assert.equal((await missingFile.json()).error.code, 'FILE_REQUIRED');

  const notFound = await fetch(`${baseUrl}/documents/secret/download`);
  assert.equal(notFound.status, 404);
  assert.equal((await notFound.json()).error.code, 'DOCUMENT_NOT_FOUND');
});

test('retorna 413 quando o arquivo excede o limite configurado', async (t) => {
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const server = app.createApp({ storageDir, owner: 'alice', maxFileSizeBytes: 4 }).listen(0);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(storageDir, { recursive: true, force: true });
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const form = new FormData();
  form.append('file', new Blob(['maior'], { type: 'text/plain' }), 'large.txt');
  const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
    method: 'POST',
    body: form,
  });
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, 'FILE_TOO_LARGE');
});
