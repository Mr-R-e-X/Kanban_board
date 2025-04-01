"use client";
import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { SprintActionEnum, useSprint } from "@/context/SprintContext";
import axios, { AxiosError } from "axios";
import { Loader2, X } from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";

const DeleteSprint = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: sprintState, dispatch: sprintDispatch } = useSprint();

  const closeModal = () => {
    miscDispatch({
      type: MiscActionEnum.SET_DELETE_TASK_MODAL,
      payload: false,
    });
    miscDispatch({
      type: MiscActionEnum.SET_DELETE_TASK_DETAILS,
      payload: null,
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  };

  const handleEscapeButton = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  useEffect(() => {
    if (miscState.deleteTaskModal) {
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
  }, [miscState.deleteTaskModal]);

  const handleDeleteTask = async (board_id: string) => {
    try {
      miscDispatch({
        type: MiscActionEnum.SET_DELETE_LOADING,
        payload: true,
      });

      const { data: response } = await axios.delete<ApiResponse>(
        `/api/sprint/delete?board_id=${board_id}`,
        { withCredentials: true }
      );

      if (response.success) {
        showToast(response.data.message, "success");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Something went wrong";
      showToast(errorMessage, "error");
    } finally {
      closeModal();
      miscDispatch({
        type: MiscActionEnum.SET_DELETE_TASK_MODAL,
        payload: false,
      });
      miscDispatch({
        type: MiscActionEnum.SET_DELETE_TASK_DETAILS,
        payload: null,
      });
      sprintDispatch({ type: SprintActionEnum.SET_REFETCH, payload: true });
      miscDispatch({ type: MiscActionEnum.SET_DELETE_LOADING, payload: false });
    }
  };

  return (
    <dialog
      className={`modal ${miscState.deleteTaskModal ? "modal-open" : ""}`}
      open={miscState.deleteTaskModal}
    >
      <div className="modal-box p-6 rounded-lg shadow" ref={modalRef}>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={closeModal}
        >
          <X />
        </button>

        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M4.93 19h14.14a2 2 0 001.98-2.36L19.5 6.37A2 2 0 0017.55 5H6.45a2 2 0 00-1.97 1.37L2.05 16.64A2 2 0 004.93 19z"
            />
          </svg>

          <h3 className="font-bold text-lg mt-3">Delete Task</h3>

          <p id="taskTitle" className="text-center mt-2 px-4 font-semibold">
            {miscState.setDeleteTaskDetails?.title || "Unnamed Task"}
          </p>

          <p className="text-center mt-1 px-4">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <button
            className={`btn btn-outline btn-error px-6 disabled:${miscState.deleteSprintLoading}`}
            onClick={() =>
              handleDeleteTask(miscState.setDeleteTaskDetails?.id || "")
            }
          >
            {miscState.deleteSprintLoading ? (
              <>
                <Loader2 className="animate-spin mx-2" /> Deleting
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
          <button
            className={`btn btn-outline px-6 disabled:${miscState.deleteSprintLoading}`}
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DeleteSprint;
