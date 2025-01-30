import mongoose, { Schema, Document, Types } from "mongoose";
import Note from "./Model";

// Definimos los diferentes estados que va a poner tener la tarea
const taskStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus];

// Con Types de mongoose le decimos que va a ser del tipo
// ObjectId de mongoose
export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
  completedBy: {
    user: Types.ObjectId;
    status: TaskStatus;
  }[];
  notes: Types.ObjectId[];
}

// Con ref le decimos la referencia a tomar del modelo Project
// Hay que hacer tambien referencia inversa en Project
// Con enum le decimos que solo va a ser uno de los estados del diccionario taskStatus
export const TaskSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: Types.ObjectId,
      ref: "Project",
    },
    status: {
      type: String,
      enum: Object.values(taskStatus),
      default: taskStatus.PENDING,
    },
    completedBy: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: Object.values(taskStatus),
          default: taskStatus.PENDING,
        },
      },
    ],
    notes: [
      {
        type: Types.ObjectId,
        ref: "Note",
      },
    ],
  },
  { timestamps: true }
);

// Middleware
// Lo usamos para borrar las notas cuando eliminemos una tarea
TaskSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const taskId = this._id;
    if (!taskId) return;
    await Note.deleteMany({ task: taskId });
  }
);

// Definimos el modelo y exportamos
const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
