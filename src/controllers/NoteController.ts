import type { Request, Response } from "express";
import Note, { INote } from "../models/Model";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  // Para asignar un type al req. Le decimos via generic que en el tercer objeto es el interface de note
  // Primer objeto para params, segundo objeto para response y tercero para request
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    //console.log(req.body);
    const { content } = req.body;
    const note = new Note();
    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    req.task.notes.push(note.id);
    try {
      await Promise.allSettled([req.task.save(), note.save()]);
      res.send("Nota creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    //console.log("Get task notes");
    try {
      const notes = await Note.find({ task: req.task.id });
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      const error = new Error("Nota no encontrada");
      res.status(404).json({ error: error.message });
      return;
    }

    if (note.createdBy.toString() !== req.user.id.toString()) {
      const error = new Error("Acción no válida");
      res.status(401).json({ error: error.message });
      return;
    }

    req.task.notes = req.task.notes.filter(
      (note) => note.toString() !== noteId.toString()
    );

    try {
      await Promise.allSettled([note.deleteOne(), req.task.save()]);
      res.send("Nota eliminada");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
