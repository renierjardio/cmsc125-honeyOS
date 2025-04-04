import WindowScreen from "../desktop/components/window";
import React, {useEffect} from "react";
import {WindowProps} from "@/app/types";
import {FaChess} from "react-icons/fa";
import useFont from "@/hooks/useFont";

export default function Chess({windowIndex}: WindowProps) {
    const {montserrat} = useFont();
    return (
        <WindowScreen
            name="Chess"
            windowIndex={windowIndex}
            icon={ <FaChess size={25} color={'yellow'}/>}
        >

            <iframe className="w-[100%] h-[100%] pb-[5vh]" src="https://fritz.chessbase.com"></iframe>
        </WindowScreen>
    )
}