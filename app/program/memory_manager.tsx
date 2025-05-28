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
  "Voice Program": "#2ECC71",
};

const frameSize = 20;

export default function MemoryManager({ windowIndex }: WindowProps) {
  const { readyProcesses, waitProcesses } = useContext(SchedulerContext);

  const [allProcesses, setAllProcesses] = useState<Process[]>([]);
  const [history, setHistory] = useState<String[]>([]);
  const [memoryMap, setMemoryMap] = useState<String[]>(new Array(20).fill(""));
  const [diskMap, setDiskMap] = useState<String[]>([]);
  const [pageSequence, setPageSequence] = useState<string[]>([]);
  const [stats, setStats] = useState({ hits: 0, faults: 0, rate: 0 });
  const [selectedAlgo, setSelectedAlgo] = useState<"FIFO" | "LRU" | "OPT" | "">(
    ""
  );

  useEffect(() => {
    const processes = [...readyProcesses, ...waitProcesses];
    setAllProcesses(processes);

    // Generate a new random sequence
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
  }, [readyProcesses, waitProcesses]);

  // Automatically simulate on page sequence update
  useEffect(() => {
    if (selectedAlgo && pageSequence.length > 0) {
      simulateAlgorithm(selectedAlgo);
    } else if (pageSequence.length > 0 && !selectedAlgo) {
      // Default to FIFO on first run
      setSelectedAlgo("FIFO");
      simulateAlgorithm("FIFO");
    }
  }, [pageSequence]);

  // LRU history tracking
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
  }, [allProcesses]);

  const simulateAlgorithm = (algo: "FIFO" | "LRU" | "OPT") => {
    const frames: string[] = [];
    const queue: string[] = [];
    const recent: string[] = [];
    let faults = 0;
    let hits = 0;

    const futureRefs = [...pageSequence];

    for (let i = 0; i < pageSequence.length; i++) {
      const page = pageSequence[i];

      if (frames.includes(page)) {
        hits++;
        if (algo === "LRU") {
          const index = recent.indexOf(page);
          if (index !== -1) recent.splice(index, 1);
          recent.push(page);
        }
        continue;
      }

      faults++;

      if (frames.length < frameSize) {
        frames.push(page);
      } else {
        let removeIndex = 0;
        if (algo === "FIFO") {
          removeIndex = 0;
        } else if (algo === "LRU") {
          removeIndex = frames.indexOf(recent.shift()!);
        } else if (algo === "OPT") {
          const future = futureRefs.slice(i + 1);
          const indices = frames.map((p) => {
            const idx = future.indexOf(p);
            return idx === -1 ? Number.POSITIVE_INFINITY : idx;
          });
          removeIndex = indices.indexOf(Math.max(...indices));
        }
        frames.splice(removeIndex, 1);
        frames.push(page);
      }

      if (algo === "FIFO") {
        queue.push(page);
        if (queue.length > frameSize) queue.shift();
      }

      if (algo === "LRU") {
        recent.push(page);
      }
    }

    const hitRate = ((hits / pageSequence.length) * 100).toFixed(2);
    setMemoryMap([...frames, ...new Array(frameSize - frames.length).fill("")]);
    setDiskMap(
      pageSequence
        .filter((p) => !frames.includes(p))
        .filter((v, i, a) => a.indexOf(v) === i)
    );
    setStats({ hits, faults, rate: parseFloat(hitRate) });
    setSelectedAlgo(algo);
  };

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
                onClick={() => simulateAlgorithm(algo as any)}
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
