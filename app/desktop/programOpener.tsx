import Note from "@/app/program/note";
import React from "react";
import {OpenedWindowsProps} from "@/app/types";
import Settings from "@/app/program/settings"
import FileManager from "@/app/program/file_manager";
import Camera from "@/app/program/camera";
import {Window} from "@/app/context/openedWindowsContext";
import Spotify from "@/app/program/spotify";
import Chess from "@/app/program/chess";

type File = {
    name: string,
    content: string,
    location: string
}
export function OpenNote({openedWindows, setOpenedWindows}: OpenedWindowsProps, file?: File) {
    if(openedWindows[0].html) {
        if(openedWindows[0].html?.props.file.name === file?.name) toggleMinimize(openedWindows, setOpenedWindows, 0);
        else closeWindow(openedWindows, setOpenedWindows, 0);
    }
    else openWindow(openedWindows, setOpenedWindows, 0, <Note windowIndex={0} file={file} />);
}

export function OpenSettings({openedWindows, setOpenedWindows}: OpenedWindowsProps, speak?: (text: string) => void) {
    if(openedWindows[1].html) toggleMinimize(openedWindows, setOpenedWindows, 1)

    else {
        openWindow(openedWindows, setOpenedWindows, 1, <Settings windowIndex={1}/>);
        if (speak) speak("Opening the settings window for you.")
    }
}

export function OpenCamera({openedWindows, setOpenedWindows}: OpenedWindowsProps) {
    if(openedWindows[2].html) toggleMinimize(openedWindows, setOpenedWindows, 2)

    else openWindow(openedWindows, setOpenedWindows, 2, <Camera windowIndex={2}/>);
}
export function OpenFileManager({openedWindows, setOpenedWindows}: OpenedWindowsProps)  {
    if(openedWindows[3].html) toggleMinimize(openedWindows, setOpenedWindows, 3)
    else openWindow(openedWindows, setOpenedWindows, 3, <FileManager windowIndex={3}/>);
}

export function OpenSpotify({openedWindows, setOpenedWindows}: OpenedWindowsProps)  {
    if(openedWindows[4].html) toggleMinimize(openedWindows, setOpenedWindows, 4)
    else openWindow(openedWindows, setOpenedWindows, 4, <Spotify windowIndex={4}/>);
}

export function OpenChess({openedWindows, setOpenedWindows}: OpenedWindowsProps)  {
    if(openedWindows[5].html) toggleMinimize(openedWindows, setOpenedWindows, 5)
    else openWindow(openedWindows, setOpenedWindows, 5, <Chess windowIndex={5}/>);
}

const openWindow = (openedWindows: Window[], setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>, index: number, html: React.JSX.Element) => {
    setOpenedWindows(prevState => {
        prevState[index].html = html;
        return [...prevState];
    })
    SetFocus(index, setOpenedWindows);
}

const toggleMinimize = (openedWindows: Window[], setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>, index: number) => {
    if(openedWindows[index].minimized) {
        SetFocus(index, setOpenedWindows);
        setOpenedWindows(prevState => {
            prevState[index].minimized = false;
            return [...prevState];
        })
    } else {
        setOpenedWindows(prevState => {
            prevState[index].minimized = true;
            return [...prevState];
        })
    }
}

export const restoreWindow = (openedWindows: Window[], setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>, index: number) => {
    setOpenedWindows(prevState => {
        prevState[index].maximized = false;
        prevState[index].minimized = false;
        return [...prevState];
    })
}

export const maximizeWindow = (openedWindows: Window[], setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>, index: number) => {
    setOpenedWindows(prevState => {
        prevState[index].maximized = true;
        prevState[index].minimized = false;
        return [...prevState];
    })
}

export const minimizeWindow = (openedWindows: Window[], setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>, index: number) => {
    setOpenedWindows(prevState => {
        prevState[index].minimized = true;
        prevState[index].maximized = false;
        return [...prevState];
    })
}

export const closeWindow = (openedWindows: Window[], setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>, index: number) => {
    setOpenedWindows(prevState => {
        prevState[index].html = null;
        prevState[index].focused = false;
        prevState[index].minimized = false;
        prevState[index].maximized = false;
        return [...prevState];
    })
}

export function SetFocus(windowIndex: number, setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>) {
    setOpenedWindows(prevState => {
        prevState.map((window, index) => {
            window.focused = index === windowIndex;
        });
        return [...prevState];
    })
}