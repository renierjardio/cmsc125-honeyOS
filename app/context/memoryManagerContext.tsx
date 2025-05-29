"use client";

import React, { createContext, useRef, useState, useEffect } from "react";

export type AlgoType = "FIFO" | "LRU" | "OPT" | "";

export type MemoryManagerProviderProps = {
  memoryMap: string[];
  setMemoryMap: React.Dispatch<React.SetStateAction<string[]>>;
  diskMap: string[];
  setDiskMap: React.Dispatch<React.SetStateAction<string[]>>;
  stats: { hits: number; faults: number; rate: number };
  setStats: React.Dispatch<
    React.SetStateAction<{ hits: number; faults: number; rate: number }>
  >;
  selectedAlgo: AlgoType;
  setSelectedAlgo: React.Dispatch<React.SetStateAction<AlgoType>>;
  pageSequence: string[];
  setPageSequence: React.Dispatch<React.SetStateAction<string[]>>;
  simulateAlgorithm: (algo: AlgoType) => void;
  // Add refs if you want to expose them for advanced usage like SchedulerProvider does
  memoryMapRef: React.MutableRefObject<string[]>;
  diskMapRef: React.MutableRefObject<string[]>;
  pageSequenceRef: React.MutableRefObject<string[]>;
  statsRef: React.MutableRefObject<{
    hits: number;
    faults: number;
    rate: number;
  }>;
  selectedAlgoRef: React.MutableRefObject<AlgoType>;
};

export const MemoryManagerContext = createContext<MemoryManagerProviderProps>({
  memoryMap: [],
  setMemoryMap: () => {},
  diskMap: [],
  setDiskMap: () => {},
  stats: { hits: 0, faults: 0, rate: 0 },
  setStats: () => {},
  selectedAlgo: "",
  setSelectedAlgo: () => {},
  pageSequence: [],
  setPageSequence: () => {},
  simulateAlgorithm: () => {},
  memoryMapRef: { current: [] },
  diskMapRef: { current: [] },
  pageSequenceRef: { current: [] },
  statsRef: { current: { hits: 0, faults: 0, rate: 0 } },
  selectedAlgoRef: { current: "" },
});

export default function MemoryManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const frameSize = 20;

  const [memoryMap, setMemoryMap] = useState<string[]>(
    new Array(frameSize).fill("")
  );
  const [diskMap, setDiskMap] = useState<string[]>([]);
  const [pageSequence, setPageSequence] = useState<string[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoType>("");
  const [stats, setStats] = useState({ hits: 0, faults: 0, rate: 0 });

  // Mutable refs to mirror state for advanced usages, if needed
  const memoryMapRef = useRef(memoryMap);
  const diskMapRef = useRef(diskMap);
  const pageSequenceRef = useRef(pageSequence);
  const statsRef = useRef(stats);
  const selectedAlgoRef = useRef(selectedAlgo);

  // Sync refs with state
  useEffect(() => {
    memoryMapRef.current = memoryMap;
  }, [memoryMap]);

  useEffect(() => {
    diskMapRef.current = diskMap;
  }, [diskMap]);

  useEffect(() => {
    pageSequenceRef.current = pageSequence;
  }, [pageSequence]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    selectedAlgoRef.current = selectedAlgo;
  }, [selectedAlgo]);

  const simulateAlgorithm = (algo: AlgoType) => {
    const frames: string[] = [];
    const queue: string[] = [];
    const recent: string[] = [];
    let faults = 0;
    let hits = 0;

    const futureRefs = [...pageSequenceRef.current];

    for (let i = 0; i < pageSequenceRef.current.length; i++) {
      const page = pageSequenceRef.current[i];

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

    const hitRate = ((hits / pageSequenceRef.current.length) * 100).toFixed(2);
    setMemoryMap([...frames, ...new Array(frameSize - frames.length).fill("")]);
    setDiskMap(
      pageSequenceRef.current
        .filter((p) => !frames.includes(p))
        .filter((v, i, a) => a.indexOf(v) === i)
    );
    setStats({ hits, faults, rate: parseFloat(hitRate) });
    setSelectedAlgo(algo);
  };

  return (
    <MemoryManagerContext.Provider
      value={{
        memoryMap,
        setMemoryMap,
        diskMap,
        setDiskMap,
        stats,
        setStats,
        selectedAlgo,
        setSelectedAlgo,
        pageSequence,
        setPageSequence,
        simulateAlgorithm,
        memoryMapRef,
        diskMapRef,
        pageSequenceRef,
        statsRef,
        selectedAlgoRef,
      }}
    >
      {children}
    </MemoryManagerContext.Provider>
  );
}
