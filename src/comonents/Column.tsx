"use client";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ColumnProps {
  columnType: string;
  tasks: Array<any>;
  color: string;
  colTitle: string;
}

import {
  SprintActionEnum,
  StatusType,
  useSprint,
} from "@/context/SprintContext";
import { useDroppable } from "@dnd-kit/core";
import { Edit, GripVertical, X } from "lucide-react";

const Column = ({ columnType, tasks, color, colTitle }: ColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: columnType,
  });

  return (
    <SortableContext
      id={columnType}
      items={tasks}
      strategy={rectSortingStrategy}
    >
      <div ref={setNodeRef} className="w-96 p-4 rounded-lg">
        <div
          className={`flex w-full items-center justify-between ${color}  p-2 rounded-full`}
        >
          <span className="font-bold ml-3">{colTitle}</span>
          <button className="btn btn-circle rounded-full text-sm font-bold">
            {tasks.length}
          </button>
        </div>

        <div className="mt-4 space-y-2 min-h-[78vh] max-h-[78vh] overflow-y-scroll">
          {tasks.length === 0 ? (
            <div className="min-h-[75vh] flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-center text-gray-400">Drop tasks here</p>
            </div>
          ) : (
            tasks.map((task) => (
              <Task
                key={task?._id}
                task={task}
                style={columnType === StatusType.DONE ? "line-through" : ""}
                board_id={task?.board_id}
              />
            ))
          )}
        </div>
      </div>
    </SortableContext>
  );
};

export const Task = ({
  task,
  style,
  board_id,
}: {
  task: any;
  style?: any;
  board_id: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: task?._id,
      data: {
        current_status: task?.status,
      },
    });
  const formatDate = (dateString: string) => {
    if (!dateString) return "NA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const { state: sprintState, dispatch: sprintDispatch } = useSprint();

  const handleDelete = async (board_id: string, task: any) => {
    try {
      sprintDispatch({ type: SprintActionEnum.SET_DELETE_TASK, payload: true });
      sprintDispatch({
        type: SprintActionEnum.SET_DELETE_TASK_DETAILS,
        payload: { task, board_id },
      });
      console.log(task);
    } catch (error) {
      console.error("Error while deleting task:", error);
    }
  };

  const handleEdit = async (board_id: string, task: any) => {
    try {
      sprintDispatch({ type: SprintActionEnum.SET_TASK_EDIT, payload: true });
      sprintDispatch({
        type: SprintActionEnum.SET_TASK_EDIT_DETAILS,
        payload: { task, board_id },
      });
    } catch (error) {
      console.error("Error while deleting task:", error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.3 : 1,
      }}
      className="card bg-base-100 shadow-xl border border-gray-200 rounded-xl transition-all hover:shadow-2xl relative"
    >
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          className="btn btn-xs btn-circle btn-outline btn-error"
          onClick={() => handleDelete(board_id, task)}
        >
          <X />
        </button>
        <button
          className="btn btn-xs btn-circle"
          onClick={() => handleEdit(board_id, task)}
        >
          <Edit />
        </button>
      </div>
      <div className="card-body flex items-start">
        <div className="ml-2 w-full">
          <span
            className={`badge badge-xs ${
              task.priority === "low"
                ? "badge-success"
                : task.priority === "medium"
                ? "badge-info"
                : task.priority === "high"
                ? "badge-warning"
                : task.priority === "urgent"
                ? "badge-error"
                : "badge-neutral"
            }`}
          >
            {task.priority?.toUpperCase()}
          </span>
          <div
            className="h-max max-w-[300px] break-words whitespace-normal"
            {...listeners}
          >
            <h3
              className={`text-lg font-bold text-primary cursor-grab ${style}`}
            >
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 break-words whitespace-normal">
              {task.description}
            </p>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <p className=" px-2 py-1 rounded-full">
              📅 Start: {formatDate(task?.start_date)}
            </p>
            <span className="px-2 py-1">
              ⏳ Due: {formatDate(task?.due_date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Column;
