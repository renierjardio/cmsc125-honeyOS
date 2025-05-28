"use client";

import React, { createContext, useEffect, useState } from "react";

export type Window = {
  html: React.JSX.Element | null;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  name: string;
};

type OpenedWindowsProps = {
  openedWindows: Window[];
  numberOfOpenedWindows: number;
  setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>;
};

export const OpenedWindowsContext = createContext<OpenedWindowsProps>({
  openedWindows: [],
  numberOfOpenedWindows: 0,
  setOpenedWindows: () => {},
});

export default function OpenedWindowsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openedWindows, setOpenedWindows] = useState<Window[]>([
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Voice Program",
    }, // index 0
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Note",
    }, // index 1
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "File Manager",
    }, // index 2
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Scheduler Manager",
    }, // index 3
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Memory Manager",
    }, // index 4
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Camera",
    }, // index 5
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Spotify",
    }, // index 6
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Chess",
    }, // index 7
    {
      html: null,
      minimized: false,
      maximized: false,
      focused: false,
      name: "Image Viewer",
    }, // index 8
  ]);

  const [numberOfOpenedWindows, setNumberOfOpenedWindows] = useState(0);

  useEffect(() => {
    setNumberOfOpenedWindows(
      openedWindows.filter((window) => window.html !== null).length
    );
  }, [openedWindows]);

  return (
    <OpenedWindowsContext.Provider
      value={{ openedWindows, setOpenedWindows, numberOfOpenedWindows }}
    >
      {children}
    </OpenedWindowsContext.Provider>
  );
}
