# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para enviar, listar e baixar documentos armazenados localmente, associando cada documento a um usuário.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição.
- Listagem dos documentos associados ao usuário.
- Download de um documento pelo identificador.
- Associação de cada documento a um usuário.
- Armazenamento dos arquivos no filesystem local da aplicação.
- Armazenamento dos metadados em memória nesta fase.
- Interface web para envio, listagem e download.

### Fora do escopo

- Armazenamento em nuvem ou por provedores externos.
- Versionamento de documentos.
- Persistência dos metadados em banco de dados.
- Autenticação, cadastro de usuários e gestão de credenciais.
- Compartilhamento, exclusão, edição ou renomeação de documentos.
- Busca avançada, paginação e pré-visualização de arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo por requisição multipart. |
| RF-02 | O sistema rejeita arquivo ausente ou acima do limite configurado. |
| RF-03 | O sistema atribui identificador único e registra nome original, tamanho, data de envio e dono. |
| RF-04 | O usuário pode listar os metadados dos documentos associados à sua identidade. |
| RF-05 | O usuário pode baixar documento pelo identificador, se associado à sua identidade. |
| RF-06 | Documento inexistente ou não associado ao usuário resulta em erro apropriado. |
| RF-07 | A interface permite selecionar e enviar arquivo, consultar a lista e baixar documento. |
| RF-08 | A interface apresenta estados de carregamento e mensagens de erro nas operações. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Arquivos são gravados somente no filesystem local via `multer` com `diskStorage`. |
| RNF-02 | O diretório padrão é `backend/storage`, configurável por variável de ambiente. |
| RNF-03 | Os metadados permanecem em memória durante a execução do processo. |
| RNF-04 | O nome no disco é gerado pelo sistema; o nome original não forma caminhos locais. |
| RNF-05 | O limite de tamanho é configurável, com padrão de 10 MiB por arquivo. |
| RNF-06 | Configurações operacionais são fornecidas por variáveis de ambiente. |
| RNF-07 | Erros são tratados nas camadas responsáveis e respostas não expõem caminhos ou stack traces. |
| RNF-08 | Listagens e respostas públicas não expõem conteúdo binário nem nome interno de armazenamento. |
| RNF-09 | Reiniciar o processo perde os metadados em memória; arquivos sem metadados não são recuperáveis pela API. |

## 5. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único gerado pelo sistema. |
| `originalName` | string | Nome informado pelo cliente. |
| `size` | number | Tamanho efetivamente recebido, em bytes. |
| `uploadedAt` | string | Data e hora do envio em ISO 8601. |
| `owner` | string | Identificador do usuário associado ao documento. |

### Metadados internos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `storageName` | string | Nome opaco gerado pelo sistema para localizar o arquivo; nunca exposto pela API. |
| `mimeType` | string ou null | Tipo de mídia recebido, tratado como não confiável. |

`id` e `storageName` são gerados pelo servidor. `uploadedAt` e `size` são definidos pelo servidor a partir do upload. Nesta fase, `owner` vem de `DMS_DEFAULT_OWNER` (padrão `local-user`); isso habilita o modo local de usuário único, mas não representa autenticação nem isolamento seguro multiusuário.

## 6. Contratos de API

O backend expõe os caminhos sem prefixo. O frontend os acessa como `/api/...`; o proxy de desenvolvimento remove `/api` ao encaminhar ao backend.

### Erros

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Selecione um arquivo para enviar."
  }
}
```

`code` é estável para tratamento pela interface. `message` não expõe detalhes internos.

### `POST /upload`

- Entrada: `multipart/form-data`, campo obrigatório `file`, um arquivo por requisição.
- Sucesso: `201 Created`, JSON `{ "document": { "id", "originalName", "size", "uploadedAt", "owner" } }`.
- Erros: `400 FILE_REQUIRED`, `413 FILE_TOO_LARGE`, `500 UPLOAD_FAILED`.
- Se o registro de metadados falhar após a gravação, o arquivo recém-criado deve ser removido quando possível.

### `GET /documents`

- Sucesso: `200 OK`, JSON `{ "documents": [...] }` com metadados públicos do usuário corrente.
- Lista vazia: `{ "documents": [] }`.
- Erro: `500 DOCUMENTS_LIST_FAILED`.

### `GET /documents/:id/download`

- Sucesso: `200 OK`, corpo binário e `Content-Disposition: attachment` com o nome original como sugestão.
- O `Content-Type` usa o tipo conhecido ou `application/octet-stream`.
- Erros: `404 DOCUMENT_NOT_FOUND` para inexistente ou dono diferente; `500 DOWNLOAD_FAILED` para falha de leitura.
- O cliente nunca fornece caminho de filesystem.

## 7. Decisões arquiteturais

- Backend Node.js e Express, CommonJS, organizado como `routes -> controllers -> services -> repositories`.
- `routes` definem endpoints e middleware `multer`; `controllers` tratam HTTP; `services` aplicam regras de negócio; `repositories` mantêm metadados em memória e localizam arquivos locais.
- Upload usa `multer` com `diskStorage`; arquivos são gravados em `backend/storage` por padrão, sem provedores externos.
- Frontend React organizado em componentes, páginas e serviços, usando `fetch` via prefixo `/api`.
- O proxy de desenvolvimento Vite encaminha `/api` para o backend local.
- A identidade é configurada por ambiente nesta fase; autenticação está fora do escopo.

## 8. Configuração

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local dos arquivos. |
| `MAX_FILE_SIZE_BYTES` | `10485760` | Limite por arquivo, em bytes. |
| `DMS_DEFAULT_OWNER` | `local-user` | Identidade local associada aos documentos. |

## 9. Plano de execução

1. Aprovar requisitos, modelo de dados, contratos de API e decisões desta especificação.
2. Implementar endpoints e fluxo de upload, listagem e download nas camadas do backend, mantendo o armazenamento local.
3. Validar casos de sucesso, erros HTTP, associação do dono e falhas do filesystem.
4. Implementar no frontend envio, listagem, download e tratamento de erros consumindo `/api`.
5. Validar integração frontend-backend e critérios de aceite de ponta a ponta.

## 10. Critérios de aceite

- Upload grava arquivo local via `multer`/`diskStorage`, com nome interno gerado pelo sistema.
- Upload inválido recebe erro correspondente; upload válido retorna `201` e metadados públicos.
- Listagem contém apenas metadados do usuário corrente e não expõe dados internos.
- Download de documento existente retorna binário com nome original sugerido.
- Documento inexistente ou associado a outro dono não pode ser baixado.
- Erros de API usam o formato JSON definido e não revelam detalhes internos.
- Interface permite enviar, listar e baixar documentos usando `/api`.
- Configurações previstas podem ser fornecidas por variáveis de ambiente.