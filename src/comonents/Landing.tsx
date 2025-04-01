import React, { useState } from "react";
import Image from "next/image";
import { ModalActionEnum, useModal } from "@/context/ModalContext";
import { useTheme } from "@/context/ThemeContext";

const Landing = () => {
  const { dispatch } = useModal();
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col items-center px-6 md:px-16 overflow-hidden">
      <div className="my-auto sm:my-20 w-full max-w-4xl text-center md:text-left md:ml-10 z-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold">KANBAN</h1>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold">BOARD</h1>
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold my-7 max-w-lg">
          Streamline. Prioritize. Succeed. – Your Ultimate Kanban Board for
          Effortless Task Management! 🚀
        </h3>
        <button
          className="btn btn-primary btn-xl"
          onClick={() => dispatch({ type: ModalActionEnum.OPEN_REGISTER })}
        >
          Get Started
        </button>
      </div>

      <div className="transition-all absolute hidden sm:-bottom-16 mx-auto sm:-right-28 sm:flex items-start gap-5 md:gap-10 sm:-rotate-[20deg] p-5 md:p-10">
        <Image
          src="/Images/todo1.svg"
          alt="todo1"
          width={350}
          height={350}
          quality={100}
          className={`w-32 sm:w-48 md:w-60 lg:w-80 drop-shadow-lg ${
            theme === "dark" ? "brightness-50" : "brightness-90"
          }`}
        />
        <Image
          src="/Images/todo2.svg"
          alt="todo2"
          width={350}
          height={350}
          quality={100}
          className={`w-32 sm:w-48 md:w-60 lg:w-80 drop-shadow-lg ${
            theme === "dark" ? "brightness-50" : "brightness-90"
          }`}
        />
        <Image
          src="/Images/todo3.svg"
          alt="todo3"
          width={350}
          height={350}
          quality={100}
          className={`w-32 sm:w-48 md:w-60 lg:w-80 drop-shadow-lg ${
            theme === "dark" ? "brightness-50" : "brightness-90"
          }`}
        />
      </div>
    </div>
  );
};

export default Landing;
