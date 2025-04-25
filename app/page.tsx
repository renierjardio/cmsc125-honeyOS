"use client";

import {useState, useEffect, useContext} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import useFont from "@/hooks/useFont";
import {SpeechRecognitionContext} from "./context/speechRecognitionContext";
import {FaVolumeHigh} from "react-icons/fa6";

export default function Home() {
    const {montserrat} = useFont();
    const {command, payload, speak} = useContext(SpeechRecognitionContext);
    const [introDone, setShowIntroDone] = useState(false);
    const [honeySaid, setHoneySaid] = useState(false);
    const router = useRouter();

    router.push('/desktop');

    useEffect(() => {
        const lowerCasePayload = payload.toLowerCase();
        if (introDone && lowerCasePayload.includes("good day honey") || lowerCasePayload.includes("good morning honey") ||
            lowerCasePayload.includes("good afternoon honey")) {
            speak("Welcome honey!");
            setInterval(() => {
                router.push("/desktop");
            }, 3000);
            setHoneySaid(true);
        }
    }, [payload]);

    useEffect(() => {
        router.push('/desktop');
        setInterval(() => {
            setShowIntroDone(true);
        }, 15000);
    }, []);

    return (
        <div className={`${montserrat.className} min-h-screen flex items-center justify-center bg-purple-900 relative`}>
            {introDone && <FaVolumeHigh className={'absolute z-20 top-10 left-10 text-white animate-pulse'} size={50}/>}
            <div
                className={`absolute z-20 top-[15%] text-white text-[30px] transition-opacity ${introDone && honeySaid ? 'opacity-100' : 'opacity-0'}`}>
                Welcome Honey!
            </div>
            <video
                onEnded={(e) => {
                    e.currentTarget.currentTime = 25;
                    e.currentTarget.play();
                }}
                autoPlay
                className={'absolute z-10 w-full h-auto'}
                onDoubleClick={() => router.push("/desktop")}
            >
                <source src="intro.mp4" type="video/mp4"/>
            </video>
            <audio autoPlay>
                <source src="intro.mp3" type="audio/mpeg"/>
            </audio>
            {/*<Image*/}
            {/*    src="/loginbackground.jpg"*/}
            {/*    alt="Login background"*/}
            {/*    layout="fill"*/}
            {/*    objectFit="cover"*/}
            {/*    quality={100}*/}
            {/*/>*/}

            {/*<div>*/}
            {/*    className="bg-white min-w-[360px] min-h-[300px] bg-opacity-70 p-8 rounded-lg shadow-lg relative items-center justify-center flex flex-col">*/}
            {/*  <div className="relative inset-0 flex items-center justify-center p-2">*/}
            {/*    <Image*/}
            {/*        src="/usericon.png"*/}
            {/*        alt="User Icon"*/}
            {/*        width={70}*/}
            {/*        height={70}*/}
            {/*    />*/}
            {/*  </div>*/}

            {/*<div className="text-black flex items-center justify-center">*/}
            {/*  {!loginCommandEntered ? (*/}
            {/*      <div className="text-center">*/}
            {/*        <p className="mb-4">Say "Good day, honey" to login</p>*/}
            {/*        <button*/}
            {/*            className="text-black bg-slate-500 justify-center px-3 py-2 rounded-md hover:cursor-pointer hover:bg-slate-600"*/}
            {/*            onClick={handleLoginClick}>Log in*/}
            {/*        </button>*/}
            {/*      </div>*/}
            {/*  ) : (*/}
            {/*      <div className="text-center text-[25px]">*/}
            {/*        <p>Welcome, honey!</p>*/}
            {/*        <div className="flex items-center justify-center">*/}
            {/*          <Image src="/loading.gif" alt="Loading" width={100} height={100}/>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*  )}*/}
            {/*</div>*/}
            {/*</div>*/}
        </div>
    );
}
