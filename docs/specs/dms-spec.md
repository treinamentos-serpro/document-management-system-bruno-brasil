# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem documentos armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos associados ao usuário da requisição.
- Download de um documento pelo identificador.
- Metadados mantidos em memória durante a execução do servidor.
- Interface web para upload, listagem e download.

### Fora do escopo

- Armazenamento em nuvem ou provedor externo.
- Versionamento, edição ou exclusão de documentos.
- Cadastro e autenticação de usuários.
- Persistência durável dos metadados.
- Compartilhamento de documentos entre usuários.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema gera um identificador único e armazena o arquivo em `backend/storage`, usando Multer com `diskStorage`. |
| RF-03 | O sistema registra os metadados em memória e retorna os dados públicos após o upload. |
| RF-04 | O usuário pode listar seus documentos, ordenados do mais recente para o mais antigo. |
| RF-05 | O usuário pode baixar um documento próprio pelo identificador. |
| RF-06 | A interface apresenta estados de carregamento, sucesso, lista vazia e erro. |
| RF-07 | A interface permite selecionar e enviar um arquivo e iniciar o download de um documento listado. |
| RF-08 | O sistema rejeita upload sem arquivo e arquivo acima do limite configurado. |
| RF-09 | Documento inexistente ou pertencente a outro usuário não deve ser disponibilizado. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Arquivos são gravados exclusivamente no filesystem local, com Multer `diskStorage`. |
| RNF-02 | Metadados permanecem em memória e podem ser perdidos ao reiniciar o processo. |
| RNF-03 | Configurações são obtidas por variáveis de ambiente e possuem valores padrão documentados. |
| RNF-04 | O nome físico é gerado pela aplicação; o nome original não controla caminhos no disco. |
| RNF-05 | Erros são tratados nos limites HTTP sem expor stack traces ou caminhos locais. |
| RNF-06 | O backend segue `routes -> controllers -> services -> repositories`; camadas internas não conhecem camadas externas. |
| RNF-07 | Testes do backend usam o runner nativo `node:test`. |

## 5. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único do documento. |
| `originalName` | string | Nome original informado para o arquivo. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora de upload em ISO 8601. |
| `owner` | string | Identificador do usuário associado à requisição. |

### Dado interno do repositório

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `storageKey` | string | Nome/chave gerada pela aplicação para localizar o arquivo. Nunca retornada pela API. |

Os metadados são indexados por `id`. O `storageKey` não pode derivar de entrada não confiável do cliente. A identificação de usuário será recebida no cabeçalho `X-User-Id`; ela fornece separação lógica, mas não constitui autenticação.

## 6. Contratos de API

O backend expõe as rotas sem prefixo `/api`. O frontend chama `/api/...`; o proxy do Vite remove esse prefixo antes de encaminhar a solicitação ao backend.

Formato de erro:

```json
{"error":{"code":"ERROR_CODE","message":"Descrição em português."}}
```

| Método e rota backend | Entrada | Sucesso | Erros principais |
| --- | --- | --- | --- |
| `POST /upload` | `multipart/form-data`, campo `file`; cabeçalho `X-User-Id` | `201`, metadados públicos do documento | `400` sem arquivo/usuário; `413` acima do limite; `500` falha de armazenamento |
| `GET /documents` | Cabeçalho `X-User-Id` | `200`, `{ "documents": [...] }`; lista vazia se não houver registros | `400` sem usuário; `500` falha interna |
| `GET /documents/:id/download` | Cabeçalho `X-User-Id` e ID na rota | `200`, conteúdo binário como anexo | `400` ID inválido; `404` inexistente ou de outro usuário; `500` falha de leitura |
| `GET /health` | Nenhuma | `200`, `{ "status": "ok" }` | Indisponibilidade do servidor |

### Regras dos contratos

- As rotas `/upload`, `/documents` e `/documents/:id/download` são chamadas pelo frontend em `/api/upload`, `/api/documents` e `/api/documents/:id/download`, respectivamente.
- Listagem inclui apenas documentos cujo `owner` corresponde ao `X-User-Id` e usa ordenação decrescente por `uploadedAt`.
- Download responde como anexo (`Content-Disposition`) usando o nome original apenas como nome de apresentação, nunca como caminho físico.
- O tamanho máximo padrão é `10 MiB`, configurável por `MAX_FILE_SIZE_BYTES`. Não há allowlist de extensões nesta fase.
- Ausência ou valor vazio de `X-User-Id` resulta em `400`.
- Erros do Multer são convertidos para o formato padrão. Se o registro de metadados falhar após a gravação, o serviço tenta remover o arquivo criado.

## 7. Decisões arquiteturais e configuração

- Backend em Node.js, Express e CommonJS. Dependências existentes: Express e Multer.
- `routes/` declara caminhos e delega aos controllers; `controllers/` valida entrada HTTP e formata respostas; `services/` concentra regras de negócio; `repositories/` acessa arquivos locais e metadados em memória.
- Uploads usam Multer com `diskStorage` em `backend/storage`. `STORAGE_DIR` pode configurar o diretório local.
- `PORT` configura a porta do servidor, com padrão `3000`; `MAX_FILE_SIZE_BYTES` configura o limite, com padrão `10485760`.
- Metadados não são persistidos em banco. Após reinicialização, arquivos podem permanecer sem metadados; reconciliação e limpeza automática ficam fora do escopo.
- Frontend em React com organização por `components/`, `pages/` e `services/`, usando `fetch` e o proxy `/api` já configurado no Vite.
- Autenticação real, banco de dados e armazenamento remoto ficam fora do escopo inicial.

## 8. Plano de execução

A execução desta solicitação limita-se à criação deste documento. As etapas abaixo são trabalho futuro; não implicam implementação de arquivos de backend ou frontend nesta etapa.

1. **Preparar persistência local e testes do repositório.** Definir acesso ao diretório via `STORAGE_DIR`, gravação com `diskStorage` e estrutura de metadados em memória em `backend/src/repositories/`; cobrir operações do repositório em `backend/test/`. Critério: salvar, consultar por ID, listar por dono e recuperar o caminho interno sem expor `storageKey`.
2. **Implementar regras de negócio.** Criar serviços em `backend/src/services/` para validar usuário/arquivo, criar metadados, listar documentos próprios e localizar downloads. Critério: erros de domínio cobrem ausência, limite excedido, ID inexistente e dono divergente; falha ao registrar metadados tenta remover o arquivo recém-gravado.
3. **Implementar a interface HTTP.** Criar controllers em `backend/src/controllers/` e rotas em `backend/src/routes/`; integrar no `backend/src/app.js` sem remover `/health`. Configurar Multer para `diskStorage` e limite de tamanho. Critério: contratos, status HTTP e formato padrão de erro são respeitados.
4. **Verificar a API.** Expandir `backend/test/` usando `node:test` e testar upload, listagem isolada por usuário, download, erros e preservação de `/health`. Critério: `npm test` passa no backend sem depender de serviços externos.
5. **Construir a experiência frontend.** Implementar serviço `fetch` e componentes/página em `frontend/src/services/`, `frontend/src/components/` e `frontend/src/pages/`; conectar ao `App.jsx`. Critério: upload, estados de carregamento/erro/lista vazia, listagem e download funcionam pelo prefixo `/api` do proxy existente.
6. **Validar integração e configuração.** Verificar frontend e backend em conjunto, documentar as variáveis `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE_BYTES` e confirmar o fluxo upload-listagem-download. Critério: frontend compila, testes backend passam e arquivos ficam somente no armazenamento local configurado.
