import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

// Añadir al scope global para tener project en req
// Las interfaces se combinan entre si y no se reescriben
declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

// Validar si el proyecto existe
export async function projectExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Proyecto no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }
    // Pasamos el proyecto con el req
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}
