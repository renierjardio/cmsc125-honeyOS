import WindowScreen from "../desktop/components/window";
import React, {useEffect} from "react";
import {WindowProps} from "@/app/types";
import {FaGear} from "react-icons/fa6";
import useFont from "@/hooks/useFont";

export default function Settings({windowIndex}: WindowProps) {
    const {montserrat} = useFont();
    return (
        <WindowScreen
            name="Settings"
            windowIndex={windowIndex}
            icon={ <FaGear size={25} color={'yellow'}/>}
        >
            <div className="p-4 w-full h-full bg-primary rounded-lg grid justify-items-center place-items-center">
                <FaGear className={'text-[12vw] text-yellow-500 animate-pulse'}/>
                <p className={`${montserrat.className} text-yellow-500 text-[2vw] w-[300px] text-center`}>Settings Work in Progress</p>
            </div>
        </WindowScreen>
    )
}