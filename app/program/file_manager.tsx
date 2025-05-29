import WindowScreen from "@/app/desktop/components/window";
import React, { useContext, useEffect, useState } from "react";
import useFileSystem from "@/hooks/useFileSystem";
import NewFilePopup from "../desktop/components/file_manager_popup";
import FileManagerItem from "@/app/desktop/components/file_manager_item";
import { HoneyFile, WindowProps } from "@/app/types";
import { FaFolder, FaFolderPlus } from "react-icons/fa";
import Image from "next/image";
import { OpenNote, OpenImage } from "@/app/desktop/programOpener";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import useFont from "@/hooks/useFont";
import { FaFileCirclePlus } from "react-icons/fa6";
import { SpeechRecognitionContext } from "@/app/context/speechRecognitionContext";

export default function FileManager({ windowIndex }: WindowProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [currentDirList, setCurrentDirList] = useState<HoneyFile[]>();
  const {
    listDir,
    honey_directory,
    setHoneyDirectory,
    exitCurrentDir,
    makeDir,
    deleteDir,
    deleteFile,
    createFile,
    renameFile,
    directory,
    absolutePath,
    dataDirPath,
    readFile,
  } = useFileSystem();
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [showOptionsDropdownForFile, setShowOptionsDropdownForFile] = useState<
    number | null
  >(null);
  const { setOpenedWindows, openedWindows } = useContext(OpenedWindowsContext);
  const { command } = useContext(SpeechRecognitionContext);
  const [name, setName] = useState("");
  const { montserrat } = useFont();

  const handleOptionsButtonClick = (index: number) => {
    console.log(`Options button clicked for file index: ${index}`);
    setShowOptionsDropdownForFile(
      index === showOptionsDropdownForFile ? null : index
    );
  };

  useEffect(() => {
    console.log("Effect triggered: dataDirPath or absolutePath changed");
    console.log("Data dir path:", dataDirPath);
    listDir().then((data) => {
      console.log("Directory listed:", data);
      setCurrentDirList(data);
    });
  }, [dataDirPath, absolutePath]);

  useEffect(() => {
    console.log("Command effect triggered with command:", command);
    if (openedWindows[3].focused) {
      console.log("FileManager window is focused");
      if (showPopup) {
        console.log("Popup is shown, handling commands related to popup");
        if (command.substring(0, 4) == "type") {
          console.log("Setting name from voice command:", command.substring(5));
          setName(command.substring(5));
        } else if (command.substring(0, 6) === "cancel") {
          console.log("Cancel command detected");
          handleCancelFolder();
          setName("");
        } else if (command.substring(0, 7) === "save") {
          if (name.length) {
            console.log("Save command detected with name:", name);
            if (popupType === "folder") {
              handleSaveFolder(name).then(() => {
                console.log("Folder save handled");
              });
            } else {
              handleEmptyFile(name).then(() => {
                console.log("File save handled");
              });
            }
            setName("");
          } else {
            console.log("Save command received but name is empty");
          }
        }
      } else {
        console.log("No popup, handling normal commands");
        if (command.substring(0, 5) === "enter") {
          console.log("Enter directory command:", command.substring(6));
          setHoneyDirectory(command.substring(6));
        } else if (command === "exit") {
          console.log("Exit directory command");
          exitCurrentDir();
        } else if (command === "add file") {
          console.log("Add file command");
          handleAddFile();
        } else if (command === "add folder") {
          console.log("Add folder command");
          handleAddFolder();
        } else if (command.includes(".")) {
          console.log("Attempting to open file from command:", command);
          readFile(command).then((data) => {
            console.log("Read file result:", data);
            if (data.status) {
              const filePath = directory() + "\\" + honey_directory();
              const extension = command.split(".").pop()?.toLowerCase() || "";
              console.log(
                `Opening file "${command}" with extension "${extension}"`
              );
              if (["jpeg", "jpg", "png"].includes(extension)) {
                console.log("Opening image file");
                OpenImage(
                  { openedWindows, setOpenedWindows },
                  {
                    name: command,
                    content: data.content,
                    location: filePath,
                  }
                );
              } else {
                console.log("Opening note file");
                OpenNote(
                  { openedWindows, setOpenedWindows },
                  {
                    name: command,
                    content: data.content,
                    location: filePath,
                  }
                );
              }
            } else {
              console.error("Failed to read file from command:", command);
            }
          });
        }
      }
    } else {
      console.log("FileManager window not focused, ignoring commands");
    }
  }, [command]);

  const handleOpenFile = async (file: HoneyFile) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const data = await readFile(file.name);
    if (!data.status) {
      console.error("Failed to read file", file.name);
      return;
    }
    if (["jpeg", "jpg", "png", "gif"].includes(extension)) {
      OpenImage(
        { openedWindows, setOpenedWindows },
        {
          name: file.name,
          content: data.content,
          location: directory() + "\\" + honey_directory(),
        }
      );
    } else if (extension === "txt") {
      OpenNote(
        { openedWindows, setOpenedWindows },
        {
          name: file.name,
          content: data.content,
          location: directory() + "\\" + honey_directory(),
        }
      );
    }
  };

  const handleAddFile = () => {
    console.log("handleAddFile called");
    setPopupType("file");
    setShowPopup(true);
  };

  const handleAddFolder = () => {
    console.log("handleAddFolder called");
    setPopupType("folder");
    setShowPopup(true);
  };

  const handleSaveFolder = async (name: string) => {
    console.log(`handleSaveFolder called with name: ${name}`);
    try {
      await makeDir(name);
      console.log("Folder created successfully");
      setShowPopup(false);
      const data = await listDir();
      console.log("Directory after folder creation:", data);
      setCurrentDirList(data);
    } catch (error) {
      console.log("Error creating folder:", error);
    }
  };

  const handleEmptyFile = async (name: string) => {
    console.log(`handleEmptyFile called with name: ${name}`);
    try {
      await createFile(name);
      console.log("File created successfully");
      setShowPopup(false);
      const data = await listDir();
      console.log("Directory after file creation:", data);
      setCurrentDirList(data);
    } catch (error) {
      console.log("Error creating file:", error);
    }
  };

  const handleCancelFolder = () => {
    console.log("handleCancelFolder called");
    setShowPopup(false);
  };

  const handleDelete = async (fileName: string, isDir: boolean) => {
    console.log(
      `handleDelete called for ${isDir ? "directory" : "file"}: ${fileName}`
    );
    try {
      if (isDir) {
        await deleteDir(fileName);
      } else {
        await deleteFile(fileName);
      }
      console.log(
        `${isDir ? "Directory" : "File"} "${fileName}" deleted successfully`
      );
      const files = await listDir();
      console.log("Directory after deletion:", files);
      setCurrentDirList(files);
    } catch (error) {
      console.log(
        `Error deleting ${isDir ? "directory" : "file"} "${fileName}":`,
        error
      );
    }
    setShowOptionsDropdownForFile(null);
  };

  const handleRename = async (oldName: string, newName: string) => {
    console.log(`handleRename called from "${oldName}" to "${newName}"`);
    try {
      await renameFile(oldName, newName);
      console.log(`Renamed ${oldName} to ${newName}`);
      setCurrentDirList((prevFiles) =>
        (prevFiles ?? []).map((file) =>
          file.name === oldName
            ? {
                ...file,
                name: newName,
                created_at: new Date().toISOString(),
              }
            : file
        )
      );
    } catch (error) {
      console.log(`Error renaming ${oldName} to ${newName}:`, error);
    }
  };

  return (
    <WindowScreen
      name={"File Manager"}
      windowIndex={windowIndex}
      icon={<FaFolder size={25} color={"yellow"} />}
    >
      <div
        className={`${montserrat.className} p-4 flex flex-col text-yellow-100 relative h-full w-full bg-transparent rounded-lg`}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              console.log("Back button clicked");
              exitCurrentDir();
            }}
            className={"text-sm"}
          >
            <Image
              src={"/revisedHoneyOS/backButton.png"}
              height={40}
              width={40}
              alt="back button"
            />
          </button>
          <div className="overflow-x-auto whitespace-nowrap text-[#743D31] shadow-md font-bold">
            {honey_directory()}
          </div>
          <div
            className={`p-2 w-fit h-fit flex flex-row space-x-1 text-[12px] text-[#743D31] font-bold`}
          >
            <button
              className={`h-8 px-2 py-1 rounded-lg flex flex-row space-x-1 bg-[#F6D69A] border-2 border-[#743D31] shadow-md justify-center items-center`}
              onClick={handleAddFile}
            >
              <FaFileCirclePlus size={20} color="#743D31" />
              <p>Add File</p>
            </button>
            <button
              className={`h-8 px-2 py-1 rounded-lg flex flex-row space-x-1 bg-[#F6D69A] border-2 border-[#743D31] shadow-md justify-center items-center`}
              onClick={handleAddFolder}
            >
              <FaFolderPlus size={20} color="#743D31" />
              <p>Add Folder</p>
            </button>
          </div>
        </div>
        <div className={"flex flex-col overflow-y-auto mt-2 flex-1"}>
          <div className="flex justify-between items-center px-2 py-1 text-lg text-[#743D31] font-bold">
            <span className="w-1/2 pl-12">Name</span>
            <span className="w-1/2 text-right pr-24">Date Modified</span>
          </div>

          {currentDirList?.map((file, index) => (
            <FileManagerItem
              key={index}
              file={file}
              handleDelete={handleDelete}
              handleRename={handleRename}
              setHoneyDirectory={(folderName) => {
                console.log(`Navigating into folder: ${folderName}`);
                setHistory((prev) => [...prev, honey_directory()]);
                setHoneyDirectory(folderName);
              }}
              onOpenFile={file.is_dir ? undefined : handleOpenFile}
            />
          ))}
        </div>
        {showPopup && (
          <NewFilePopup
            onSave={popupType === "folder" ? handleSaveFolder : handleEmptyFile}
            onCancel={handleCancelFolder}
            setName={setName}
            name={name}
            fileType={popupType}
            mode="create"
          />
        )}
      </div>
    </WindowScreen>
  );
}
