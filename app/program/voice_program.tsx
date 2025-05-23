"use client";

import {
  OpenSpotify,
  OpenChess,
  OpenSettings,
  OpenCamera,
  OpenFileManager,
  OpenNote,
} from "@/app/desktop/programOpener";

import WindowScreen from "../desktop/components/window";
import React, { useState, useContext } from "react";
import Image from "next/image";
import { WindowProps } from "@/app/types";
import { FaMicrophone } from "react-icons/fa";
import useFont from "@/hooks/useFont";
import { Waveform } from "../desktop/components/waveform";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import { appWindow } from "@tauri-apps/api/window";

type SpeechRecognitionResultEvent = {
  results: SpeechRecognitionResultList;
};

export default function Voice_Program({ windowIndex }: WindowProps) {
  const { montserrat } = useFont();
  const [userSpeech, setUserSpeech] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const { openedWindows, setOpenedWindows } = useContext(OpenedWindowsContext);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const listen = () => {
    setListening(true);
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Listening...");
    };

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
      speak(`You said: ${transcript}`);
      handleSpeechCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      speak("Sorry, I couldn't understand you.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleClick = () => {
    if (listening) return;
    speak("Hello! What are you here for?");
    const waitForSpeech = setInterval(() => {
      if (!speechSynthesis.speaking) {
        clearInterval(waitForSpeech);
        listen();
      }
    }, 100);
  };

  const openProgramByName = (program: string) => {
    const prog = program.toLowerCase();
    switch (prog) {
      case "spotify":
        OpenSpotify({ openedWindows, setOpenedWindows });
        break;
      case "chess":
        OpenChess({ openedWindows, setOpenedWindows });
        break;
      case "camera":
        OpenCamera({ openedWindows, setOpenedWindows });
        break;
      case "file manager":
        OpenFileManager({ openedWindows, setOpenedWindows });
        break;
      case "notes":
      case "note":
        OpenNote({ openedWindows, setOpenedWindows });
        break;
      default:
        speak(`Sorry, I don't know how to open ${program}.`);
    }
  };

  const handleSpeechCommand = (transcript: string) => {
    setUserSpeech(transcript);

    const lower = transcript.toLowerCase().trim();
    const match = lower.match(
      /^honey[,]?\s*(open|close|shut)\s+(.+?)\s*,?\s*please\.?$/
    );

    if (match && match[1] && match[2]) {
      const action = match[1]; // "open" or "close"
      const command = match[2].trim().toLowerCase();

      // Handle "shut down" command
      if (action === "shut" && command === "down") {
        speak("Shutting down. See you soon, honey sugar plum. Goodbye, honey.");
        setTimeout(() => {
          appWindow.close(); // closes the Tauri window
        }, 10500);
        return;
      }

      if (action === "open") {
        speak(`Opening ${command}`);
        openProgramByName(command);
      } else if (action === "close") {
        const index = openedWindows.findIndex((w) =>
          w.name.toLowerCase().includes(command)
        );

        if (index !== -1) {
          speak(
            `Closing for the window: ${openedWindows[index].name} with the index: ${index}`
          );
          setOpenedWindows((prevState) =>
            prevState.map((window, i) =>
              i === index
                ? {
                    ...window,
                    html: null,
                    focused: false,
                    minimized: false,
                    maximized: false,
                  }
                : window
            )
          );
        } else {
          speak(`${command} is not currently open.`);
        }
      }
    } else {
      speak(`Sorry, I couldn't understand: ${transcript}`);
      console.warn("Unrecognized command:", transcript);
    }
  };

  return (
    <WindowScreen
      name="Voice Program"
      windowIndex={windowIndex}
      icon={<FaMicrophone size={25} color={"yellow"} />}
    >
      <div className="flex flex-col items-center justify-center h-full w-full p-16">
        <div className="flex items-center justify-center relative w-3/4 h-auto">
          <Waveform active={listening || speaking} />
          <Image
            src={"/revisedHoneyOS/beehive_mic.png"}
            alt="Voice Program"
            className="w-[42%] h-auto relative z-10 rounded-lg hover:scale-105 hover:opacity-[90%] transition-transform duration-200 cursor-pointer"
            width={500}
            height={500}
            onClick={handleClick}
          />
        </div>

        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1
            className={`text-[45px] font-bold text-[#743D31] ${montserrat.className}`}
          >
            Yes, honey?
          </h1>
          <p className={`text-lg text-[#743D31] ${montserrat.className}`}>
            {userSpeech
              ? `You said: "${userSpeech}"`
              : "How may I help you today?"}
          </p>
        </div>
      </div>
    </WindowScreen>
  );
}
