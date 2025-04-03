import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { AuthActionEnum, useAuth } from "@/context/AuthContext";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function ProfilePage() {
  const { state, dispatch } = useAuth();

  const handleDataFetch = async () => {
    dispatch({
      type: AuthActionEnum.SET_IS_PROFILE_DETAILS_LOADING,
      payload: true,
    });
    try {
      const { data: response } = await axios.get("/api/user/about", {
        withCredentials: true,
      });
      if (response?.success) {
        dispatch({
          type: AuthActionEnum.SET_PROFILE_STATS,
          payload: response.data,
        });
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
      dispatch({
        type: AuthActionEnum.SET_IS_PROFILE_DETAILS_LOADING,
        payload: false,
      });
    }
  };

  useEffect(() => {
    handleDataFetch();
  }, []);

  if (state.isProfileDetailsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={130} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="avatar w-24 h-24 rounded-full border-primary overflow-hidden">
          <img
            src="https://api.dicebear.com/6.x/bottts/svg?seed=Daisy"
            alt="Avatar"
          />
        </div>
        <h2 className="text-3xl font-semibold mt-4">
          {state.profileStats?.userName}
        </h2>
        <p className="text-lg text-gray-500">{state.profileStats?.userEmail}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Total Sprints", value: state.profileStats.totalBoards },
          { title: "Total Tasks", value: state.profileStats.totalTasks },
          {
            title: "Total Todo",
            value: state.profileStats.totalTodo,
            color: "text-blue-500",
          },
          {
            title: "In Progress",
            value: state.profileStats.totalInProgress,
            color: "text-yellow-500",
          },
          {
            title: "Completed",
            value: state.profileStats.totalDone,
            color: "text-green-500",
          },
          {
            title: "Saved for Later",
            value: state.profileStats.totalSavedForLater,
            color: "text-gray-500",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 text-center"
          >
            <h3 className="text-lg font-medium text-gray-700">{stat.title}</h3>
            <p
              className={`text-2xl font-bold ${stat.color || "text-gray-800"}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Task Completion Rate",
            done: state.profileStats.totalDone,
            total: state.profileStats.totalTasks,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 text-center"
          >
            <h3 className="text-lg font-medium text-gray-700">{stat.title}</h3>
            <p className="text-2xl font-bold text-primary">
              {stat.total === 0
                ? "0%"
                : `${((stat.done / stat.total) * 100).toFixed(2)}%`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
