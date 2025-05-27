import Note from "@/app/program/note";
import React from "react";
import { OpenedWindowsProps } from "@/app/types";
import Voice_Program from "../program/voice_program";
import FileManager from "@/app/program/file_manager";
import Camera from "@/app/program/camera";
import { Window } from "@/app/context/openedWindowsContext";
import Spotify from "@/app/program/spotify";
import Chess from "@/app/program/chess";
import Manager from "../program/sched_manager";
import MemoryManager from "../program/memory_manager";
import ImageViewerWindow from "@/app/desktop/components/image_viewer";

type File = {
  name: string;
  content: string;
  location: string;
};

export function OpenNote(
  { openedWindows, setOpenedWindows }: OpenedWindowsProps,
  file?: File
) {
  if (openedWindows[0].html) {
    if (openedWindows[0].html?.props.file.name === file?.name)
      toggleMinimize(openedWindows, setOpenedWindows, 0);
    else closeWindow(openedWindows, setOpenedWindows, 0);
  } else
    openWindow(
      openedWindows,
      setOpenedWindows,
      0,
      <Note windowIndex={0} file={file} />
    );
}

export function OpenVoice({
  openedWindows,
  setOpenedWindows,
}: OpenedWindowsProps) {
  if (openedWindows[1].html) toggleMinimize(openedWindows, setOpenedWindows, 1);
  else
    openWindow(
      openedWindows,
      setOpenedWindows,
      1,
      <Voice_Program windowIndex={1} />
    );
}

export function OpenSchedManager(
  { openedWindows, setOpenedWindows }: OpenedWindowsProps,
  speak?: (text: string) => void
) {
  if (openedWindows[2].html) toggleMinimize(openedWindows, setOpenedWindows, 2);
  else {
    openWindow(openedWindows, setOpenedWindows, 2, <Manager windowIndex={2} />);
    if (speak) speak("Opening the manager window for you.");
  }
}

export function OpenMemoryManager(
  { openedWindows, setOpenedWindows }: OpenedWindowsProps,
  speak?: (text: string) => void
) {
  if (openedWindows[3].html) toggleMinimize(openedWindows, setOpenedWindows, 3);
  else {
    openWindow(
      openedWindows,
      setOpenedWindows,
      3,
      <MemoryManager windowIndex={3} />
    );
    if (speak) speak("Opening the memory manager window for you.");
  }
}

export function OpenFileManager({
  openedWindows,
  setOpenedWindows,
}: OpenedWindowsProps) {
  if (openedWindows[4].html) toggleMinimize(openedWindows, setOpenedWindows, 4);
  else
    openWindow(
      openedWindows,
      setOpenedWindows,
      4,
      <FileManager windowIndex={4} />
    );
}

export function OpenCamera({
  openedWindows,
  setOpenedWindows,
}: OpenedWindowsProps) {
  if (openedWindows[5].html) toggleMinimize(openedWindows, setOpenedWindows, 5);
  else
    openWindow(openedWindows, setOpenedWindows, 5, <Camera windowIndex={5} />);
}

export function OpenSpotify({
  openedWindows,
  setOpenedWindows,
}: OpenedWindowsProps) {
  if (openedWindows[6].html) toggleMinimize(openedWindows, setOpenedWindows, 6);
  else
    openWindow(openedWindows, setOpenedWindows, 6, <Spotify windowIndex={6} />);
}

export function OpenChess({
  openedWindows,
  setOpenedWindows,
}: OpenedWindowsProps) {
  if (openedWindows[7].html) toggleMinimize(openedWindows, setOpenedWindows, 7);
  else
    openWindow(openedWindows, setOpenedWindows, 7, <Chess windowIndex={7} />);
}

export function OpenImage(
  { openedWindows, setOpenedWindows }: OpenedWindowsProps,
  file: { name: string; content: Uint8Array | string; location: string }
) {
  const IMAGE_INDEX = 8;

  let imageSrc: string;

  if (
    typeof file.content === "string" &&
    file.content.startsWith("data:image")
  ) {
    imageSrc = file.content;
  } else if (file.content instanceof Uint8Array) {
    const blob = new Blob([file.content], { type: "image/jpeg" });
    imageSrc = URL.createObjectURL(blob);
  } else {
    imageSrc = "";
  }

  if (openedWindows[IMAGE_INDEX]?.html) {
    const existingFileName = openedWindows[IMAGE_INDEX]?.html?.props?.name;
    if (existingFileName === file.name) {
      toggleMinimize(openedWindows, setOpenedWindows, IMAGE_INDEX);
    } else {
      closeWindow(openedWindows, setOpenedWindows, IMAGE_INDEX);
      openWindow(
        openedWindows,
        setOpenedWindows,
        IMAGE_INDEX,
        <ImageViewerWindow
          windowIndex={IMAGE_INDEX}
          imageSrc={imageSrc}
          name={file.name}
          location={file.location}
        />
      );
    }
  } else {
    openWindow(
      openedWindows,
      setOpenedWindows,
      IMAGE_INDEX,
      <ImageViewerWindow
        windowIndex={IMAGE_INDEX}
        imageSrc={imageSrc}
        name={file.name}
        location={file.location}
      />
    );
  }
}

const openWindow = (
  openedWindows: Window[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>,
  index: number,
  html: React.JSX.Element
) => {
  setOpenedWindows((prevState) => {
    const updated = [...prevState];
    if (!updated[index]) {
      // Create a new window if it doesn't exist
      updated[index] = {
        html,
        minimized: false,
        maximized: false,
        focused: true,
        name: html.type.name || `Window${index}`,
      };
    } else {
      // Update existing window's html
      updated[index] = { ...updated[index], html };
    }
    return updated;
  });
  SetFocus(index, setOpenedWindows);
};

const toggleMinimize = (
  openedWindows: Window[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>,
  index: number
) => {
  if (openedWindows[index].minimized) {
    SetFocus(index, setOpenedWindows);
    setOpenedWindows((prevState) => {
      prevState[index].minimized = false;
      return [...prevState];
    });
  } else {
    setOpenedWindows((prevState) => {
      prevState[index].minimized = true;
      return [...prevState];
    });
  }
};

export const restoreWindow = (
  openedWindows: Window[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>,
  index: number
) => {
  setOpenedWindows((prevState) => {
    prevState[index].maximized = false;
    prevState[index].minimized = false;
    return [...prevState];
  });
};

export const maximizeWindow = (
  openedWindows: Window[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>,
  index: number
) => {
  setOpenedWindows((prevState) => {
    prevState[index].maximized = true;
    prevState[index].minimized = false;
    return [...prevState];
  });
};

export const minimizeWindow = (
  openedWindows: Window[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>,
  index: number
) => {
  setOpenedWindows((prevState) => {
    prevState[index].minimized = true;
    prevState[index].maximized = false;
    return [...prevState];
  });
};

export const closeWindow = (
  openedWindows: Window[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>,
  index: number
) => {
  setOpenedWindows((prevState) => {
    prevState[index].html = null;
    prevState[index].focused = false;
    prevState[index].minimized = false;
    prevState[index].maximized = false;
    return [...prevState];
  });
};

export function SetFocus(
  windowIndex: number,
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>
) {
  setOpenedWindows((prevState) => {
    prevState.map((window, index) => {
      window.focused = index === windowIndex;
    });
    return [...prevState];
  });
}
