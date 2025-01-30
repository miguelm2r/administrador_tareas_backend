import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

// Añadir al scope global para tener task en req
// Las interfaces se combinan entre si y no se reescriben
declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

// Validar si existe
export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error("Tarea no encontrada");
      res.status(404).json({ error: error.message });
      return;
    }
    // Pasamos el task con el req
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}

// Validar si pertenece al proyecto
export async function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error("Accion no válida");
    res.status(400).json({ error: error.message });
    return;
  }
  next();
}

// Validar si es el manager
export async function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error("Accion no válida");
    res.status(400).json({ error: error.message });
    return;
  }
  next();
}
