"use client";

import Image from "next/image";
import Taskbar from "./taskbar";
import React, { useContext } from "react";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import PowerButton from "./powerButton";

export default function Desktop() {
  const { openedWindows, setOpenedWindows, numberOfOpenedWindows } =
    useContext(OpenedWindowsContext);

  return (
    <div className="w-full h-full">
      <div className="absolute w-full h-full -z-100">
        <Image
          src={"/revisedHoneyOS/desktop.png"}
          height={100}
          width={100}
          className="w-full h-full"
          alt="wallpaper"
        />
      </div>
      <div>
        <PowerButton />
      </div>
      <div className="font-consolas relative w-full h-full">
        {numberOfOpenedWindows ? (
          <div className={"absolute z-20 w-full h-full pointer-events-none"}>
            {openedWindows.map((win, i) =>
              win.html && !win.minimized ? (
                <div
                  key={i}
                  className={`absolute ${win.focused ? "z-50" : "z-10"}`}
                >
                  {win.html}
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </div>
      <div className="absolute bottom-0 left-0 w-full z-10">
        <Taskbar />
      </div>
    </div>
  );
}
