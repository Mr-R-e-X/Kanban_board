"use client";

import React, { useContext, useReducer, createContext } from "react";

export enum PRIORITY_ENUM {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

interface MiscState {
  loading: boolean;
  seePassword: boolean;
  isSideNavOpen: boolean;
  activeContent: number;
  editSprintModal: boolean;
  currentModalSprintDetails: {
    id: string;
    title: string;
    description: string;
    overall_priority: PRIORITY_ENUM;
  };
  createSprintModal: boolean;
  logoutLoading: boolean;
  taskModal: boolean;
  deleteTaskModal: boolean;
  setDeleteTaskDetails: any;
  deleteSprintLoading: boolean;
}

export enum MiscActionEnum {
  SET_LOADING = "SET_LOADING",
  SET_SEE_PASSWORD = "SET_SEE_PASSWORD",
  SET_IS_SIDE_NAV_OPEN = "SET_IS_SIDE_NAV_OPEN",
  SET_ACTIVE_CONTENT = "SET_ACTIVE_CONTENT",
  SET_EDIT_SPRINT_MODAL = "SET_EDIT_SPRINT_MODAL",
  SET_CURRENT_MODAL_SPRINT_DETAILS = "SET_CURRENT_MODAL_SPRINT_DETAILS",
  SET_CREATE_SPRINT_MODAL = "SET_CREATE_SPRINT_MODAL",
  SET_LOGOUT_LOADING = "SET_LOGOUT_LOADING",
  SET_TASK_MODAL = "SET_TASK_MODAL",
  SET_DELETE_TASK_MODAL = "SET_DELETE_TASK_MODAL",
  SET_DELETE_TASK_DETAILS = "SET_DELETE_TASK_DETAILS",
  SET_DELETE_LOADING = "SET_DELETE_LOADING",
}

type MiscAction =
  | {
      type: MiscActionEnum.SET_LOADING;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_SEE_PASSWORD;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_IS_SIDE_NAV_OPEN;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_ACTIVE_CONTENT;
      payload: number;
    }
  | {
      type: MiscActionEnum.SET_EDIT_SPRINT_MODAL;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_CURRENT_MODAL_SPRINT_DETAILS;
      payload: {
        id: string;
        title: string;
        description: string;
        overall_priority: PRIORITY_ENUM;
      };
    }
  | {
      type: MiscActionEnum.SET_CREATE_SPRINT_MODAL;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_LOGOUT_LOADING;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_TASK_MODAL;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_DELETE_TASK_MODAL;
      payload: boolean;
    }
  | {
      type: MiscActionEnum.SET_DELETE_TASK_DETAILS;
      payload: any;
    }
  | {
      type: MiscActionEnum.SET_DELETE_LOADING;
      payload: boolean;
    };

const initialState: MiscState = {
  loading: false,
  seePassword: false,
  isSideNavOpen: true,
  activeContent: 0,
  editSprintModal: false,
  currentModalSprintDetails: {
    id: "",
    title: "",
    description: "",
    overall_priority: PRIORITY_ENUM.LOW,
  },
  createSprintModal: false,
  logoutLoading: false,
  taskModal: false,
  deleteTaskModal: false,
  setDeleteTaskDetails: null,
  deleteSprintLoading: false,
};

const miscReducer = (state: MiscState, action: MiscAction): MiscState => {
  switch (action.type) {
    case MiscActionEnum.SET_LOADING:
      return { ...state, loading: action.payload };
    case MiscActionEnum.SET_SEE_PASSWORD:
      return { ...state, seePassword: action.payload };
    case MiscActionEnum.SET_IS_SIDE_NAV_OPEN:
      return { ...state, isSideNavOpen: action.payload };
    case MiscActionEnum.SET_ACTIVE_CONTENT:
      return { ...state, activeContent: action.payload };
    case MiscActionEnum.SET_EDIT_SPRINT_MODAL:
      return { ...state, editSprintModal: action.payload };
    case MiscActionEnum.SET_CURRENT_MODAL_SPRINT_DETAILS:
      return { ...state, currentModalSprintDetails: action.payload };
    case MiscActionEnum.SET_CREATE_SPRINT_MODAL:
      return { ...state, createSprintModal: action.payload };
    case MiscActionEnum.SET_LOGOUT_LOADING:
      return { ...state, logoutLoading: action.payload };
    case MiscActionEnum.SET_TASK_MODAL:
      return { ...state, taskModal: action.payload };
    case MiscActionEnum.SET_DELETE_TASK_MODAL:
      return { ...state, deleteTaskModal: action.payload };
    case MiscActionEnum.SET_DELETE_TASK_DETAILS:
      return { ...state, setDeleteTaskDetails: action.payload };
    case MiscActionEnum.SET_DELETE_LOADING:
      return { ...state, deleteSprintLoading: action.payload };
    default:
      return state;
  }
};

export const MiscContext = createContext<{
  state: MiscState;
  dispatch: React.Dispatch<MiscAction>;
} | null>(null);

export const MiscProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(miscReducer, initialState);
  return (
    <MiscContext.Provider value={{ state, dispatch }}>
      {children}
    </MiscContext.Provider>
  );
};

export const useMisc = () => {
  const context = useContext(MiscContext);
  if (!context) throw new Error("useMisc must be used within a MiscProvider");
  return context;
};
