"use client";

import React, { useContext, useReducer, createContext } from "react";

interface ModalState {
  loginModal: boolean;
  registerModal: boolean;
  registerStepCount: number;
  createTaskModal: boolean;
}

export enum ModalActionEnum {
  OPEN_LOGIN = "OPEN_LOGIN",
  CLOSE_LOGIN = "CLOSE_LOGIN",
  OPEN_REGISTER = "OPEN_REGISTER",
  CLOSE_REGISTER = "CLOSE_REGISTER",
  SET_REGISTER_STEP_COUNT = "SET_REGISTER_STEP_COUNT",
  CLOSE_REGISTER_STEP_COUNT = "CLOSE_REGISTER_STEP_COUNT",
  SET_CREATE_TASK_MODAL = "SET_CREATE_TASK_MODAL",
}

type ModalAction =
  | { type: "OPEN_LOGIN" }
  | { type: "CLOSE_LOGIN" }
  | { type: "OPEN_REGISTER" }
  | { type: "CLOSE_REGISTER" }
  | { type: "SET_REGISTER_STEP_COUNT"; payload: number }
  | { type: "CLOSE_REGISTER_STEP_COUNT"; payload: number }
  | { type: "SET_CREATE_TASK_MODAL"; payload: boolean };

const initialState: ModalState = {
  loginModal: false,
  registerModal: false,
  registerStepCount: 0,
  createTaskModal: false,
};

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case "OPEN_LOGIN":
      return { ...state, loginModal: true, registerModal: false };
    case "CLOSE_LOGIN":
      return { ...state, loginModal: false };
    case "OPEN_REGISTER":
      return { ...state, loginModal: false, registerModal: true };
    case "CLOSE_REGISTER":
      return { ...state, registerModal: false };
    case "SET_REGISTER_STEP_COUNT":
      return { ...state, registerStepCount: action.payload };
    case "CLOSE_REGISTER_STEP_COUNT":
      return { ...state, registerStepCount: 0 };
    case "SET_CREATE_TASK_MODAL":
      return { ...state, createTaskModal: action.payload };
    default:
      return state;
  }
};

const ModalContext = createContext<{
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
} | null>(null);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  return (
    <ModalContext.Provider value={{ state, dispatch }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
