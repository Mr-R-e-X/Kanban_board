"use client";
import { useState } from "react";
import {
  Home,
  LayoutDashboard,
  Settings,
  LogOut,
  UserCog,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { AuthActionEnum, useAuth } from "@/context/AuthContext";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { useTheme } from "@/context/ThemeContext";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";

const Sidebar = () => {
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      miscDispatch({ type: MiscActionEnum.SET_LOGOUT_LOADING, payload: true });
      const { data: response } = await axios.get("/api/user/logout", {
        withCredentials: true,
      });
      if (response?.success) {
        localStorage.removeItem("accessToken");
        authDispatch({ type: AuthActionEnum.SET_USER, payload: null });
        authDispatch({
          type: AuthActionEnum.SET_IS_AUTHENTICATED,
          payload: false,
        });
        showToast(response.data.message, "success");
        router.push("/");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      showToast(
        axiosError.response?.data?.error || "Something went wrong",
        "error"
      );
    } finally {
      miscDispatch({ type: MiscActionEnum.SET_LOGOUT_LOADING, payload: false });
    }
  };

  return (
    <div
      className={`bg-base-200 h-screen flex flex-col justify-between transition-all duration-300 overflow-hidden ${
        miscState.isSideNavOpen ? "w-64" : "w-[70px]"
      }`}
    >
      <div className="w-full">
        <div
          role="button"
          className="flex items-center gap-3 w-full justify-start p-3 mb-4 rounded-lg"
          onClick={() =>
            miscDispatch({
              type: MiscActionEnum.SET_IS_SIDE_NAV_OPEN,
              payload: !miscState.isSideNavOpen,
            })
          }
        >
          <div className="avatar avatar-placeholder cursor-pointer">
            <div className="bg-neutral text-neutral-content w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold">K</span>
            </div>
          </div>
          {miscState.isSideNavOpen && (
            <span className="text-lg font-bold">Kanban</span>
          )}
        </div>

        <ul className="menu w-full space-y-2">
          <li
            onClick={() => {
              miscDispatch({
                type: MiscActionEnum.SET_ACTIVE_CONTENT,
                payload: 0,
              });
              setIsSettingsOpen(false);
            }}
          >
            <p
              className={`flex items-center gap-3 w-full p-3  hover:text-white rounded-lg transition ${
                miscState.activeContent === 0
                  ? "bg-primary text-white hover:bg-primary"
                  : " hover:bg-secondary"
              }`}
            >
              <Home className="w-5 h-5" />
              {miscState.isSideNavOpen && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    miscState.activeContent === 0
                      ? "bg-white text-primary shadow-md"
                      : ""
                  }`}
                >
                  Dashboard
                </span>
              )}
            </p>
          </li>
          <li
            onClick={() => {
              miscDispatch({
                type: MiscActionEnum.SET_ACTIVE_CONTENT,
                payload: 1,
              });
              setIsSettingsOpen(false);
            }}
          >
            <p
              className={`flex items-center gap-3 w-full p-3 hover:text-white rounded-lg transition ${
                miscState.activeContent === 1
                  ? "bg-primary text-white hover:bg-primary"
                  : " hover:bg-secondary"
              }`}
            >
              <UserCog className="w-5 h-5" />
              {miscState.isSideNavOpen && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    miscState.activeContent === 1
                      ? "bg-white text-primary shadow-md"
                      : ""
                  }`}
                >
                  Profile
                </span>
              )}
            </p>
          </li>

          <li
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
            }}
          >
            <p
              className={`flex items-center gap-3 w-full p-3 hover:text-white rounded-lg transition ${
                isSettingsOpen
                  ? "bg-primary text-white hover:bg-primary"
                  : " hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                {miscState.isSideNavOpen && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      miscState.activeContent === 2
                        ? "bg-white text-primary shadow-md"
                        : ""
                    }`}
                  >
                    Settings
                  </span>
                )}
              </div>
              {miscState.isSideNavOpen && (
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isSettingsOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </p>
          </li>
          {isSettingsOpen && (
            <>
              <div
                onClick={toggleTheme}
                role="button"
                className="space-y-2 transition-all"
              >
                <button className="flex items-center justify-start gap-3 w-full p-3 rounded-lg hover:bg-warning transition">
                  <label className="swap swap-rotate">
                    <input
                      type="checkbox"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                    />

                    <svg
                      className="swap-on h-6 w-6 pt-1 fill-current text-primary"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                    </svg>

                    <svg
                      className="swap-off h-5 w-5 fill-current text-primary"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                    </svg>
                  </label>
                  {miscState.isSideNavOpen && (
                    <span className=" py-1  text-sm font-medium transition-all text-primary">
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </span>
                  )}
                </button>
              </div>
              {!miscState.isSideNavOpen && (
                <div role="button" className="space-y-2 transition-all">
                  <button
                    className="flex items-center justify-start gap-3 w-full p-3 py-4 rounded-lg hover:bg-error transition"
                    onClick={() => handleLogout()}
                  >
                    <div className="tooltip" data-tip="Logout">
                      <LogOut className="w-4 h-4" />
                    </div>
                    {miscState.isSideNavOpen && (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span className="py-1  text-sm font-medium transition-all text-primary">
                          {theme === "light" ? "Dark Mode" : "Light Mode"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </ul>
      </div>

      <div className="flex items-center gap-3 py-5 px-3 mt-4 ">
        <div className="avatar avatar-placeholder cursor-pointer">
          <div className="bg-neutral text-neutral-content w-10 h-10 rounded-full flex items-center justify-center">
            <span className="text-xl font-semibold">
              {authState?.user?.name.split(" ")[0][0]}
            </span>
          </div>
        </div>

        {miscState.isSideNavOpen && (
          <div className="flex w-full justify-between items-center">
            <span className="text-sm font-semibold  truncate max-w-[100px]">
              {authState?.user?.name}
            </span>
            <div className="tooltip" data-tip="Logout">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-red-600 hover:shadow-md"
                onClick={() => handleLogout()}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
