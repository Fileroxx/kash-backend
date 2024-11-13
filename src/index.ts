import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './database';
import authRoutes  from './routes/authRoutes';
import userRoutes from './routes/userRoutes'

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://127.0.0.1:5173',
  'https://smartfinsoluction-backend.vercel.app',
  'https://smartfin-soluction.vercel.app',
  'https://smartfin-soluction-git-feature-home-fileroxx.vercel.app/',
  'https://smartfin-soluction-git-feature-home-fileroxx.vercel.app/login'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
