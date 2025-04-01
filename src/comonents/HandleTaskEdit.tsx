import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import {
  createTaskValidation,
  updateTaskValidation,
} from "@/app/validation/zod.validation";
import { MiscActionEnum, PRIORITY_ENUM, useMisc } from "@/context/MiscContext";
import {
  SprintActionEnum,
  StatusType,
  useSprint,
} from "@/context/SprintContext";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { LoaderIcon } from "react-hot-toast";
import { z } from "zod";

const HandleTaskEdit = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: sprintState, dispatch: sprintDispatch } = useSprint();

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      sprintDispatch({ type: SprintActionEnum.SET_TASK_EDIT, payload: false });
      sprintDispatch({
        type: SprintActionEnum.SET_TASK_EDIT_DETAILS,
        payload: null,
      });
    }
  };

  const handleEscapeButton = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      sprintDispatch({ type: SprintActionEnum.SET_TASK_EDIT, payload: false });
      sprintDispatch({
        type: SprintActionEnum.SET_TASK_EDIT_DETAILS,
        payload: null,
      });
    }
  };

  useEffect(() => {
    if (sprintState.taskEdit) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeButton);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeButton);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeButton);
    };
  }, [sprintState.taskEdit]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: formReset,
    setValue,
  } = useForm<z.infer<typeof updateTaskValidation>>({
    resolver: zodResolver(updateTaskValidation),
    defaultValues: {
      title: sprintState.taskEditDetails?.task?.title || "",
      task_id: sprintState.taskEditDetails?.task?._id,
      description: sprintState.taskEditDetails?.task?.description || "",
      priority:
        sprintState.taskEditDetails?.task?.priority || PRIORITY_ENUM.LOW,
      status: sprintState.taskEditDetails?.task?.status || StatusType.TODO,
      start_date: sprintState.taskEditDetails?.task?.start_date || null,
      due_date: sprintState.taskEditDetails?.task?.due_date || null,
      board_id: sprintState.taskEditDetails?.task?.board_id,
      board_name: "",
    },
  });

  useEffect(() => {
    if (sprintState.taskEditDetails) {
      formReset({
        title: sprintState.taskEditDetails.task?.title || "",
        task_id: sprintState.taskEditDetails.task?._id,
        description: sprintState.taskEditDetails.task?.description || "",
        priority:
          sprintState.taskEditDetails.task?.priority || PRIORITY_ENUM.LOW,
        status: sprintState.taskEditDetails.task?.status || StatusType.TODO,
        start_date: sprintState.taskEditDetails.task?.start_date
          ? new Date(sprintState.taskEditDetails.task.start_date)
              .toISOString()
              .split("T")[0]
          : "",
        due_date: sprintState.taskEditDetails.task?.due_date
          ? new Date(sprintState.taskEditDetails.task.due_date)
              .toISOString()
              .split("T")[0]
          : "",
        board_id: sprintState.taskEditDetails.task?.board_id || "",
        board_name: "",
      });
    }
  }, [sprintState.taskEditDetails, formReset]);

  const onSubmit = async (data: z.infer<typeof updateTaskValidation>) => {
    try {
      sprintDispatch({ type: SprintActionEnum.SET_LOADING, payload: true });

      const { data: response } = await axios.put<ApiResponse>(
        "/api/todo/update",
        { ...data },
        { withCredentials: true }
      );

      if (response?.success) {
        showToast(response.data.message, "success");

        formReset({
          title: "",
          description: "",
          priority: PRIORITY_ENUM.LOW,
          status: StatusType.TODO,
          start_date: null,
          due_date: null,
          board_id: sprintState.taskEditDetails?.board_id,
          board_name: "",
        });

        sprintDispatch({
          type: SprintActionEnum.SET_TASK_EDIT,
          payload: false,
        });
        sprintDispatch({
          type: SprintActionEnum.SET_TASK_EDIT_DETAILS,
          payload: null,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.error || "Something went wrong";
      showToast(errorMessage, "error");
    } finally {
      sprintDispatch({ type: SprintActionEnum.SET_LOADING, payload: false });
      sprintDispatch({
        type: SprintActionEnum.SET_TASK_EDIT,
        payload: false,
      });
      sprintDispatch({
        type: SprintActionEnum.SET_TASK_EDIT_DETAILS,
        payload: null,
      });
      sprintDispatch({
        type: SprintActionEnum.SET_REFETCH_DETAIL,
        payload: true,
      });
    }
  };

  return (
    <dialog className="modal" open={sprintState.taskEdit}>
      <div className="modal-box" ref={modalRef}>
        <h3 className="font-bold text-lg text-center">Edit Task</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-2 my-4">
          <input
            type="text"
            className="input w-full hidden"
            value={miscState.currentModalSprintDetails.id}
            {...register("board_id")}
          />

          <input
            type="text"
            className="input w-full hidden"
            value={miscState.currentModalSprintDetails.title}
            {...register("board_name")}
          />

          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Pick Task Priority</legend>
            <select
              className="select w-full"
              {...register("priority", { required: "Priority is required" })}
            >
              <option value={PRIORITY_ENUM.URGENT}>🔥 Urgent</option>
              <option value={PRIORITY_ENUM.HIGH}>⚡ High</option>
              <option value={PRIORITY_ENUM.MEDIUM}>✅ Medium</option>
              <option value={PRIORITY_ENUM.LOW}>⏳ Low</option>
            </select>
            {errors.priority && (
              <span className="text-error text-sm">
                {errors.priority.message}
              </span>
            )}
          </fieldset>

          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">
              Pick Task Current Status
            </legend>
            <select
              className="select w-full"
              {...register("status", { required: "Status is required" })}
            >
              <option value={StatusType.TODO}>📝 {StatusType.TODO}</option>
              <option value={StatusType.IN_PROGRESS}>
                ⏳ {StatusType.IN_PROGRESS}
              </option>
              <option value={StatusType.SAVED_FOR_LETTER}>
                📌 {StatusType.SAVED_FOR_LETTER}
              </option>
              <option value={StatusType.DONE}>✅ {StatusType.DONE}</option>
            </select>
            {errors.priority && (
              <span className="text-error text-sm">
                {errors.priority.message}
              </span>
            )}
          </fieldset>

          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Title</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Task title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <span className="text-error text-sm">{errors.title.message}</span>
            )}
          </fieldset>

          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Description</legend>
            <textarea
              className="textarea w-full h-24"
              placeholder="Task description"
              {...register("description", {
                required: "Description is required",
              })}
            ></textarea>
            {errors.description && (
              <span className="text-error text-sm">
                {errors.description.message}
              </span>
            )}
          </fieldset>

          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Dates</legend>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="input w-full"
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <span className="text-error text-sm">
                    {errors.start_date.message}
                  </span>
                )}
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  className="input w-full"
                  {...register("due_date")}
                />
                {errors.due_date && (
                  <span className="text-error text-sm">
                    {errors.due_date.message}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            className={`btn btn-primary mt-4 w-full btn-lg text-lg my-2 ${
              sprintState.isLoading ? "cursor-wait opacity-50 disabled:" : ""
            }`}
          >
            {!sprintState.isLoading ? (
              "Edit Task"
            ) : (
              <>
                <LoaderIcon className="animate-spin mr-2" /> Editing Task
              </>
            )}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default HandleTaskEdit;
