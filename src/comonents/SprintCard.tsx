import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { Sprint } from "@/context/SprintContext";
import { Edit, EditIcon, GripVertical, Trash, X } from "lucide-react";

const SprintCard = ({
  sprint,
  listeners,
}: {
  sprint: Sprint;
  listeners: any;
}) => {
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const getProgressClass = (progress: number) => {
    if (progress <= 25) return "progress-error";
    if (progress <= 50) return "progress-warning";
    if (progress <= 75) return "progress-secondary";
    return "progress-success";
  };
  return (
    <div className="card w-96 rounded-2xl bg-base-200 shadow-sm border overflow-hidden hover:scale-105 duration-150 ease-in-out transition-all ">
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          className="btn btn-xs btn-circle btn-outline btn-error"
          onClick={() => {
            miscDispatch({
              type: MiscActionEnum.SET_DELETE_TASK_MODAL,
              payload: true,
            });
            miscDispatch({
              type: MiscActionEnum.SET_DELETE_TASK_DETAILS,
              payload: {
                id: sprint._id,
                title: sprint.title,
              },
            });
          }}
        >
          <X />
        </button>
        <button
          className="btn btn-xs btn-circle"
          onClick={() => {
            miscDispatch({
              type: MiscActionEnum.SET_EDIT_SPRINT_MODAL,
              payload: true,
            });
            miscDispatch({
              type: MiscActionEnum.SET_CURRENT_MODAL_SPRINT_DETAILS,
              payload: {
                id: sprint._id,
                title: sprint.title,
                description: sprint.description,
                overall_priority: sprint.overall_priority,
              },
            });
          }}
        >
          <Edit />
        </button>
      </div>
      <div className="card-body">
        <span
          className={`badge badge-xs ${
            sprint.overall_priority === "low"
              ? "badge-success"
              : sprint.overall_priority === "medium"
              ? "badge-info"
              : sprint.overall_priority === "high"
              ? "badge-warning"
              : sprint.overall_priority === "urgent"
              ? "badge-error"
              : "badge-neutral"
          }`}
        >
          {sprint.overall_priority?.toUpperCase()}
        </span>

        <div className="flex justify-between">
          <h2
            className="text-xl font-semibold flex items-center"
            {...listeners}
          >
            <GripVertical className="mr-2 h-6 w-6" />
            {sprint.title}
          </h2>
        </div>
        <div className="mt-2 text-xs px-2">
          <span>Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
        </div>
        <div
          className="mt-6"
          onClick={() => {
            miscDispatch({
              type: MiscActionEnum.SET_ACTIVE_CONTENT,
              payload: 4,
            });
            miscDispatch({
              type: MiscActionEnum.SET_CURRENT_MODAL_SPRINT_DETAILS,
              payload: {
                id: sprint._id,
                title: sprint.title,
                description: sprint.description,
                overall_priority: sprint.overall_priority,
              },
            });
          }}
        >
          <button className="btn btn-primary btn-block">Details</button>
        </div>
      </div>
      <progress
        className={`progress ${getProgressClass(
          sprint.progress
        )} w-full absolute bottom-0 left-0`}
        value={sprint.progress}
        max="100"
      ></progress>
    </div>
  );
};

export default SprintCard;
