import { useEffect, useState, useContext } from "react";
import { FaDesktop } from "react-icons/fa6";
import { Process, SchedulerContext } from "../context/schedulerContext";
import WindowScreen from "../desktop/components/window";
import { WindowProps } from "../types";

const colorMap = {
  Note: "#3B4163",
  Camera: "#FFF5D1",
  "File Manager": "#F7CE72",
  Spotify: "#F77269",
  Chess: "#CF4F44",
  Scheduler: "#8E44AD",
  "Page Replacement": "#3498DB",
};

export default function MemoryManager({ windowIndex }: WindowProps) {
  const { readyProcesses, waitProcesses } = useContext(SchedulerContext);

  const [allProcesses, setAllProcesses] = useState<Process[]>([]);
  const [history, setHistory] = useState<String[]>([]);
  const [memoryMap, setMemoryMap] = useState<String[]>(new Array(20).fill(""));
  const [diskMap, setDiskMap] = useState<String[]>([]);

  useEffect(() => {
    setAllProcesses([...readyProcesses, ...waitProcesses]);
  }, [readyProcesses, waitProcesses]);

  // Update LRU History
  useEffect(() => {
    const activeProcessNames = new Set(
      [...readyProcesses, ...waitProcesses].map((p) => p.name)
    );

    readyProcesses.forEach((process: Process) => {
      if (process.status === 2 && process.burstTime > 0) {
        setHistory((prev) => {
          const filtered = prev.filter((name) => name !== process.name);
          return [...filtered, process.name]; // Move to end (most recently used)
        });
      }
    });

    setHistory((prev) => prev.filter((name) => activeProcessNames.has(name)));
  }, [allProcesses]);

  // Page Allocation & LRU Page Replacement
  useEffect(() => {
    let updatedMemoryMap = [...memoryMap];
    let updatedDiskMap = [...diskMap];

    // Cleanup: Remove pages of terminated processes
    updatedMemoryMap = updatedMemoryMap.map((page) =>
      allProcesses.some((p) => p.name === page) ? page : ""
    );
    updatedDiskMap = updatedDiskMap.filter((name) =>
      allProcesses.some((p) => p.name === name)
    );

    allProcesses.forEach((process: Process) => {
      const requiredPages = Math.ceil(process.memory / 50000);
      const currentInRAM = updatedMemoryMap.filter(
        (p) => p === process.name
      ).length;
      let pagesNeeded = requiredPages - currentInRAM;

      // First pass: Load into empty pages
      for (let i = 0; i < updatedMemoryMap.length && pagesNeeded > 0; i++) {
        if (updatedMemoryMap[i] === "") {
          updatedMemoryMap[i] = process.name;
          pagesNeeded--;
        }
      }

      // Second pass: LRU Replacement if still needed and RUNNING
      if (pagesNeeded > 0 && process.status === 2 && process.burstTime > 0) {
        for (let i = 0; i < history.length && pagesNeeded > 0; i++) {
          const oldProcess = history[i];
          if (oldProcess === process.name) continue; // Don't replace own pages

          for (let j = 0; j < updatedMemoryMap.length && pagesNeeded > 0; j++) {
            if (updatedMemoryMap[j] === oldProcess) {
              updatedMemoryMap[j] = process.name;
              updatedDiskMap.push(oldProcess);
              pagesNeeded--;
            }
          }
        }
      }

      // If still not in memory, push to disk
      const currentOnDisk = updatedDiskMap.filter(
        (name) => name === process.name
      ).length;
      for (let i = 0; i < pagesNeeded - currentOnDisk; i++) {
        updatedDiskMap.push(process.name);
      }

      // Remove duplicates and ensure no unnecessary disk copies
      if (process.status === 2 && process.burstTime > 0) {
        updatedDiskMap = updatedDiskMap.filter((name) => name !== process.name);
      }
    });

    // Final clean-up and state update
    setMemoryMap(updatedMemoryMap);
    setDiskMap(updatedDiskMap.filter((name) => name !== ""));
  }, [allProcesses, history]);

  return (
    <WindowScreen
      name="Page Replacement"
      windowIndex={windowIndex}
      icon={<FaDesktop size={25} color={"yellow"} />}
    >
      <div className="relative text-[#743D31] absolute w-full h-full flex flex-col pl-4">
        <div className="text-4xl font-extrabold pt-6">
          VIRTUAL MEMORY MANAGEMENT
        </div>

        <div className="text-xl font-semibold pt-2 pb-4">
          HISTORY:{" "}
          <span className="text-sm font-normal text-[#2C3E50]">
            {history.join(" → ")}
          </span>
        </div>

        <div className="text-xl font-semibold py-2">RAM:</div>
        <div className="flex pb-6">
          {memoryMap.map((processName, index) => (
            <div
              key={index}
              className="inline-block h-[3vh] w-[2.2vw] mr-[2px]"
              style={{
                backgroundColor: processName
                  ? colorMap[processName.toString() as keyof typeof colorMap]
                  : "transparent",
                border: "2px solid #743D31",
              }}
              title={processName ? processName.toString() : "Empty Page"}
            />
          ))}
        </div>

        <div className="text-xl font-semibold py-2">DISK:</div>
        <div className="flex">
          {diskMap.map((processName, index) => (
            <div
              key={index}
              className="inline-block h-[3vh] w-[2.2vw] mr-[2px]"
              style={{
                backgroundColor:
                  colorMap[processName.toString() as keyof typeof colorMap],
                border: "2px solid #743D31",
              }}
              title={processName ? processName.toString() : "Empty Page"}
            />
          ))}
        </div>
      </div>
    </WindowScreen>
  );
}
