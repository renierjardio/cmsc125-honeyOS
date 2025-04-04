import { useContext, useEffect, useState } from "react";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import { Process, SchedulerContext } from "../context/schedulerContext";
import { SchedulerProviderProps } from "../context/schedulerContext";
import useFont from "@/hooks/useFont";

export default function Manager() {
    const {
        readyProcesses, setReadyProcesses,
        waitProcesses,
        FCFS,
        SJF,
        PRIORITY,
        ROUND_ROBIN,
        schedulerMode,
        timer,
        setSchedulerMode,
        arrivalTime,
        quantum
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
        <div className={`font-consolas relative text-white ml-[5vw] mt-[5vh] bg-black/40 blur-none backdrop-blur-sm w-[40vw] h-[50vh]`}>
            <div className="text-lg font-bold mb-4 p-[2vh]">
                TASK MANAGER {arrivalTime.toFixed(2)}
            </div>
            <div className="flex flex-row space-x-3 mb-4 ml-4">
                <button
                    className={`${schedulerMode === 1 ? 'bg-yellow-300' : 'bg-indigo-400'} px-3 py-1 rounded-lg shadow-md`}
                    onClick={() => setSchedulerMode(1)}>
                    FCFS
                </button>
                <button
                    className={`${schedulerMode === 2 ? 'bg-yellow-300' : 'bg-indigo-400'} px-3 py-1 rounded-lg shadow-md`}
                    onClick={() => setSchedulerMode(2)}>
                    SJF
                </button>
                <button
                    className={`${schedulerMode === 3 ? 'bg-yellow-300' : 'bg-indigo-400'} px-3 py-1 rounded-lg shadow-md`}
                    onClick={() => setSchedulerMode(3)}>
                    PRIORITY
                </button>
                <button
                    className={`${schedulerMode === 4 ? 'bg-yellow-300' : 'bg-indigo-400'} px-3 py-1 rounded-lg shadow-md`}
                    onClick={() => setSchedulerMode(4)}>
                    ROUND ROBIN Q={quantum.toFixed(1)}
                </button>
            </div>
            <div className="overflow-auto max-h-[35vh] mb-4">
                <table className="table-auto w-full text-xs">
                    <thead className="bg-gray-700 text-white">
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
                    <tbody className="bg-gray-800 text-gray-200">
                        {readyProcesses && readyProcesses.map((process: Process, index: number) => {
                            return (
                            <tr key={index} className={`${process.status === 2 && 'bg-green-500'}`}>
                                <td className="px-2 py-1">{process.process_id}</td>
                                <td className="px-2 py-1">{process.priority}</td>
                                <td className="px-2 py-1">{process.name}</td>
                                <td className="px-2 py-1">{process.burstTime.toFixed(2)}s</td>
                                <td className="px-2 py-1">{(process.memory / 1000).toFixed(1)}MB</td>
                                <td className="px-2 py-1">{process.arrivalTime.toFixed(2)}</td>
                                <td className="px-2 py-1">{process.status === 1 ? 'Ready' : 'Running'}</td>
                            </tr>
                        )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="overflow-auto max-h-[30vh]">
                <table className="table-auto w-full text-xs">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="px-2 py-1">Name</th>
                            <th className="px-2 py-1">Wait Process</th>
                            <th className="px-2 py-1">Waiting Time</th>
                            <th className="px-2 py-1">Memory</th>
                            <th className="px-2 py-1">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 text-gray-200">
                        {waitProcesses.map((process: Process, index: number) => (
                            <tr key={index}>
                                <td className="px-2 py-1">{process.name}</td>
                                <td className="px-2 py-1">I/O</td>
                                <td className="px-2 py-1">{process.waitTime.toFixed(2)}s</td>
                                <td className="px-2 py-1">{(process.memory / 1000).toFixed(1)}MB</td>
                                <td className="px-2 py-1">Waiting</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}