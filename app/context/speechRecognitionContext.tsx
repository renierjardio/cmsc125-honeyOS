'use client'

import React, {createContext, useEffect, useRef, useState} from "react";
import {listen} from "@tauri-apps/api/event";

type SpeechRecognitionContextProps = {
    command: string,
    speak: (text: string) => void,
    setCommand: (command: string) => void,
    voices: SpeechSynthesisVoice[] | null,
    payload: string,
    audioContextRef: React.MutableRefObject<AudioContext | null>,
}
export const SpeechRecognitionContext = createContext<SpeechRecognitionContextProps>({
    command: "",
    speak: () => {},
    setCommand: () => {},
    voices: [],
    payload: '',
    audioContextRef: {current: null}
});
export default function SpeechRecognitionProvider({children}: {children: React.ReactNode}) {
    const [command, setCommand] = useState("");
    const [payload, setPayload] = useState<string>('');
    const audioContextRef = useRef<AudioContext | null>(null);
    const [voices, setVoice] = useState<SpeechSynthesisVoice[] | null>(null);
    useEffect(() => {
        // TRANSCRIPTION
        const unlisten = listen<string>('transcribed_text', (event) => {
            setPayload(event.payload);
            const [isCommandValid, command] = isCommand(event.payload);
            if (isCommandValid) {
                setCommand(command);
            }
        })

        const voiceTimer = setInterval(() => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length !== 0) {
                setVoice(availableVoices);
                clearInterval(voiceTimer);
            }
        }, 200);

        return () => {
            unlisten.then((unlistenFn) => unlistenFn());
            // Close the audio context when the component unmounts
            audioContextRef.current?.close();
        };
    }, []);

    function speak(text: string) {
        if(voices?.length !== 0){
            const utterance = new SpeechSynthesisUtterance(text);
            if (voices) {
                utterance.voice = voices[2];
            }
            window.speechSynthesis.speak(utterance);
        }
    }

    function isCommand(transcript: string): [boolean, string] {
        let trimmedTranscript = transcript.trim().toLowerCase().replace(/[^\w\s.]/gi, '');
        if(trimmedTranscript.at(-1) === '.') trimmedTranscript = trimmedTranscript.slice(0, -1);
        const startsWithHoney = trimmedTranscript.startsWith('honey');
        const endsWithPlease = trimmedTranscript.endsWith('please');

        if (startsWithHoney && endsWithPlease) {
            const command = trimmedTranscript.slice(5, -6).trim();
            if(command.includes('open') && command.includes('.')) {
                return [true, command.substring(5)];
            }
            if(command === "open file manager") return [true, "open file_manager"];
            if(command === "focus file manager") return [true, "focus file_manager"];
            if(command === "minimize file manager") return [true, "minimize file_manager"];
            if(command === "maximize file manager") return [true, "maximize file_manager"];
            if(command === "restore file manager") return [true, "restore file_manager"];
            if(command === "close file manager") return [true, "close file_manager"];
            return [true, command];
        }
        return [false, ''];
    }

    return <SpeechRecognitionContext.Provider value={{command, speak, payload, audioContextRef, voices, setCommand}}>{children}</SpeechRecognitionContext.Provider>
}