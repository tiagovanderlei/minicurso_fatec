import express from "express";
import { router } from "./routes.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(express.json());
app.use(router);

app.listen(3000, () => {
    console.info(`servidor executando na porta 3000`);
});
