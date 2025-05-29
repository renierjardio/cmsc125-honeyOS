"use client";

import Image from "next/image";
import Taskbar from "./taskbar";
import React, { useContext, useEffect, useState } from "react";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import PowerButton from "./powerButton";

export default function Desktop() {
  const { openedWindows, setOpenedWindows, numberOfOpenedWindows } =
    useContext(OpenedWindowsContext);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

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

      {/* Time & Date Display */}
      <div className="absolute top-4 right-4 z-30 text-[#743D31] font-mono text-sm bg-[#ffe165] px-3 py-1 rounded-xl shadow-md border border-2 border-[#fea24f]">
        <div>{formattedTime}</div>
        <div className="text-xs">{formattedDate}</div>
      </div>

      <div className="font-consolas relative w-full h-full">
        {numberOfOpenedWindows ? (
          <div className={"absolute z-20 w-full h-full pointer-events-none"}>
            {openedWindows.map((win, i) =>
              win.html ? (
                <div
                  key={i}
                  className={`${
                    win.maximized
                      ? "fixed inset-0 z-40"
                      : `absolute ${win.focused ? "z-50" : "z-10"}`
                  }`}
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
