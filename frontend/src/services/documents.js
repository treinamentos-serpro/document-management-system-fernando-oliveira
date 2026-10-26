async function getErrorMessage(response) {
  const result = await response.json().catch(() => null);
  return result?.error?.message || 'Não foi possível concluir a operação.';
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  return response.json();
}

export async function getDocuments() {
  const result = await requestJson('/api/documents');
  return result.documents;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const result = await requestJson('/api/upload', { method: 'POST', body: formData });
  return result.document;
}

export async function downloadDocument(id) {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}/download`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  return response.blob();
}