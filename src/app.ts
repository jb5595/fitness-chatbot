import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index"
import cors from "cors"


dotenv.config();

const ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'https://fitness-chatbot-ui.vercel.app',
  /vercel\.app$/,
];

const corsOptions = {
  origin: ALLOWED_ORIGINS,
  optionSuccessStatus: 200,
};

const app = express();

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

export default app;