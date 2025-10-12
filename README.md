# Minicurso FATEC - Análise de PDF com IA

API para análise de documentos PDF usando LangChain e Google Generative AI.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure a chave da API:
```bash
cp .env.example .env
```
Edite `.env` e adicione: `GOOGLE_API_KEY=sua_chave_aqui`

3. Execute o servidor:
```bash
npm run dev
```

## Endpoints

### POST /chat
Teste simples que retorna uma piada sobre gatos.

### POST /summarize
Analisa PDF e extrai dados estruturados.
- **Content-Type**: `multipart/form-data`
- **Campo**: `file` (arquivo PDF)
- **Resposta**: JSON com projeto, materiais e custo estimado

## Teste no Postman

1. **Chat**: POST `http://localhost:3000/chat`
2. **PDF**: POST `http://localhost:3000/summarize`
   - Body → form-data
   - Key: `file` (tipo File)
   - Selecione: `test/Documento_Especificacao_Projeto_V05.pdf`

## Tecnologias

- Express.js + LangChain
- Google Generative AI (Gemini)
- Multer + pdf-parse