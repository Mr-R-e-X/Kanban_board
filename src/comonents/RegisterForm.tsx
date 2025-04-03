"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpValidation } from "@/app/validation/zod.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, EyeIcon, LoaderIcon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { showToast } from "@/app/utils/Toast.utils";
import { ApiResponse } from "@/app/types/apiResponse";
import { useAuth } from "@/context/AuthContext";
import { ModalActionEnum, useModal } from "@/context/ModalContext";

const RegisterForm = () => {
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: formReset,
  } = useForm<z.infer<typeof signUpValidation>>({
    resolver: zodResolver(signUpValidation),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpValidation>) => {
    miscDispatch({ type: MiscActionEnum.SET_LOADING, payload: true });
    try {
      const { data: response } = await axios.post<ApiResponse>(
        "/api/auth/register",
        {
          email: data.email,
          password: data.password,
          name: data.name,
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
        modalDispatch({
          type: ModalActionEnum.SET_REGISTER_STEP_COUNT,
          payload: modalState.registerStepCount + 1,
        });
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
    <form onSubmit={handleSubmit(onSubmit)} className="mx-2 my-4">
      <h1 className="font-bold text-lg text-center my-4">
        Please fill the bello details to register.
      </h1>
      <label className="input input-primary w-full input-lg my-2">
        Name
        <input
          type="text"
          className="grow ml-2"
          placeholder="John Doe"
          {...register("name")}
        />
      </label>
      {errors.name && (
        <span className="text-red-500 text-sm ml-2">{errors.name.message}</span>
      )}

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
          type={miscState.seePassword ? "password" : "text"}
          className="grow ml-2"
          placeholder={miscState.seePassword ? "••••••••" : "john@123"}
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
          {miscState.seePassword ? <EyeClosed /> : <EyeIcon />}
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
          "Register"
        ) : (
          <>
            <LoaderIcon className="animate-spin mr-2" /> Registering
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
