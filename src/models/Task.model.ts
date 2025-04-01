import { Document, Schema, Types, model, models } from "mongoose";

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum Status {
  TODO = "TO DO",
  IN_PROGRESS = "IN PROGRESS",
  DONE = "DONE",
  SAVED_FOR_LETTER = "SAVED FOR LATER",
}

export interface ITask extends Document {
  title: string;
  description: string;
  priority: Priority;
  index: number;
  user_id: Types.ObjectId;
  status: Status;
  due_date: Date | null;
  start_date: Date | null;
  generic_task_id: string;
  board_id: Types.ObjectId;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    priority: { type: String, required: true, default: Priority.LOW },
    start_date: { type: Date, required: false, default: null },
    due_date: { type: Date, required: false, default: null },
    status: { type: String, required: true, default: Status.TODO },
    board_id: { type: Schema.Types.ObjectId, required: true, ref: "Board" },
    isCompleted: { type: Boolean, required: true, default: false },
    generic_task_id: { type: String, unique: true },
    index: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ index: 1 });
taskSchema.index({ board_id: 1, _id: 1 });

taskSchema.pre("save", async function (next) {
  if (!this.generic_task_id) {
    const taskCount = await models.Task.countDocuments({
      user_id: this.user_id,
    });

    this.generic_task_id = `KAN-${taskCount + 1}`;
  }
  next();
});

export const Task = models?.Task || model<ITask>("Task", taskSchema);
