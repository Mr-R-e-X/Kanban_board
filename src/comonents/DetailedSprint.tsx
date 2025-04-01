"use client";
import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { useAuth } from "@/context/AuthContext";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { SprintActionEnum, useSprint } from "@/context/SprintContext";
import axios, { AxiosError } from "axios";
import { ArrowLeft, Plus } from "lucide-react";
import React, { useState } from "react";
import { useEffect } from "react";
import DragTaskCols from "./DragTaskCols";

const DetailedSprint = () => {
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: sprintState, dispatch: sprintDispatch } = useSprint();

  const handleDataFetch = async () => {
    sprintDispatch({
      type: SprintActionEnum.SET_LOADING,
      payload: true,
    });
    try {
      const { data: response } = await axios.get<ApiResponse>(
        "/api/todo/get-all?board_id=" + miscState.currentModalSprintDetails.id,
        {
          withCredentials: true,
        }
      );

      if (response?.success) {
        sprintDispatch({
          type: SprintActionEnum.SET_SPRINT_DETAIL,
          payload: response.data.board,
        });
        showToast(response.data.message, "success");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.error || "Something went wrong";
      showToast(errorMessage, "error");
    } finally {
      sprintDispatch({
        type: SprintActionEnum.SET_LOADING,
        payload: false,
      });
      sprintDispatch({
        type: SprintActionEnum.SET_REFETCH_DETAIL,
        payload: false,
      });
    }
  };

  useEffect(() => {
    handleDataFetch();
  }, [sprintState.refetchDetail]);

  if (sprintState.isLoading || miscState.activeContent !== 4) {
    return (
      <div className="flex items-center h-screen justify-center">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="pb-3 flex items-center justify-between">
        <div className="flex flex-row items-center justify-start gap-3">
          <div
            className="tooltip tooltip-bottom tooltip-primary"
            data-tip="Back"
          >
            <button
              className="btn btn-outline btn-primary btn-circle  shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() =>
                miscDispatch({
                  type: MiscActionEnum.SET_ACTIVE_CONTENT,
                  payload: 0,
                })
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-primary">
            {miscState.currentModalSprintDetails.title} Sprint Details
          </h1>
        </div>
        <div
          className="tooltip tooltip-left tooltip-primary"
          data-tip="Create Child Sprint"
        >
          <button
            className="btn btn-primary btn-circle"
            onClick={() =>
              miscDispatch({
                type: MiscActionEnum.SET_TASK_MODAL,
                payload: true,
              })
            }
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <DragTaskCols />
    </div>
  );
};

export default DetailedSprint;
