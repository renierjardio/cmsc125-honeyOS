import WindowScreen from "@/app/desktop/components/window";
import React, {useContext, useEffect, useState} from "react";
import useFileSystem from "@/hooks/useFileSystem";
import NewFilePopup from "../desktop/components/file_manager_popup";
import {HoneyFile, WindowProps} from "@/app/types";
import {FaFolder, FaFolderPlus} from "react-icons/fa";
import {DocumentTextIcon, EllipsisVerticalIcon, FolderIcon, PhotoIcon, TrashIcon } from "@heroicons/react/16/solid";
import {OpenNote} from "@/app/desktop/programOpener";
import {OpenedWindowsContext} from "@/app/context/openedWindowsContext";
import useFont from "@/hooks/useFont";
import {FaFileCirclePlus} from "react-icons/fa6";
import {SpeechRecognitionContext} from "@/app/context/speechRecognitionContext";
export default function FileManager({windowIndex}: WindowProps) {
    const [currentDirList, setCurrentDirList] = useState<HoneyFile[]>();
    const {listDir, honey_directory, setHoneyDirectory, exitCurrentDir, makeDir, deleteDir, deleteFile, createFile, directory, absolutePath, dataDirPath, readFile} = useFileSystem();
    const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
    const [popupType, setPopupType] = useState(""); // State to track the type of popup ("file" or "folder")
    const [showOptionsDropdownForFile, setShowOptionsDropdownForFile] = useState<number | null>(null); // State to track which file's options dropdown is open
    const {setOpenedWindows, openedWindows} = useContext(OpenedWindowsContext);
    const {command} = useContext(SpeechRecognitionContext)
    const [name, setName] = useState("");
    const {montserrat} = useFont();
    const handleOptionsButtonClick = (index: number) => {
        setShowOptionsDropdownForFile(index === showOptionsDropdownForFile ? null : index); // Toggle the dropdown for the clicked file
    };

    useEffect(() => {
        console.log("Data dir path: ", dataDirPath);
        listDir().then((data) => {
            setCurrentDirList(data);
        });
    }, [dataDirPath, absolutePath]);

    useEffect(() => {
        if(openedWindows[3].focused) {
            if(showPopup) {
                if(command.substring(0, 4) == "type") {
                    setName(command.substring(5));
                } else if(command.substring(0, 6) === "cancel") {
                    handleCancelFolder();
                    setName("");
                } else if(command.substring(0, 7) === "save") {
                    if(name.length) {
                        if(popupType === "folder") {
                            handleSaveFolder(name).then(r => {});
                        } else {
                            handleEmptyFile(name).then(r => {});
                        }
                        setName("");
                    }
                }
            } else {
                if(command.substring(0, 5) === "enter") {
                    setHoneyDirectory(command.substring(6));
                } else if(command === "exit") {
                    exitCurrentDir();
                } else if(command === "add file") {
                    handleAddFile();
                } else if(command === "add folder") {
                    handleAddFolder();
                } else if(command.includes('.')) {
                    readFile(command).then((data) => {
                        if(data.status) {
                            OpenNote(
                                {openedWindows, setOpenedWindows},
                                {
                                    name: command,
                                    content: data.content,
                                    location: directory() + "\\" +   honey_directory()
                                }
                            )
                        }
                    });
                }
            }
        }
    }, [command]);
    const handleAddFile = () => {
        setPopupType("file");
        setShowPopup(true);
    };
    
    const handleAddFolder = () => {
        setPopupType("folder");
        setShowPopup(true);
    };

    const handleSaveFolder = async (name: string) => {
        try {
            await makeDir(name);
            console.log("Folder created successfully");
            setShowPopup(false); // Close the popup after successful creation
            listDir().then((data) => {
                setCurrentDirList(data);
            });
        } catch (error) {
            console.log("Error creating folder:", error);
        }
    };

    const handleEmptyFile = async (name: string) => {
        try {
            await createFile(name + ".txt");
            console.log("File created successfully");
            setShowPopup(false);
            listDir().then((data) => {
                setCurrentDirList(data);
            })
        } catch (error) {
            console.log("Error creating file:", error);
        }
    }
    
    const handleCancelFolder = () => {
        setShowPopup(false);
    };

    const handleDelete = async (fileName: string, isDir: boolean) => {
        try{
            if (isDir) {
                // Delete directory
                await deleteDir(fileName);
            } else {
                // Delete file
                await deleteFile(fileName);
            }
            console.log(`${isDir ? 'Directory' : 'File'} "${fileName}" deleted succesfully`);
            // Refresh the directory listing after the deletion
            listDir().then((files) => {
                setCurrentDirList(files);
            });
        } catch (error) {
            console.log(`Error deleting ${isDir ? 'directory' : 'file'} "${fileName}":`, error);
        }
        setShowOptionsDropdownForFile(null);
    }

    return (
        <WindowScreen name={'File Manager'}
                      windowIndex={windowIndex}
                      icon={<FaFolder size={25} color={'yellow'}/>}>
            <div className={`${montserrat.className} p-4 flex flex-col text-yellow-100 relative h-full bg-primary rounded-lg`}>
                <div className="flex items-center space-x-2">
                    <button onClick={exitCurrentDir} className={'text-sm'}>...</button>
                    <div className="overflow-x-auto whitespace-nowrap">{honey_directory()}</div>
                    <div className={`p-2 w-fit h-fit flex flex-row space-x-1`}>
                        <button className={`h-6 px-2 py-1 rounded-lg flex flex-row space-x-1 bg-yellow-500`} onClick={handleAddFile}>
                            <FaFileCirclePlus size={15}/><p className={'text-[12px]'}>Add File</p>
                        </button>
                        <button className={`h-6 px-2 py-1 rounded-lg flex flex-row space-x-1 bg-yellow-500`} onClick={handleAddFolder}>
                            <FaFolderPlus size={15}/><p className={'text-[12px]'}>Add Folder</p>
                        </button>
                    </div>
                </div>
                <div className={'h-[85%] overflow-y-auto'}>
                    {
                        currentDirList?.map((file, index) => {
                            return (
                                <div key={index}
                                     className="flex items-center justify-between p-1 cursor-pointer w-[47vw] text-sm"
                                     onClick={file.is_dir ? () => {
                                         setHoneyDirectory(file.name);
                                     } : async () => {
                                         OpenNote(
                                             {openedWindows, setOpenedWindows},
                                             {
                                                 name: file.name,
                                                 content: (await readFile(file.name)).content,
                                                 location: directory() + '\\' + honey_directory()
                                             }
                                         )
                                     }}>
                                    <div className="flex items-center space-x-4 flex-grow">
                                        {file.is_dir ? (
                                            <FolderIcon className="w-6 h-6"/>
                                        ) : file.name.includes(".txt") ? (
                                            <DocumentTextIcon className="w-6 h-6"/>
                                        ) : (
                                            <PhotoIcon className="w-6 h-6"/>
                                        )}
                                        <span>{file.name}</span>
                                    </div>
                                    <div className="relative">
                                        <button className="w-6 h-6 border-none focus:outline-none"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Show or hide options dropdown
                                                    handleOptionsButtonClick(index);
                                                }}>
                                            <EllipsisVerticalIcon className="w-6 h-6"/>
                                        </button>
                                        {/* Delete option */}
                                        {showOptionsDropdownForFile === index && (
                                            <div className="absolute right-0 mt-2 w-36 bg-primary shadow-md rounded-lg z-10">
                                                {/* Delete option */}
                                                <button
                                                    className="flex border w-full px-4 py-2 space-x-2 items-center hover:bg-gray-200 hover:text-primary focus:outline-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Pass the file name and type (file or directory) to the delete function
                                                        handleDelete(file.name, file.is_dir);
                                                    }}>
                                                    <TrashIcon className="w-4 h-4"/> <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                {showPopup && (
                    <NewFilePopup
                        onSave={popupType === "folder" ? handleSaveFolder : handleEmptyFile}
                        onCancel={handleCancelFolder}
                        setName={setName}
                        name={name}
                        fileType={popupType}
                    />
                )}
            </div>
        </WindowScreen>
    )
}