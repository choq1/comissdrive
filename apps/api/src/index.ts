import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const PORT = process.env.PORT ?? 3333;
const app = createApp();

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
