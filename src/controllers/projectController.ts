import type { Request, Response } from "express";
import Project from "../models/Project";

// Creamos el controlador que usaremos en router
export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    //res.send("Creando proyecto");
    //console.log(req.body);
    const project = new Project(req.body);
    // Asignar manager
    project.manager = req.user.id;
    try {
      // Guardamos en la base de datos
      await project.save();
      res.send("Proyecto creado correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // or nos permite tener condiciones
      const projects = await Project.find({
        $or: [
          {
            manager: { $in: req.user.id },
          },
          {
            team: { $in: req.user.id },
          },
        ],
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    // Recuperamos el id de la url
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // Si el proyecto no pertenece al manager o miembro del equipo
      if (
        project.manager.toString() !== req.user.id.toString() &&
        !project.team.includes(req.user.id)
      ) {
        const error = new Error("Acción no válida");
        res.status(404).json({ error: error.message });
        return;
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.clientName = req.body.clientName;
      req.project.projectName = req.body.projectName;
      req.project.description = req.body.description;
      await req.project.updateOne(req.body);
      res.send("Proyecto actualizado correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send("Proyecto eliminado correctamente");
    } catch (error) {
      console.log(error);
    }
  };
}
