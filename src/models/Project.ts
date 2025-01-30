import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Model";

// Creamos el type de typescript con interface
// Con document heredamos de Document y añadimos aparte las demas caracteristicas
// Con tasks hacemos referencia inversa al modelo task y le decimos que sera un arreglo de tareas
// PopulatedDoc nos ayuda para hacer la referencia
export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[];
  manager: PopulatedDoc<IUser & Document>;
  team: PopulatedDoc<IUser & Document>[];
}

// Creamos el schema de mongoose
// Con trim, quitamos los espacios que se añadan al inicio o final
// Con unique nos aseguramos que sea unico
// Con timestamps nos dice cuando se actualiza automaticamente
const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tasks: [
      {
        type: Types.ObjectId,
        ref: "Task",
      },
    ],
    manager: {
      type: Types.ObjectId,
      ref: "User",
    },
    team: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Middleware
// Lo usamos para borrar las tareas cuando eliminemos un proyecto y las notas de cada tarea
ProjectSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const projectId = this._id;
    if (!projectId) return;

    const tasks = await Task.find({ project: projectId });
    for (const task of tasks) {
      await Note.deleteMany({ task: task._id });
    }
    await Task.deleteMany({ project: projectId });
  }
);

// Definimos el modelo
const Project = mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
