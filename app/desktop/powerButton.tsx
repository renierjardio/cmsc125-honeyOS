"use client";

import Image from "next/image";
import { FaPowerOff } from "react-icons/fa";
import { appWindow } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/api/dialog";

export default function PowerButton() {
  const handlePowerClick = async () => {
    const shouldClose = await confirm("Are you sure you want to shut down HoneyOS?", {
      title: "Confirm Exit",
      type: "warning",
    });

    if (shouldClose) {
      await appWindow.close();
    }
  };

  return (
    <div
      className="absolute -left-8 -top-8 z-50 cursor-pointer hover:brightness-75 transition duration-200"
      onClick={handlePowerClick}
    >
      <Image
        src="/revisedHoneyOS/powerButton.png"
        alt="Power Button"
        width={180}
        height={180}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <FaPowerOff size={40} color="#743D31" />
      </div>
    </div>
  );
}