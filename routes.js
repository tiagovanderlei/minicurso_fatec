import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import express from "express";
import { pdf } from "pdf-parse";
import fs from "fs";
import multer from "multer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const router = express.Router();

router.post("/chat", async (req, resp) => {
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0
    });

    const response = await model.invoke(
        "conte uma piada sobre gatos"
    );

    console.log(response);

    resp.status(200).send();
});

const upload = multer({ dest: 'uploads/' }); 

router.post("/summarize", upload.single("file"), async (req, resp) => {

    const buffer = fs.readFileSync(req.file.path);

    const data = await pdf(buffer);

    console.log(data.text);

    const documentText = data.text;

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([documentText]);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
       docs, embeddings, 
    );

    const retriever = vectorStore.asRetriever({
        k: 5,
    });

    const relevantDocs = await retriever.invoke(
        "Extraia um JSON com projeto, materiais, custo estimado e riscos",
    );

    const context = relevantDocs.map(d => d.pageContent).join("\n\n");

    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        {
            role: "system", 
            content: `Você é um assistente que extrai dados estruturados 
            de especificações de construção. Retorne sempre um JSON válido.`
        },
        { 
            role: "human", content: `Aqui está o contexto mais relevante extraído 
            do PDF:\n\n{context}. Extraia um JSON com: 'projeto, 
            materiais, custo estimado'` 
        },
    ]);

    const chain = prompt.pipe(model);

    const response = await chain.invoke({
        context,
    });

    let json = response.content.trim();
    json = json.replace(/```json|```/g, "");

    console.log(json)

    resp.status(200).json(JSON.parse(json));
});
