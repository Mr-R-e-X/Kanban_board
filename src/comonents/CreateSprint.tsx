import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { createBoardValidation } from "@/app/validation/zod.validation";
import { MiscActionEnum, PRIORITY_ENUM, useMisc } from "@/context/MiscContext";
import { SprintActionEnum, useSprint } from "@/context/SprintContext";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { LoaderIcon } from "react-hot-toast";
import { z } from "zod";

const CreateSprintModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: sprintState, dispatch: sprintDispatch } = useSprint();

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      miscDispatch({
        type: MiscActionEnum.SET_CREATE_SPRINT_MODAL,
        payload: false,
      });
    }
  };

  const handleEscapeButton = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      miscDispatch({
        type: MiscActionEnum.SET_CREATE_SPRINT_MODAL,
        payload: false,
      });
    }
  };

  useEffect(() => {
    if (miscState.createSprintModal) {
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
  }, [miscState.createSprintModal]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: formReset,
  } = useForm<z.infer<typeof createBoardValidation>>({
    resolver: zodResolver(createBoardValidation),
    defaultValues: {
      title: "",
      description: "",
      overall_priority: PRIORITY_ENUM.LOW,
    },
  });

  const onSubmit = async (data: z.infer<typeof createBoardValidation>) => {
    try {
      miscDispatch({ type: MiscActionEnum.SET_LOADING, payload: true });
      const { data: response } = await axios.post<ApiResponse>(
        "/api/sprint/create",
        {
          title: data.title,
          description: data.description,
          overall_priority: data.overall_priority,
        },
        { withCredentials: true }
      );

      if (response?.success) {
        showToast(response.data.message, "success");
        formReset();
        miscDispatch({
          type: MiscActionEnum.SET_CREATE_SPRINT_MODAL,
          payload: false,
        });
        sprintDispatch({ type: SprintActionEnum.SET_REFETCH, payload: true });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Something went wrong";
      showToast(errorMessage, "error");
    } finally {
      miscDispatch({ type: MiscActionEnum.SET_LOADING, payload: false });
    }
  };

  return (
    <dialog
      id="my_modal_2"
      className="modal"
      open={miscState.createSprintModal}
    >
      <div className="modal-box" ref={modalRef}>
        <h3 className="font-bold text-lg text-center">Create Sprint</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-2 my-4">
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">
              Pick overall Sprint Priority
            </legend>
            <select
              defaultValue={PRIORITY_ENUM.LOW}
              className="select w-full"
              {...register("overall_priority")}
            >
              <option value={PRIORITY_ENUM.URGENT}>🔥 Urgent</option>
              <option value={PRIORITY_ENUM.HIGH}>⚡ High</option>
              <option value={PRIORITY_ENUM.MEDIUM}>✅ Medium</option>
              <option value={PRIORITY_ENUM.LOW}>⏳ Low</option>
            </select>
            {errors.overall_priority && (
              <span className="text-error text-sm">
                {errors.overall_priority.message}
              </span>
            )}
          </fieldset>

          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Title</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              {...register("title")}
            />
            {errors.title && (
              <span className="text-error text-sm">{errors.title.message}</span>
            )}
          </fieldset>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Description</legend>
            <textarea
              className="textarea w-full h-24"
              placeholder="Type here"
              {...register("description")}
            ></textarea>
            {errors.description && (
              <span className="text-error text-sm">
                {errors.description.message}
              </span>
            )}
          </fieldset>

          <button
            type="submit"
            className={`btn btn-primary mt-4 w-full btn-lg text-lg my-2 ${
              miscState.loading ? "cursor-wait opacity-50 disabled:" : ""
            }`}
          >
            {!miscState.loading ? (
              "Create Sprint"
            ) : (
              <>
                <LoaderIcon className="animate-spin mr-2" /> Creating Sprint
              </>
            )}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default CreateSprintModal;
