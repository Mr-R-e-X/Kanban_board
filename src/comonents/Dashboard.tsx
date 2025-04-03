import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { useAuth } from "@/context/AuthContext";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { Sprint, SprintActionEnum, useSprint } from "@/context/SprintContext";
import axios, { AxiosError } from "axios";
import { Plus } from "lucide-react";
import React, { useEffect } from "react";
import SprintCard from "./SprintCard";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";

interface DraggableSprintCardProps {
  sprint: Sprint;
  isOverlay?: boolean;
}

const DraggableSprintCard: React.FC<DraggableSprintCardProps> = ({
  sprint,
  isOverlay,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sprint.index });
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="cursor-grab p-4 rounded-md max-h-max"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isOverlay ? 1 : 1,
        touchAction: "none",
      }}
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onMouseDown={() => setIsDragging(false)}
      onMouseMove={() => setIsDragging(true)}
    >
      <SprintCard sprint={sprint} listeners={listeners} />
    </div>
  );
};

const Dashboard = () => {
  const { state: authState } = useAuth();
  const { dispatch: miscDispatch } = useMisc();
  const { state: sprintState, dispatch: sprintDispatch } = useSprint();
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleFetchSprints = async () => {
    try {
      sprintDispatch({ type: SprintActionEnum.SET_LOADING, payload: true });
      const { data: response } = await axios.get("/api/sprint/get-all", {
        withCredentials: true,
      });

      if (response?.success) {
        sprintDispatch({
          type: SprintActionEnum.SET_SPRINTS,
          payload: response?.data?.sprints,
        });
        showToast(response.data.message, "success");
        sprintDispatch({ type: SprintActionEnum.SET_REFETCH, payload: false });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Something went wrong";
      showToast(errorMessage, "error");
    } finally {
      sprintDispatch({ type: SprintActionEnum.SET_LOADING, payload: false });
    }
  };

  useEffect(() => {
    handleFetchSprints();
  }, [sprintState.refetch]);

  if (sprintState.isLoading) {
    return (
      <div className="flex items-center h-screen justify-center">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  const handleDragStart = (event: any) => {
    const sprint = sprintState.sprints.find(
      (s: Sprint) => s.index === event.active.id
    );
    setActiveSprint(sprint || null);
  };

  const handleDragEnd = async (event: any) => {
    setActiveSprint(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sprintState.sprints.findIndex(
      (s: Sprint) => s.index === active.id
    );
    const newIndex = sprintState.sprints.findIndex(
      (s: Sprint) => s.index === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(sprintState.sprints, oldIndex, newIndex);
    sprintDispatch({ type: SprintActionEnum.SET_SPRINTS, payload: newOrder });
    try {
      await axios.patch(
        "/api/sprint/update-index",
        {
          orderedSprints: newOrder.map((s) => s._id),
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen w-full overflow-y-hidden">
      <div className="pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">
          {authState.user?.name.split(" ")[0]}'s Dashboard
        </h1>
        <div
          className="tooltip tooltip-left tooltip-primary"
          data-tip="Create a new sprint"
        >
          <button
            className="btn btn-primary btn-circle"
            onClick={() =>
              miscDispatch({
                type: MiscActionEnum.SET_CREATE_SPRINT_MODAL,
                payload: true,
              })
            }
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="divider divider-primary mt-0">
        <h1 className="text-xl font-semibold text-center text-primary">
          All Sprint List
        </h1>
      </div>
      <div className="w-full h-full">
        <div className="max-h-[95%] w-full overflow-y-scroll pb-10 ">
          {sprintState.sprints.length === 0 ? (
            <div className="text-center text-xl font-semibold text-primary min-h-full">
              No Sprints Found
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <SortableContext
                items={sprintState.sprints.map((s: Sprint) => s._id)}
                strategy={rectSortingStrategy}
              >
                <div className="flex flex-wrap gap-2 justify-evenly p-4 rounded-md shadow-md h-full">
                  {sprintState.sprints.map((sprint: Sprint) => (
                    <DraggableSprintCard key={sprint._id} sprint={sprint} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeSprint && (
                  <DraggableSprintCard sprint={activeSprint} isOverlay />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
