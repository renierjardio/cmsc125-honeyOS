"use client";

import {
  OpenSpotify,
  OpenChess,
  OpenCamera,
  OpenFileManager,
  OpenNote,
  OpenSchedManager,
  OpenMemoryManager,
  closeWindow,
  OpenVoice,
} from "@/app/desktop/programOpener";

import WindowScreen from "../desktop/components/window";
import React, { useState, useContext } from "react";
import Image from "next/image";
import { WindowProps } from "@/app/types";
import { FaMicrophone } from "react-icons/fa";
import { Waveform } from "../desktop/components/waveform";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import { SchedulerContext } from "@/app/context/schedulerContext";
import { MemoryManagerContext } from "../context/memoryManagerContext";
import { appWindow } from "@tauri-apps/api/window";
import { AlgoType } from "../context/memoryManagerContext";
import { CameraContext } from "../context/cameraContext";

type SpeechRecognitionResultEvent = {
  results: SpeechRecognitionResultList;
};

export default function Voice_Program({ windowIndex }: WindowProps) {
  const [userSpeech, setUserSpeech] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const { openedWindows, setOpenedWindows } = useContext(OpenedWindowsContext);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const programNameMap: Record<string, string> = {
    note: "Note",
    spotify: "Spotify",
    chess: "Chess",
    camera: "Camera",
    "file manager": "File Manager",
    "scheduler manager": "Scheduler Manager",
    "memory manager": "Memory Manager",
    "voice program": "Voice Program",
  };

  const programAliases: Record<string, string[]> = {
    note: ["note", "notes", "notepad", "text editor"],
    spotify: ["spotify", "music"],
    chess: ["chess", "game"],
    camera: ["camera", "cam"],
    "file manager": ["filemanager", "files", "explorer"],
    "scheduler manager": ["schedule", "scheduler", "scheduler manager"],
    "memory manager": ["memory", "ram", "memory manager"],
    "voice program": ["voice program", "voice", "voice command"],
  };

  const resolveProgramKey = (input: string): string | null => {
    const normalizedInput = normalize(input);
    for (const [key, aliases] of Object.entries(programAliases)) {
      if (aliases.some((alias) => normalize(alias) === normalizedInput)) {
        return key;
      }
    }
    return null;
  };

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

  const openProgramByName = (input: string) => {
    const resolved = resolveProgramKey(input);
    if (!resolved) {
      speak(`Sorry, I don't know how to open ${input}.`);
      return;
    }

    switch (resolved) {
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
      case "note":
        OpenNote({ openedWindows, setOpenedWindows });
        break;
      case "scheduler manager":
        OpenSchedManager({ openedWindows, setOpenedWindows });
        break;
      case "memory manager":
        OpenMemoryManager({ openedWindows, setOpenedWindows });
        break;
      case "voice program":
        OpenVoice({ openedWindows, setOpenedWindows });
        break;
      default:
        speak(`Sorry, I don't know how to open ${input}.`);
    }
  };

  const schedulerMap: Record<string, string> = {
    "first come first serve": "fcfs",
    fcfs: "fcfs",
    "shortest job first": "sjf",
    sjf: "sjf",
    priority: "priority",
    "round robin": "rr",
    rr: "rr",
  };

  const memoryAlgoMap: Record<string, string> = {
    "first in first out": "fifo",
    fifo: "fifo",
    "least recently used": "lru",
    lru: "lru",
    optimal: "optimal",
  };

  const { setSchedulerMode, schedulerMode, FCFS, SJF, PRIORITY, ROUND_ROBIN } =
    useContext(SchedulerContext);
  const { simulateAlgorithm, setSelectedAlgo } =
    useContext(MemoryManagerContext);

  const { captureImage } = useContext(CameraContext);

  const handleSpeechCommand = (transcript: string) => {
    setUserSpeech(transcript);
    const lower = transcript.toLowerCase().trim();

    const match = lower.match(
      /^honey[,]?\s*(open|close|shut|maximize|restore|minimize)\s+(.+?)\s*,?\s*please\.?$/
    );

    if (match && match[1] && match[2]) {
      const action = match[1];
      const command = match[2].trim().toLowerCase();

      if (action === "shut" && command === "down") {
        speak("Shutting down. See you soon, honey sugar plum. Goodbye, honey.");
        setTimeout(() => {
          appWindow.close();
        }, 10500);
        return;
      }

      const resolved = resolveProgramKey(command);
      if (!resolved) {
        speak(`I couldn't recognize the program: ${command}`);
        return;
      }
      const resolvedName = programNameMap[resolved];

      if (action === "open") {
        const index = openedWindows.findIndex(
          (w) => w.name === resolvedName && w.html === null
        );

        if (index !== -1) {
          speak(`Opening ${command}`);
          openProgramByName(command);
        } else {
          speak(`${command} is already currently open.`);
        }
      } else if (action === "close") {
        const index = openedWindows.findIndex(
          (w) => w.name === resolvedName && w.html !== null
        );

        if (index !== -1) {
          speak(`Closing the ${openedWindows[index].name} window.`);
          closeWindow(openedWindows, setOpenedWindows, index);
        } else {
          speak(`${command} is not currently open.`);
        }
      } else if (action === "maximize") {
        const index = openedWindows.findIndex(
          (w) => w.name === resolvedName && w.html !== null
        );

        if (index !== -1) {
          const win = openedWindows[index];
          if (!win.maximized && !win.minimized) {
            speak(`${win.name} is already restored.`);
          } else {
            const updated = [...openedWindows];
            updated[index] = {
              ...win,
              maximized: false,
              minimized: false,
            };
            setOpenedWindows(updated);
            speak(`Restoring ${win.name}.`);
          }
        } else {
          speak(`${command} is not currently open.`);
        }
      } else if (action === "restore") {
        const index = openedWindows.findIndex(
          (w) => w.name === resolvedName && w.html !== null
        );

        if (index !== -1) {
          if (!openedWindows[index].maximized) {
            speak(`${openedWindows[index].name} is already restored.`);
          } else {
            const updated = [...openedWindows];
            updated[index] = {
              ...updated[index],
              maximized: false,
            };
            setOpenedWindows(updated);
            speak(`Restoring ${openedWindows[index].name}.`);
          }
        } else {
          speak(`${command} is not currently open.`);
        }
      } else if (action === "minimize") {
        const index = openedWindows.findIndex(
          (w) => w.name === resolvedName && w.html !== null
        );

        if (index !== -1) {
          const win = openedWindows[index];
          if (win.minimized) {
            speak(`${win.name} is already minimized.`);
          } else {
            const updated = [...openedWindows];
            updated[index] = {
              ...win,
              minimized: true,
              maximized: false,
            };
            setOpenedWindows(updated);
            speak(`Minimizing ${win.name}.`);
          }
        } else {
          speak(`${command} is not currently open.`);
        }
      }
      return;
    }

    const scheduleMatch = lower.match(
      /^honey[,]?\s*schedule\s+(.*?)\s*please\.?$/
    );

    if (scheduleMatch) {
      const method = schedulerMap[scheduleMatch[1]];
      if (method) {
        const schedManagerIndex = openedWindows.findIndex(
          (window) => window.name === "Scheduler Manager"
        );

        const isSchedManagerOpen =
          schedManagerIndex !== -1 &&
          openedWindows[schedManagerIndex].html !== null;

        if (!isSchedManagerOpen) {
          OpenSchedManager({ openedWindows, setOpenedWindows });
        }

        let mode: 1 | 2 | 3 | 4;
        switch (method) {
          case "fcfs":
            mode = 1;
            setSchedulerMode(mode);
            break;
          case "sjf":
            mode = 2;
            setSchedulerMode(mode);
            break;
          case "priority":
            mode = 3;
            setSchedulerMode(mode);
            break;
          case "rr":
            mode = 4;
            setSchedulerMode(mode);
            break;
          default:
            speak(`Scheduling method ${method} is not supported.`);
            return;
        }

        speak(`Using ${method.toUpperCase()} for scheduling.`);
      } else {
        speak(`Unknown scheduling method: ${scheduleMatch[1]}`);
      }
      return;
    }

    const memoryMatch = lower.match(
      /^honey[,]?\s*manage memory\s+(.*?)\s*please\.?$/
    );

    if (memoryMatch) {
      const algoKey = memoryMatch[1];
      const algo = memoryAlgoMap[algoKey];

      if (algo) {
        speak(`Applying ${algo.toUpperCase()} memory management.`);

        const memManagerIndex = openedWindows.findIndex(
          (window) => window.name === "Memory Manager"
        );

        const isMemManagerOpen =
          memManagerIndex !== -1 &&
          openedWindows[memManagerIndex].html !== null;

        if (!isMemManagerOpen) {
          OpenMemoryManager({ openedWindows, setOpenedWindows });
        }

        simulateAlgorithm(algo.toUpperCase() as AlgoType);
      } else {
        speak(`Unknown memory algorithm: ${algoKey}`);
      }
      return;
    }

    const takePhotoMatch = lower.match(
      /^honey[,]?\s*take a photo\s*please\.?$/
    );

    if (takePhotoMatch) {
      const cameraIndex = openedWindows.findIndex((w) => w.name === "Camera");

      const isCameraOpen =
        cameraIndex !== -1 && openedWindows[cameraIndex].html !== null;

      if (!isCameraOpen) {
        OpenCamera({ openedWindows, setOpenedWindows });
        setTimeout(() => {
          captureImage();
        }, 500); // slight delay to allow camera to initialize
      } else {
        captureImage();
      }

      speak("Say cheese! Capturing your photo.");
      return;
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
          <h1 className={`text-[45px] font-bold text-[#743D31]`}>
            Yes, honey?
          </h1>
          <p className={`text-lg text-[#743D31]`}>
            {userSpeech
              ? `You said: "${userSpeech}"`
              : "How may I help you today?"}
          </p>
        </div>
      </div>
    </WindowScreen>
  );
}
