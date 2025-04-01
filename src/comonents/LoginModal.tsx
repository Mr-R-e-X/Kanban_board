"use client";
import React, { useEffect, useRef } from "react";
import { useModal } from "@/context/ModalContext";
import { EyeClosed, EyeIcon } from "lucide-react";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInValidation } from "@/app/validation/zod.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { AuthActionEnum, useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderIcon } from "react-hot-toast";

const LoginModal = () => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: authState, dispatch: authDispatch } = useAuth();

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      modalDispatch({ type: "CLOSE_LOGIN" });
    }
  };

  const handleEscapeButton = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      modalDispatch({ type: "CLOSE_LOGIN" });
    }
  };

  useEffect(() => {
    if (modalState.loginModal) {
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
  }, [modalState.loginModal]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: formReset,
  } = useForm<z.infer<typeof signInValidation>>({
    resolver: zodResolver(signInValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInValidation>) => {
    miscDispatch({ type: MiscActionEnum.SET_LOADING, payload: true });
    try {
      const { data: response } = await axios.post<ApiResponse>(
        "/api/auth/sign-in",
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true,
        }
      );
      if (response?.success) {
        showToast(
          response?.data?.message || "Please complete the validation process.",
          "success"
        );
        formReset();
        authDispatch({
          type: AuthActionEnum.SET_USER,
          payload: response?.data?.user,
        });
        authDispatch({
          type: AuthActionEnum.SET_IS_AUTHENTICATED,
          payload: true,
        });
        localStorage.setItem(
          "accessToken",
          JSON.stringify(response?.data?.accessToken)
        );
        router.push("/dashboard");
        modalDispatch({ type: "CLOSE_LOGIN" });
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
    <dialog className="modal" open={modalState.loginModal}>
      <div className="modal-box" ref={modalRef}>
        <h3 className="font-bold text-lg text-center">Welcome Back!</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-2 my-4">
          <label className="input input-primary w-full input-lg my-2">
            Email
            <input
              type="text"
              className="grow ml-2"
              placeholder="johndoe@email.com"
              {...register("email")}
            />
          </label>
          {errors.email && (
            <span className="text-red-500 text-sm ml-2">
              {errors.email.message}
            </span>
          )}
          <label className="input input-primary w-full input-lg my-2">
            Password
            <input
              type="password"
              className="grow ml-2"
              placeholder={miscState.seePassword ? "john@123" : "••••••••"}
              {...register("password")}
            />
            <span
              className="badge badge-xs"
              onClick={() =>
                miscDispatch({
                  type: MiscActionEnum.SET_SEE_PASSWORD,
                  payload: !miscState.seePassword,
                })
              }
            >
              {miscState.seePassword ? <EyeIcon /> : <EyeClosed />}
            </span>
          </label>
          {errors.password && (
            <span className="text-red-500 text-sm ml-2">
              {errors.password.message}
            </span>
          )}

          <button
            type="submit"
            className={`btn btn-primary mt-4 w-full btn-lg text-lg my-2 ${
              miscState.loading ? "cursor-wait opacity-50 disabled:" : ""
            }`}
          >
            {!miscState.loading ? (
              "Sign in"
            ) : (
              <>
                <LoaderIcon className="animate-spin mr-2" /> Signing in
              </>
            )}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default LoginModal;
