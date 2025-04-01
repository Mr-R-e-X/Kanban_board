import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import Column, { Task } from "./Column";
import {
  SprintActionEnum,
  StatusType,
  useSprint,
} from "@/context/SprintContext";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/app/types/apiResponse";

const DragTaskCols = () => {
  const { state: sprintState, dispatch: sprintDispatch } = useSprint();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeTask, setActiveTask] = useState<any>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = Object.values(sprintState.detailedSprint.tasks)
      .flat()
      .find((t: any) => t._id === active.id);

    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const allTasks = Object.values(sprintState.detailedSprint.tasks).flat();
    const task = allTasks.find((t: any) => t._id === activeTaskId);
    if (!task) return;

    const currColumn = task.status;
    let targetColumn = currColumn;
    let newIndex = 0;

    if (Object.values(StatusType).includes(overTaskId as StatusType)) {
      targetColumn = overTaskId as StatusType;
    } else {
      const targetTask = allTasks.find((t: any) => t._id === overTaskId);
      if (!targetTask) return;
      targetColumn = targetTask.status;
      newIndex = sprintState.detailedSprint.tasks[
        targetColumn as StatusType
      ].findIndex((t: any) => t._id === overTaskId);
    }

    if (currColumn === targetColumn && task.index === newIndex) {
      return;
    }

    const newTasksState = { ...sprintState.detailedSprint.tasks };

    newTasksState[currColumn as StatusType] = newTasksState[
      currColumn as StatusType
    ].filter((t: any) => t._id !== activeTaskId);

    const updatedTask = { ...task, status: targetColumn };
    newTasksState[targetColumn as StatusType] = [
      ...newTasksState[targetColumn as StatusType],
    ];
    newTasksState[targetColumn as StatusType].splice(newIndex, 0, updatedTask);

    newTasksState[currColumn as StatusType] = newTasksState[
      currColumn as StatusType
    ].map((t: any, i: number) => ({
      ...t,
      index: i,
    }));
    newTasksState[targetColumn as StatusType] = newTasksState[
      targetColumn as StatusType
    ].map((t: any, i: number) => ({
      ...t,
      index: i,
    }));

    sprintDispatch({
      type: SprintActionEnum.SET_SPRINT_DETAIL,
      payload: {
        ...sprintState.detailedSprint,
        tasks: newTasksState,
      },
    });

    try {
      await updateTaskOrder(sprintState.detailedSprint._id, [
        ...newTasksState[currColumn as StatusType],
        ...newTasksState[targetColumn as StatusType],
      ]);
    } catch (error: any) {
      console.log(error?.message);
    }
  };

  const updateTaskOrder = async (boardId: string, tasks: any[]) => {
    try {
      await axios.put("/api/todo/update-multiple", {
        boardId,
        tasks,
      });
    } catch (error) {
      console.error("Error while updating task order:", error);
    }
  };

  return (
    <div className="h-[90%] overflow-y-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={Object.values(sprintState.detailedSprint.tasks).flat()}
        >
          <div className="flex flex-row flex-wrap md:flex-nowrap">
            <Column
              colTitle="Saved For Later"
              columnType={StatusType.SAVED_FOR_LETTER}
              tasks={
                sprintState.detailedSprint.tasks[StatusType.SAVED_FOR_LETTER]
              }
              color="bg-blue-500"
            />
            <Column
              colTitle="To Do"
              columnType={StatusType.TODO}
              tasks={sprintState.detailedSprint.tasks[StatusType.TODO]}
              color="bg-orange-500"
            />
            <Column
              colTitle="In Progress"
              columnType={StatusType.IN_PROGRESS}
              tasks={sprintState.detailedSprint.tasks[StatusType.IN_PROGRESS]}
              color="bg-purple-600"
            />
            <Column
              colTitle="Done"
              columnType={StatusType.DONE}
              tasks={sprintState.detailedSprint.tasks[StatusType.DONE]}
              color="bg-green-500"
            />
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <Task task={activeTask} board_id={sprintState.detailedSprint._id} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DragTaskCols;
