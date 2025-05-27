import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index"
import cors from "cors"
import multer from "multer"

import './security/passport';

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
const upload = multer(); // For form-data
app.use(upload.none());

app.use('/', routes);

export default app;