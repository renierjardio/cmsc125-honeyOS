import React, {useContext, useEffect, useRef, useState} from 'react';
import {WindowProps} from "@/app/types";
import {SetFocus} from "@/app/desktop/programOpener";
import useFont from "@/hooks/useFont";
import {OpenedWindowsContext} from "@/app/context/openedWindowsContext";
import {Process, SchedulerContext} from "@/app/context/schedulerContext";

type IIDS = {
    [key: string]: string;
}
export default function WindowScreen({name, children, icon, windowIndex, customName, onClose}: WindowProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    // const [position, setPosition] = useState({x: window.innerWidth / 4, y: window.innerHeight / 4});
    const [position, setPosition] = useState({x: 0, y: window.innerHeight / 4});
    const [offset, setOffset] = useState({x: 0, y: 0});
    const {openedWindows, setOpenedWindows} = useContext(OpenedWindowsContext);
    const IDS: IIDS = {
        Note: 'JEM21',
        Settings: 'KDC23',
        Camera: 'DCP22',
        File_Manager: 'DMM21',
        Spotify: 'JAR21',
        Chess: 'RR25',
    };
    const {
        setReadyProcesses,
        readyProcesses,
        waitingRef,
        waitProcesses,
        setWaitProcesses,
        arrivalTime
    } = useContext(SchedulerContext)
    const {montserrat} = useFont();

    useEffect(() => {
        name && setReadyProcesses((prev) => {
            const newProcess: Process = {
                process_id: IDS[name.replace(' ', '_')],
                name: name,
                status: 1,
                burstTime: Math.ceil((Math.random() * 10 % 5)),
                waitTime: 0,
                arrivalTime: arrivalTime,
                priority: Math.ceil((Math.random() * 100 % 10)),
                memory: Math.ceil((Math.random() * 450000) + 50000),
            }
            return [...prev, newProcess];
        })

        if (dialogRef.current) dialogRef.current.showModal();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenedWindows(prevState => {
                    prevState[windowIndex].maximized = false;
                    return [...prevState];
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            setReadyProcesses(prev => {
                return prev.filter((_, index) => _.name !== name);
            })
            setWaitProcesses(prev => {
                return prev.filter((_, index) => _.name !== name);
            })
        };
    }, [/* onClose */]);

    useEffect(() => {
        if(waitProcesses.length === 0) return;
        const interval: NodeJS.Timeout = setTimeout(() => {
            waitProcesses.forEach((process, index) => {
                if(process.name === name) {
                    setWaitProcesses(prev => {
                        if(prev.length === 0) return [];
                        if(prev[index] == undefined) return prev;
                        if (prev[index].waitTime <= 0.1) {
                            prev[index].waitTime = 0;
                            prev[index].burstTime = Math.ceil((Math.random() * 10 % 5));
                            prev[index].status = 1;
                            prev[index].arrivalTime = arrivalTime;
                            prev[index].priority = Math.ceil((Math.random() * 100 % 10));
                            setReadyProcesses(prevReady => {
                                return [...prevReady, prev[index]];
                            });
                            clearInterval(interval);
                            return prev.filter((_, i) => i !== index);
                        }
                        prev[index].waitTime -= 0.1;
                        return [...prev];
                    })
                }
            })
        }, 100);
        return () => clearInterval(interval);
    }, [waitProcesses]);

    const handleMouseDown = (event: React.MouseEvent) => {
        setIsDragging(true);
        setOffset({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };
    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const closeThisWindow = () => {
        if (onClose && !onClose()) return;
        setOpenedWindows(prevState => {
            prevState[windowIndex].html = null;
            prevState[windowIndex].focused = false;
            prevState[windowIndex].minimized = false;
            prevState[windowIndex].maximized = false;
            return [...prevState];
        })
    }

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div id={name}
             className={`${openedWindows[windowIndex].maximized ? 'w-full h-[100vh]' : 'w-auto h-auto'} rounded-xl
            ${openedWindows[windowIndex].focused ? 'z-50 border-2 border-yellow-500 shadow-lg bg-primary' : 'z-10 ' +
                 'opacity-80 bg-primary/40 blur-none backdrop-blur-sm'}`}
             style={{
                 position: 'absolute',
                 left: openedWindows[windowIndex].maximized ? 0 : `${position.x}px`,
                 top: openedWindows[windowIndex].maximized ? 0 : `${position.y}px`,
                 display: openedWindows[windowIndex].minimized ? 'none' : 'block',
                 pointerEvents: 'auto',
                 transition: 'opacity 0.2s, height 0.2s',
             }}
             onClick={() => name && SetFocus(windowIndex, setOpenedWindows)}>
            <div className={`${openedWindows[windowIndex].maximized ? 'w-full h-full' : 'w-[50vw] h-[50vh]'} bg-white 
                text-black p-0 m-0 border-primary relative rounded-lg`}>
                <div className="relative w-full h-full">
                    {children}
                </div>
                <div className={`flex justify-between items-center text-white modal-action bg-primary absolute bottom-0 
                w-full h-[5vh] select-none rounded-b-lg`}
                     onMouseDown={handleMouseDown}>
          <span className="pl-[1vw] flex flex-row space-x-3">
            {icon} {<p className={`text-md ${montserrat.className}`}>{customName ? customName : name}</p>}
          </span>
                <div className="flex space-x-2 items-center pr-[1vw] text-black">
                    <button className="w-[3vh] h-[3vh] rounded-full bg-green-700 text-center p-2 text-gray-900"
                            onClick={() => {
                                setOpenedWindows(prevState => {
                                    prevState[windowIndex].minimized = true;
                                    prevState[windowIndex].maximized = false;
                                    prevState[windowIndex].focused = false;
                                    return [...prevState];
                                });
                            }}>
                    </button>
                    <button className="w-[3vh] h-[3vh] rounded-full bg-yellow-300 text-center p-2 text-gray-900"
                            onClick={() => {
                                openedWindows[windowIndex].maximized ? setOpenedWindows(prevState => {
                                    prevState[windowIndex].maximized = false;
                                    return [...prevState];
                                }) : setOpenedWindows(prevState => {
                                    prevState[windowIndex].maximized = true;
                                    return [...prevState];
                                });
                            }}>
                    </button>
                    <button className="w-[3vh] h-[3vh] rounded-full bg-red-800 text-center p-2 text-gray-900"
                            onClick={closeThisWindow}>
                    </button>
                </div>
                </div>
            </div>
        </div>
    )
}
