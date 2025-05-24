import { useContext, useEffect, useState } from "react";
import { Process, SchedulerContext } from "../context/schedulerContext";
import WindowScreen from "../desktop/components/window";
import Icon from "@mdi/react";
import { mdiCalendarClock } from "@mdi/js";
import { SchedulerProviderProps } from "../context/schedulerContext";
import useFont from "@/hooks/useFont";
import { WindowProps } from "../types";

export default function Manager({ windowIndex }: WindowProps) {
  const {
    readyProcesses,
    setReadyProcesses,
    waitProcesses,
    FCFS,
    SJF,
    PRIORITY,
    ROUND_ROBIN,
    schedulerMode,
    timer,
    setSchedulerMode,
    arrivalTime,
    quantum,
  } = useContext(SchedulerContext);

  useEffect(() => {
    setReadyProcesses((prev) => {
      prev.forEach((process) => {
        process.status = 1;
      });
      return prev;
    });

    if (schedulerMode === 1) FCFS();
    else if (schedulerMode === 2) SJF();
    else if (schedulerMode === 3) PRIORITY();
    else if (schedulerMode === 4) ROUND_ROBIN();

    return () => clearInterval(timer.current);
  }, [schedulerMode]);

  return (
    <WindowScreen
      name="Scheduler & Page Replacement"
      windowIndex={windowIndex}
      icon={<Icon path={mdiCalendarClock} size={1} color={"yellow"} />}
    >
      <div
        className={`relative text-[#743D31] mx-[0.5%] w-[99.1%] h-full justify-content-center overflow-hidden`}
      >
        <div className="flex flex-row pt-[4vh] pl-[3vh] pb-[1vh] space-x-3 items-center">
          <div className="text-4xl font-bold">TASK MANAGER</div>
          <div className="flex flex-col">
            <div className="text-xs font-semibold mb-[-5px]">Running Time:</div>
            <div className="text-lg">{arrivalTime.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex flex-row space-x-3 mb-4 ml-5">
          <button
            text-sm
            className={`${
              schedulerMode === 1 ? "bg-yellow-300" : "bg-[#F6D69A]"
            } px-2 rounded-sm border-2 border-[#743D31] shadow-md`}
            onClick={() => setSchedulerMode(1)}
          >
            FCFS
          </button>
          <button
            className={`${
              schedulerMode === 2 ? "bg-yellow-300" : "bg-[#F6D69A]"
            } px-2 rounded-sm border-2 border-[#743D31] shadow-md`}
            onClick={() => setSchedulerMode(2)}
          >
            SJF
          </button>
          <button
            className={`${
              schedulerMode === 3 ? "bg-yellow-300" : "bg-[#F6D69A]"
            } px-2 rounded-sm border-2 border-[#743D31] shadow-md`}
            onClick={() => setSchedulerMode(3)}
          >
            Priority
          </button>
          <button
            className={`${
              schedulerMode === 4 ? "bg-yellow-300" : "bg-[#F6D69A]"
            } px-2 rounded-sm border-2 border-[#743D31] shadow-md`}
            onClick={() => setSchedulerMode(4)}
          >
            RoundRobin Q={quantum.toFixed(1)}
          </button>
        </div>
        <div className="overflow-auto max-h-[35vh] mb-4">
          <table className="table-auto w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Priority</th>
                <th className="px-2 py-1">Name</th>
                <th className="px-2 py-1">Burst</th>
                <th className="px-2 py-1">Memory</th>
                <th className="px-2 py-1">Arrival</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody className="bg-black/40 blur-none backdrop-blur-sm text-white">
              {readyProcesses &&
                readyProcesses.map((process: Process, index: number) => {
                  return (
                    <tr
                      key={index}
                      className={`${process.status === 2 && "bg-green-500"}`}
                    >
                      <td className="px-2 pl-4 py-1">{process.process_id}</td>
                      <td className="px-2 pl-8 py-1">{process.priority}</td>
                      <td className="px-2 pl-8 py-1">{process.name}</td>
                      <td className="px-2 py-1">
                        {process.burstTime.toFixed(2)}s
                      </td>
                      <td className="pl-2 py-1">
                        {(process.memory / 1000).toFixed(1)}MB
                      </td>
                      <td className="pl-4 py-1">
                        {process.arrivalTime.toFixed(2)}
                      </td>
                      <td className="pl-2 py-1">
                        {process.status === 1 ? "Ready" : "Running"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="overflow-auto max-h-[30vh]">
          <table className="table-auto w-full text-xs">
            <thead>
              <tr>
                <th className="py-1">Name</th>
                <th className="py-1">Wait Process</th>
                <th className="py-1">Waiting Time</th>
                <th className="py-1">Memory</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody className="bg-black/40 blur-none backdrop-blur-sm text-white">
              {waitProcesses.map((process: Process, index: number) => (
                <tr key={index}>
                  <td className="pl-4 py-1">{process.name}</td>
                  <td className="pl-8 py-1">I/O</td>
                  <td className="pl-8 py-1">{process.waitTime.toFixed(2)}s</td>
                  <td className="pl-4 py-1">
                    {(process.memory / 1000).toFixed(1)}MB
                  </td>
                  <td className="pl-4 py-1">Waiting</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WindowScreen>
  );
}
