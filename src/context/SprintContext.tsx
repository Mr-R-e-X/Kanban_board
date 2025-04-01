"use client";
import React, { useContext, useReducer, createContext } from "react";
import { PRIORITY_ENUM } from "./MiscContext";

export type Sprint = {
  _id: string;
  title: string;
  user_id: string;
  index: number;
  description: string;
  overall_priority: PRIORITY_ENUM;
  progress: number;
};

export enum StatusType {
  TODO = "TO DO",
  IN_PROGRESS = "IN PROGRESS",
  DONE = "DONE",
  SAVED_FOR_LETTER = "SAVED FOR LATER",
}

interface SprintState {
  sprints: Array<Sprint>;
  isLoading: boolean;
  refetch: boolean;
  detailedSprint: {
    _id: string;
    title: string;
    tasks: {
      "TO DO": Array<any>;
      "IN PROGRESS": Array<any>;
      DONE: Array<any>;
      "SAVED FOR LATER": Array<any>;
    };
  };
  refetchDetail: boolean;
  taskEdit: boolean;
  taskEditDetails: any;
  deleteTask: boolean;
  deleteTaskDetails: any;
  deleteLoading: boolean;
}

export enum SprintActionEnum {
  SET_SPRINTS = "SET_SPRINTS",
  SET_LOADING = "SET_LOADING",
  SET_REFETCH = "SET_REFETCH",
  SET_SPRINT_DETAIL = "SET_SPRINT_DETAIL",
  SET_REFETCH_DETAIL = "SET_REFETCH_DETAIL",
  SET_TASK_EDIT = "SET_TASK_EDIT",
  SET_TASK_EDIT_DETAILS = "SET_TASK_EDIT_DETAILS",
  SET_DELETE_TASK = "SET_DELETE_TASK",
  SET_DELETE_TASK_DETAILS = "SET_DELETE_TASK_DETAILS",
  SET_DELETE_LOADING = "SET_DELETE_LOADING",
}

type SprintAction =
  | {
      type: SprintActionEnum.SET_SPRINTS;
      payload: Array<Sprint>;
    }
  | {
      type: SprintActionEnum.SET_LOADING;
      payload: boolean;
    }
  | {
      type: SprintActionEnum.SET_REFETCH;
      payload: boolean;
    }
  | {
      type: SprintActionEnum.SET_SPRINT_DETAIL;
      payload: {
        _id: string;
        title: string;
        tasks: {
          "TO DO": Array<any>;
          "IN PROGRESS": Array<any>;
          DONE: Array<any>;
          "SAVED FOR LATER": Array<any>;
        };
      };
    }
  | {
      type: SprintActionEnum.SET_REFETCH_DETAIL;
      payload: boolean;
    }
  | {
      type: SprintActionEnum.SET_TASK_EDIT;
      payload: boolean;
    }
  | {
      type: SprintActionEnum.SET_TASK_EDIT_DETAILS;
      payload: any;
    }
  | {
      type: SprintActionEnum.SET_DELETE_TASK;
      payload: boolean;
    }
  | {
      type: SprintActionEnum.SET_DELETE_TASK_DETAILS;
      payload: any;
    }
  | {
      type: SprintActionEnum.SET_DELETE_LOADING;
      payload: boolean;
    };

const initialState: SprintState = {
  sprints: [],
  isLoading: false,
  refetch: false,
  detailedSprint: {
    _id: "",
    title: "",
    tasks: {
      "TO DO": [],
      "IN PROGRESS": [],
      DONE: [],
      "SAVED FOR LATER": [],
    },
  },
  refetchDetail: false,
  taskEdit: false,
  taskEditDetails: {},
  deleteTask: false,
  deleteTaskDetails: {},
  deleteLoading: false,
};

const sprintReducer = (
  state: SprintState,
  action: SprintAction
): SprintState => {
  switch (action.type) {
    case SprintActionEnum.SET_SPRINTS:
      return { ...state, sprints: action.payload };
    case SprintActionEnum.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case SprintActionEnum.SET_REFETCH:
      return { ...state, refetch: action.payload };
    case SprintActionEnum.SET_SPRINT_DETAIL:
      return { ...state, detailedSprint: action.payload };
    case SprintActionEnum.SET_REFETCH_DETAIL:
      return { ...state, refetchDetail: action.payload };
    case SprintActionEnum.SET_TASK_EDIT:
      return { ...state, taskEdit: action.payload };
    case SprintActionEnum.SET_TASK_EDIT_DETAILS:
      return { ...state, taskEditDetails: action.payload };
    case SprintActionEnum.SET_DELETE_TASK:
      return { ...state, deleteTask: action.payload };
    case SprintActionEnum.SET_DELETE_TASK_DETAILS:
      return { ...state, deleteTaskDetails: action.payload };
    case SprintActionEnum.SET_DELETE_LOADING:
      return { ...state, deleteLoading: action.payload };
    default:
      return state;
  }
};

export const SprintContext = createContext<{
  state: SprintState;
  dispatch: React.Dispatch<SprintAction>;
} | null>(null);

export const SprintProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(sprintReducer, initialState);
  return (
    <SprintContext.Provider value={{ state, dispatch }}>
      {children}
    </SprintContext.Provider>
  );
};

export const useSprint = () => {
  const context = useContext(SprintContext);
  if (!context) {
    throw new Error("useSprintContext must be used within a SprintProvider");
  }
  return context;
};
