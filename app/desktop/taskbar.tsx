import React, {useContext, useEffect, useState} from 'react';
import {OpenCamera, OpenFileManager, OpenNote, OpenSettings, OpenSpotify, OpenChess} from "@/app/desktop/programOpener";
import {FaGear, FaNoteSticky, FaSpotify} from "react-icons/fa6";
import {FaCamera, FaFolder, FaChess} from "react-icons/fa";
import {OpenedWindowsContext} from "@/app/context/openedWindowsContext";
import useFileSystem from "@/hooks/useFileSystem";

export default function Taskbar() {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const {openedWindows, setOpenedWindows} = useContext(OpenedWindowsContext);
    const {directory, honey_directory} = useFileSystem();
    // Update the current date and time every second
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString();
            setCurrentTime(`${time}`);
            setCurrentDate(`${date}`)
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="text-sm flex items-center justify-center font-consolas space-x-1 text-white w-[100vw] bg-primary/80 h-[6vh]">
            <div className="absolute right-0 pr-[1vw] ">
                {currentTime}<br></br>
                {currentDate}
            </div>
            <div className={`p-3 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors duration-300 rounded-md 
            ${openedWindows[0].html ? 'bg-gray-700 ' : ''}`}
                onClick={() => OpenNote({
                    openedWindows,
                    setOpenedWindows,
                }, {
                    name: "untitled.txt",
                    content: "",
                    location: directory(),
                })}>
                <FaNoteSticky size={30} color={'yellow'}/>
            </div>
            <div
                className={`p-3 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors duration-300 
                rounded-md ${openedWindows[1].html ? 'bg-gray-700 ' : ''}`}
                onClick={() => OpenSettings({
                    openedWindows,
                    setOpenedWindows,
                })}>
                <FaGear size={30} color={'yellow'}/>
            </div>
            <div
                className={`p-3 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors duration-300 
                rounded-md ${openedWindows[2].html ? 'bg-gray-700 ' : ''}`}
                onClick={() => OpenCamera({
                    openedWindows,
                    setOpenedWindows,
                })}>
                <FaCamera size={30} color={'yellow'}/>
            </div>
            <div
                className={`p-3 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors duration-300
                rounded-md ${openedWindows[3].html ? 'bg-gray-700 ' : ''}`}
                onClick={() => OpenFileManager({
                    openedWindows,
                    setOpenedWindows,
                })}>
                <FaFolder size={30} color={'yellow'}/>
            </div>
            <div
                className={`p-3 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors duration-300
                rounded-md ${openedWindows[4].html ? 'bg-gray-700 ' : ''}`}
                onClick={() => OpenSpotify({
                    openedWindows,
                    setOpenedWindows,
                })}>
                <FaSpotify size={30} color={'yellow'}/>
            </div>
            <div
                className={`p-3 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors duration-300
                rounded-md ${openedWindows[5].html ? 'bg-gray-700 ' : ''}`}
                onClick={() => OpenChess({
                    openedWindows,
                    setOpenedWindows,
                })}>
                <FaChess size={30} color={'yellow'}/>
            </div>
        </div>
    );
}
