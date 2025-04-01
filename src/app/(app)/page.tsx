"use client";
import Landing from "@/comonents/Landing";
import LoginModal from "@/comonents/LoginModal";
import Navbar from "@/comonents/Navbar";
import RegisterModal from "@/comonents/RegisterModat";
import { AuthActionEnum, useAuth } from "@/context/AuthContext";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { showToast } from "../utils/Toast.utils";

const page = () => {
  const router = useRouter();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const handleRedirect = async () => {
    authDispatch({ type: AuthActionEnum.SET_LOADING, payload: true });
    try {
      const accessToken = localStorage.getItem("accessToken")
        ? JSON.parse(localStorage.getItem("accessToken")!)
        : null;
      const { data: response } = await axios.post(
        "/api/auth/token-login",
        { accessToken },
        { withCredentials: true }
      );
      if (response.success) {
        showToast(
          response?.data?.message || "Please complete the validation process.",
          "success"
        );
        authDispatch({
          type: AuthActionEnum.SET_USER,
          payload: response?.data?.user,
        });
        authDispatch({
          type: AuthActionEnum.SET_IS_AUTHENTICATED,
          payload: true,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      router.push("/");
    } finally {
      authDispatch({ type: AuthActionEnum.SET_LOADING, payload: false });
    }
  };

  useEffect(() => {
    handleRedirect();
  }, []);

  if (authState.isLoading || authState.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={130} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden h-screen transition-all duration-300">
      <Navbar />
      <Landing />
      <LoginModal />
      <RegisterModal />
    </div>
  );
};

export default page;
