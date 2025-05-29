"use client";

import { useEffect, useState, useContext } from "react";
import { FaDesktop } from "react-icons/fa6";
import { Process, SchedulerContext } from "../context/schedulerContext";
import WindowScreen from "../desktop/components/window";
import { WindowProps } from "../types";
import {
  MemoryManagerContext,
  AlgoType,
} from "../context/memoryManagerContext"; // adjust path if needed

const colorMap = {
  Note: "#3B4163",
  Camera: "#FFF5D1",
  "File Manager": "#F7CE72",
  Spotify: "#F77269",
  Chess: "#CF4F44",
  Scheduler: "#8E44AD",
  "Page Replacement": "#3498DB",
  "Voice Program": "#2ECC71",
};

const frameSize = 20;

export default function MemoryManager({ windowIndex }: WindowProps) {
  const { readyProcesses, waitProcesses } = useContext(SchedulerContext);

  const {
    memoryMap,
    diskMap,
    pageSequence,
    stats,
    selectedAlgo,
    setSelectedAlgo,
    setPageSequence,
    simulateAlgorithm,
  } = useContext(MemoryManagerContext);

  const [allProcesses, setAllProcesses] = useState<Process[]>([]);
  const [history, setHistory] = useState<String[]>([]);

  useEffect(() => {
    const processes = [...readyProcesses, ...waitProcesses];
    setAllProcesses(processes);

    // Generate a new random page sequence
    const generated: string[] = [];
    processes.forEach((p) => {
      const count = Math.ceil(p.memory / 50000);
      for (let i = 0; i < count; i++) {
        generated.push(p.name.toString());
      }
    });

    // Shuffle page sequence
    for (let i = generated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generated[i], generated[j]] = [generated[j], generated[i]];
    }

    setPageSequence(generated);
  }, [readyProcesses, waitProcesses, setPageSequence]);

  // Automatically simulate on page sequence update
  useEffect(() => {
    if (selectedAlgo && pageSequence.length > 0) {
      simulateAlgorithm(selectedAlgo);
    } else if (pageSequence.length > 0 && !selectedAlgo) {
      // Default to FIFO on first run
      setSelectedAlgo("FIFO");
      simulateAlgorithm("FIFO");
    }
  }, [pageSequence, selectedAlgo, setSelectedAlgo, simulateAlgorithm]);

  // LRU history tracking (remains local)
  useEffect(() => {
    const activeProcessNames = new Set(allProcesses.map((p) => p.name));
    readyProcesses.forEach((p) => {
      if (p.status === 2 && p.burstTime > 0) {
        setHistory((prev) => {
          const filtered = prev.filter((n) => n !== p.name);
          return [...filtered, p.name];
        });
      }
    });

    setHistory((prev) => prev.filter((n) => activeProcessNames.has(n)));
  }, [allProcesses, readyProcesses]);

  return (
    <WindowScreen
      name="Page Replacement"
      windowIndex={windowIndex}
      icon={<FaDesktop size={25} color={"yellow"} />}
    >
      <div className="relative text-[#743D31] absolute w-full h-full flex flex-col pl-4 pt-8">
        <div className="text-4xl font-extrabold pl-4">
          VIRTUAL MEMORY MANAGEMENT
        </div>

        <div className="flex flex-row space-x-3 mb-4 ml-5">
          <div className="text-lg font-semibold pt-2 pb-2">
            Select Algorithm:
          </div>
          <div className="flex space-x-4 items-center">
            {["FIFO", "LRU", "OPT"].map((algo) => (
              <button
                key={algo}
                onClick={() => simulateAlgorithm(algo as AlgoType)}
                className={`px-2 rounded-sm border-2 border-[#743D31] shadow-md text-[#743D31] font-semibold ${
                  selectedAlgo === algo ? "bg-yellow-300" : "bg-[#F6D69A]"
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        <div className="text-md pb-2">
          <strong>Selected:</strong> {selectedAlgo || "None"} <br />
          <strong>Page Faults:</strong> {stats.faults} &nbsp;
          <strong>Hits:</strong> {stats.hits} &nbsp;
          <strong>Hit Rate:</strong> {stats.rate}%
        </div>

        <div className="text-xl font-semibold py-2">RAM:</div>
        <div className="flex pb-2">
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
