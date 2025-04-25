import React, {Dispatch} from "react";
import {Window} from "@/app/context/openedWindowsContext";

export type FileProps = {
    name: string,
    mtime: number,
    size: number,
    is_dir: boolean
}

export type OpenedWindowsProps = {
    openedWindows: Window[],
    setOpenedWindows: Dispatch<React.SetStateAction<Window[]>>
}
export type WindowProps = {
    name?: string,
    customName?: string,
    children?: React.ReactNode,
    icon?: React.JSX.Element,
    onClose?: () => boolean,
    windowIndex: number,
}

export type HoneyFile = {
    name: string,
    mtime: string,
    size: string,
    is_dir: boolean
}

