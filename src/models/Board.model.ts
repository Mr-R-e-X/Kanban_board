import { Model } from "mongoose";
import { Document, Schema, Types, UpdateQuery, model, models } from "mongoose";

export interface IBoard extends Document {
  title: string;
  user_id: Types.ObjectId;
  index: number;
  description: string;
  overall_priority?: string;
  progress: number;
  task_list: Array<Types.ObjectId>;
  completed_task_list: Array<Types.ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    title: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    description: { type: String, required: true },
    overall_priority: { type: String, required: true, default: "LOW" },
    progress: { type: Number, required: true, default: 0 },
    task_list: [{ type: Schema.Types.ObjectId, ref: "Task", default: [] }],
    completed_task_list: [
      { type: Schema.Types.ObjectId, ref: "Task", default: [] },
    ],
    index: { type: Number, required: true, default: 0 }, // FLOAT-based index
  },
  { timestamps: true }
);

boardSchema.index({ index: 1 });

boardSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastBoard = await (this.constructor as Model<IBoard>)
      .findOne()
      .sort({ index: -1 });
    this.index = lastBoard ? lastBoard.index + 1 : 1;
  }
  next();
});

boardSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as UpdateQuery<IBoard>;
  if (!update) return next();

  const board = await this.model.findOne(this.getQuery());
  if (!board) return next();

  const updatedTaskList = update.$set?.task_list ?? board.task_list;
  const updatedCompletedTaskList =
    update.$set?.completed_task_list ?? board.completed_task_list;

  const totalTasks = Array.isArray(updatedTaskList)
    ? updatedTaskList.length
    : 0;
  const completedTasks = Array.isArray(updatedCompletedTaskList)
    ? updatedCompletedTaskList.length
    : 0;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  this.setUpdate({
    ...update,
    $set: { ...update.$set, progress },
  });

  next();
});

export const Board = models?.Board || model<IBoard>("Board", boardSchema);
