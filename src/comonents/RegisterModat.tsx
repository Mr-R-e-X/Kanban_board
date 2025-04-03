"use client";
import React, { useEffect, useRef, useState } from "react";
import { ModalActionEnum, useModal } from "@/context/ModalContext";
import OtpInput from "./OtpForm";
import RegisterForm from "./RegisterForm";
import { MiscActionEnum, useMisc } from "@/context/MiscContext";

const RegisterModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useModal();
  const { dispatch: miscDispatch } = useMisc();

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      dispatch({ type: ModalActionEnum.CLOSE_REGISTER });
      miscDispatch({
        type: MiscActionEnum.SET_SEE_PASSWORD,
        payload: false,
      });
    }
  };

  const handleEscapeButton = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      dispatch({ type: ModalActionEnum.CLOSE_REGISTER });
      miscDispatch({
        type: MiscActionEnum.SET_SEE_PASSWORD,
        payload: false,
      });
    }
  };

  useEffect(() => {
    if (state.registerModal) {
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
  }, [state.registerModal]);

  return (
    <dialog className="modal" open={state.registerModal}>
      <div className="modal-box" ref={modalRef}>
        <div className="flex justify-center">
          <ul className="steps">
            <li
              className={`step ${
                state.registerStepCount >= 0 ? "step-primary" : ""
              }`}
            >
              😃
            </li>
            <li
              className={`step ${
                state.registerStepCount >= 1 ? "step-primary" : ""
              }`}
            >
              😍
            </li>
          </ul>
        </div>
        {state.registerStepCount === 0 && <RegisterForm />}
        {state.registerStepCount === 1 && <OtpInput />}
      </div>
    </dialog>
  );
};

export default RegisterModal;
