"use client";

import Image from "next/image";
import Terminal from "./terminal";
import Manager from "./manager";
import Voice from "./voice";
import Taskbar from "./taskbar";
import React, { useContext, useEffect } from "react";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import PowerButton from "./powerButton";

export default function Desktop() {
  const { openedWindows, setOpenedWindows, numberOfOpenedWindows } =
    useContext(OpenedWindowsContext);

  return (
    <div>
      <div className="absolute w-full h-full -z-100">
        <Image
          src={"/revisedHoneyOS/desktop.png"}
          height={100}
          width={100}
          className="w-full h-full"
          alt="wallpaper"
        />
      </div>
      {/*  
      <div className="font-consolas relative w-full h-full">
        {numberOfOpenedWindows ? (
          <div className={"absolute z-20 w-full h-full pointer-events-none"}>
            {openedWindows.map((window, index) => {
              return window.html && window.html;
            })}
          </div>
        ) : null}
        <div><PowerButton/></div>
        <div className="grid grid-cols-2 grid-rows-2 h-[100vh]">
          <div className="col-span-1 row-span-2">
            <Terminal />
          </div>
          <div className="col-start-2 row-span-1">
            <Manager />
          </div>
          <div className="col-start-2 row-start-2">
            <Voice />
          </div>
          <Taskbar />
        </div>

      </div>
      */}
      <div className="font-consolas relative flex items-center w-full h-full bg-slate-100">
        {numberOfOpenedWindows ? (
          <div className={"absolute z-20 w-full h-full pointer-events-none"}>
            {openedWindows.map((window, index) => {
              return window.html && window.html;
            })}
          </div>
        ) : null}
      </div>
      <div className="absolute w-full h-full flex z-10 items-end">
        <Taskbar />
      </div>
    </div>
  );
}
