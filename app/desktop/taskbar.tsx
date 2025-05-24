import React, { useContext, useEffect, useState } from "react";
import {
  OpenCamera,
  OpenFileManager,
  OpenNote,
  OpenSpotify,
  OpenChess,
  OpenVoice,
  OpenSchedManager,
} from "@/app/desktop/programOpener";
import { FaSpotify } from "react-icons/fa6";
import { FaCamera, FaFolder, FaChess, FaMicrophoneAlt } from "react-icons/fa";
import Icon from "@mdi/react";
import { mdiNoteText, mdiCalendarClock } from "@mdi/js";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import useFileSystem from "@/hooks/useFileSystem";

export default function Taskbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const { openedWindows, setOpenedWindows } = useContext(OpenedWindowsContext);
  const { directory, honey_directory } = useFileSystem();

  const [isHoveringMic, setIsHoveringMic] = useState(false);
  const [isHoveringNote, setIsHoveringNote] = useState(false);
  const [isHoveringFolder, setIsHoveringFolder] = useState(false);
  const [isHoveringTask, setIsHoveringTask] = useState(false);
  const [isHoveringCamera, setIsHoveringCamera] = useState(false);
  const [isHoveringSpotify, setIsHoveringSpotify] = useState(false);
  const [isHoveringChess, setIsHoveringChess] = useState(false);

  // Update the current date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();
      setCurrentTime(`${time}`);
      setCurrentDate(`${date}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm flex items-center justify-center font-consolas space-x-1 gap-5 text-white w-[100vw] h-[15vh]">
      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringMic
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringMic(true)}
        onMouseLeave={() => setIsHoveringMic(false)}
        onClick={() =>
          OpenVoice({
            openedWindows,
            setOpenedWindows,
          })
        }
      >
        <FaMicrophoneAlt size={50} color={"white"} />
      </div>

      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringNote
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringNote(true)}
        onMouseLeave={() => setIsHoveringNote(false)}
        onClick={() =>
          OpenNote(
            {
              openedWindows,
              setOpenedWindows,
            },
            {
              name: "untitled.txt",
              content: "",
              location: directory(),
            }
          )
        }
      >
        <Icon path={mdiNoteText} size={2.5} color={"white"} />
      </div>

      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringFolder
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringFolder(true)}
        onMouseLeave={() => setIsHoveringFolder(false)}
        onClick={() =>
          OpenFileManager({
            openedWindows,
            setOpenedWindows,
          })
        }
      >
        <FaFolder size={50} color={"white"} />
      </div>

      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringTask
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringTask(true)}
        onMouseLeave={() => setIsHoveringTask(false)}
        onClick={() => OpenSchedManager({ openedWindows, setOpenedWindows })}
      >
        <Icon path={mdiCalendarClock} size={2.5} color={"white"} />
      </div>

      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringCamera
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringCamera(true)}
        onMouseLeave={() => setIsHoveringCamera(false)}
        onClick={() =>
          OpenCamera({
            openedWindows,
            setOpenedWindows,
          })
        }
      >
        <FaCamera size={50} color={"white"} />
      </div>

      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringSpotify
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringSpotify(true)}
        onMouseLeave={() => setIsHoveringSpotify(false)}
        onClick={() =>
          OpenSpotify({
            openedWindows,
            setOpenedWindows,
          })
        }
      >
        <FaSpotify size={50} color={"white"} />
      </div>

      <div
        className={`flex w-32 h-32 cursor-pointer transition-all duration-300 rounded-md bg-center bg-no-repeat bg-contain items-center justify-center`}
        style={{
          backgroundImage: `url(${
            isHoveringChess
              ? "/revisedHoneyOS/flower-hover.png"
              : "/revisedHoneyOS/flower-normal.png"
          })`,
          backgroundSize: "contain",
        }}
        onMouseEnter={() => setIsHoveringChess(true)}
        onMouseLeave={() => setIsHoveringChess(false)}
        onClick={() =>
          OpenChess({
            openedWindows,
            setOpenedWindows,
          })
        }
      >
        <FaChess size={50} color={"white"} />
      </div>
    </div>
  );
}
