import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import morgan from "morgan";

// Usamos las variables de entorno
dotenv.config();
// Nos conectamos a la base de datos
connectDB();
// creamos nuestra app de express
const app = express();
// Habilitamos cors
app.use(cors(corsConfig));

// Loggin para visualizar las consultas con morgan
app.use(morgan("dev"));
// Habilitamos la lectura de json para leer datos del formulario
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

export default app;
