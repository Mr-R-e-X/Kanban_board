"use client";

import React, { useContext, useReducer, createContext } from "react";

export interface UserProfileStats {
  totalBoards: number;
  totalTasks: number;
  totalTodo: number;
  totalInProgress: number;
  totalDone: number;
  totalSavedForLater: number;
  totalUrgentTask: number;
  totalHighTask: number;
  totalMediumTask: number;
  totalLowTask: number;
  totalUrgentPendingTask: number;
  totalUrgentDoneTask: number;
  totalMediumPendingTask: number;
  totalMediumDoneTask: number;
  totalLowPendingTask: number;
  totalLowDoneTask: number;
  totalHighPendingTask: number;
  totalHighDoneTask: number;
  userEmail: string;
  userName: string;
}

interface AuthState {
  user: {
    name: string;
    email: string;
    _id: string;
    profile_image?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileDetailsLoading: boolean;
  profileStats: UserProfileStats;
}

export enum AuthActionEnum {
  SET_USER = "SET_USER",
  SET_IS_AUTHENTICATED = "SET_IS_AUTHENTICATED",
  SET_LOADING = "SET_LOADING",
  SET_IS_PROFILE_DETAILS_LOADING = "SET_IS_PROFILE_DETAILS_LOADING",
  SET_PROFILE_STATS = "SET_PROFILE_STATS",
}

type AuthAction =
  | {
      type: AuthActionEnum.SET_USER;
      payload: {
        name: string;
        email: string;
        _id: string;
        profile_image?: string;
      } | null;
    }
  | {
      type: AuthActionEnum.SET_IS_AUTHENTICATED;
      payload: boolean;
    }
  | {
      type: AuthActionEnum.SET_LOADING;
      payload: boolean;
    }
  | {
      type: AuthActionEnum.SET_IS_PROFILE_DETAILS_LOADING;
      payload: boolean;
    }
  | {
      type: AuthActionEnum.SET_PROFILE_STATS;
      payload: UserProfileStats;
    };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isProfileDetailsLoading: false,
  profileStats: {
    totalBoards: 0,
    totalTasks: 0,
    totalTodo: 0,
    totalInProgress: 0,
    totalDone: 0,
    totalSavedForLater: 0,
    totalUrgentTask: 0,
    totalHighTask: 0,
    totalMediumTask: 0,
    totalLowTask: 0,
    totalUrgentPendingTask: 0,
    totalUrgentDoneTask: 0,
    totalMediumPendingTask: 0,
    totalMediumDoneTask: 0,
    totalLowPendingTask: 0,
    totalLowDoneTask: 0,
    totalHighPendingTask: 0,
    totalHighDoneTask: 0,
    userEmail: "",
    userName: "",
  },
};

const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionEnum.SET_USER:
      return { ...state, user: action.payload };
    case AuthActionEnum.SET_IS_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };
    case AuthActionEnum.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AuthActionEnum.SET_IS_PROFILE_DETAILS_LOADING:
      return { ...state, isProfileDetailsLoading: action.payload };
    case AuthActionEnum.SET_PROFILE_STATS:
      return { ...state, profileStats: action.payload };
    default:
      return state;
  }
};

export const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context;
};
