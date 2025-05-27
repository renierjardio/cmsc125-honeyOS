import WindowScreen from "../desktop/components/window";
import React, { useEffect } from "react";
import { WindowProps } from "@/app/types";
import { FaChess } from "react-icons/fa";
import useFont from "@/hooks/useFont";

export default function Chess({ windowIndex }: WindowProps) {
  const { montserrat } = useFont();
  return (
    <WindowScreen
      name="Chess"
      windowIndex={windowIndex}
      icon={<FaChess size={25} color={"yellow"} />}
    >
      <div className="flex flex-col items-center justify-center p-16 w-full h-full overflow-auto mx-auto">
        <div className="relative w-[100%] pt-[56.25%] border border-[#743D31]">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://fritz.chessbase.com"
          ></iframe>
        </div>
      </div>
    </WindowScreen>
  );
}
