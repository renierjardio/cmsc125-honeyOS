import Window from "@/app/desktop/components/window";
import React, {useRef} from "react";
import Webcam from "react-webcam";
import {FaCamera} from "react-icons/fa";
import {WindowProps} from "@/app/types";

export default function Camera({windowIndex}: WindowProps) {
    const videoConstraints = {
        facingMode: "user"
      };

    return (
        <Window
            name="Camera"
            windowIndex={windowIndex}
            icon={<FaCamera size={25} color={'yellow'}/>}>
            <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                className={"w-full h-full bg-primary rounded-lg"}
                videoConstraints={videoConstraints} />
        </Window>
        )
}