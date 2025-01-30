import type { Request, Response } from "express";

import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      // Le decimos a que proyecto pertenece que nos vendra en el req
      task.project = req.project.id;
      // Agregamos al proyecto la tarea
      req.project.tasks.push(task.id);
      //await task.save();
      //await req.project.save();
      // Usamos un promise para mejorar el rendimiento
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("Tarea creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      // Obtenemos las tareas que pertenecen al proyecto.
      // Con populate nos traemos tambien la informacion del proyecto
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email",
        })
        .populate({
          path: "notes",
          populate: { path: "createdBy", select: "id name email" },
        });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      await req.task.updateOne(req.body);
      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      // eliminar del arreglo de tareas de proyecto
      req.project.tasks = req.project.tasks.filter(
        (task) => task._id.toString() !== req.task.id.toString()
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send("Tarea eliminada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      // cambiamos el status
      const { status } = req.body;
      req.task.status = status;
      //console.log(req.task);
      // Creamos un objeto con los datos del usuario que lo cambio
      const data = {
        user: req.user.id,
        status,
      };
      req.task.completedBy.push(data);
      await req.task.save();
      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
