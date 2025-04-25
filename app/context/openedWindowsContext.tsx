'use client'

import React, {createContext, useEffect, useState} from "react";

export type Window = {
    html: React.JSX.Element | null,
    minimized: boolean,
    maximized: boolean,
    focused: boolean,
    name: string,
}

type OpenedWindowsProps = {
    openedWindows: Window[],
    numberOfOpenedWindows: number,
    setOpenedWindows: React.Dispatch<React.SetStateAction<Window[]>>
}

export const OpenedWindowsContext = createContext<OpenedWindowsProps>({
    openedWindows: [],
    numberOfOpenedWindows: 0,
    setOpenedWindows: () => {}
})

export default function OpenedWindowsProvider({children}: {children: React.ReactNode}) {
    const [openedWindows, setOpenedWindows] = useState<Window[]>([
        {
            html: null,
            minimized: false,
            maximized: false,
            focused: false,
            name: "note",
        },
        {
            html: null,
            minimized: false,
            maximized: false,
            focused: false,
            name: "settings",
        },
        {
            html: null,
            minimized: false,
            maximized: false,
            focused: false,
            name: "camera",
        },
        {
            html: null,
            minimized: false,
            maximized: false,
            focused: false,
            name: "fileManager",
        },
        {
            html: null,
            minimized: false,
            maximized: false,
            focused: false,
            name: "spotify",
        },
        {
            html: null,
            minimized: false,
            maximized: false,
            focused: false,
            name: "chess",
        },
    ]);
    const [numberOfOpenedWindows, setNumberOfOpenedWindows] = useState(0);

    useEffect(() => {
        setNumberOfOpenedWindows(openedWindows.filter(window => window.html !== null).length);
    }, [openedWindows]);

    return <OpenedWindowsContext.Provider value={{openedWindows, setOpenedWindows, numberOfOpenedWindows}}>{children}</OpenedWindowsContext.Provider>
}