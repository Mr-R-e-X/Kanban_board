"use client";
import { ApiResponse } from "@/app/types/apiResponse";
import { showToast } from "@/app/utils/Toast.utils";
import { verifyCodeValidation } from "@/app/validation/zod.validation";
import { AuthActionEnum, useAuth } from "@/context/AuthContext";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { LoaderIcon } from "react-hot-toast";
import { z } from "zod";

const OtpInput = ({ length = 6 }: { length?: number }) => {
  const { state: miscState, dispatch: miscDispatch } = useMisc();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset: formReset,
  } = useForm<z.infer<typeof verifyCodeValidation>>({
    resolver: zodResolver(verifyCodeValidation),
    defaultValues: { code: "" },
  });

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const otpValue = watch("code") || "";

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    let newOtp = otpValue.split("");
    newOtp[index] = value.slice(-1);
    setValue("code", newOtp.join(""));

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: z.infer<typeof verifyCodeValidation>) => {
    miscDispatch({ type: MiscActionEnum.SET_LOADING, payload: true });
    try {
      const { data: response } = await axios.post<ApiResponse>(
        "/api/auth/verify",
        { code: data.code },
        { withCredentials: true }
      );
      if (response?.success) {
        showToast(response.data.message, "success");
        formReset();
        authDispatch({
          type: AuthActionEnum.SET_USER,
          payload: response?.data?.user,
        });
        router.push("/dashboard");
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
    <form onSubmit={handleSubmit(onSubmit)} className="text-center">
      <h2 className="text-xl font-bold text-center my-4">Verify OTP</h2>
      <div className="flex space-x-2 my-4">
        {[...Array(length)].map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            maxLength={1}
            className="input input-primary text-center grow ml-2 w-12 h-12 text-lg"
            value={otpValue[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
        {errors.code && (
          <p className="text-red-500 text-sm">{errors.code.message}</p>
        )}
      </div>
      <button
        type="submit"
        className={`btn btn-primary mt-4 w-full btn-lg text-lg my-2 ${
          miscState.loading ? "cursor-wait opacity-50 disabled:" : ""
        }`}
      >
        {!miscState.loading ? (
          "Submit"
        ) : (
          <>
            <LoaderIcon className="animate-spin mr-2" /> Submitting
          </>
        )}
      </button>
    </form>
  );
};

export default OtpInput;
