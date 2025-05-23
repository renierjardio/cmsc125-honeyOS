import WindowScreen from "@/app/desktop/components/window";
import React, { useContext, useEffect, useState } from "react";
import useFileSystem from "@/hooks/useFileSystem";
import NewFilePopup from "../desktop/components/file_manager_popup";
import FileManagerItem from "@/app/desktop/components/file_manager_item";
import { HoneyFile, WindowProps } from "@/app/types";
import { FaFolder, FaFolderPlus } from "react-icons/fa";
import {
  DocumentTextIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { OpenNote } from "@/app/desktop/programOpener";
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
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [popupType, setPopupType] = useState(""); // State to track the type of popup ("file" or "folder")
  const [showOptionsDropdownForFile, setShowOptionsDropdownForFile] = useState<
    number | null
  >(null); // State to track which file's options dropdown is open
  const { setOpenedWindows, openedWindows } = useContext(OpenedWindowsContext);
  const { command } = useContext(SpeechRecognitionContext);
  const [name, setName] = useState("");
  const { montserrat } = useFont();
  const handleOptionsButtonClick = (index: number) => {
    setShowOptionsDropdownForFile(
      index === showOptionsDropdownForFile ? null : index
    ); // Toggle the dropdown for the clicked file
  };

  useEffect(() => {
    console.log("Data dir path: ", dataDirPath);
    listDir().then((data) => {
      setCurrentDirList(data);
    });
  }, [dataDirPath, absolutePath]);

  useEffect(() => {
    if (openedWindows[3].focused) {
      if (showPopup) {
        if (command.substring(0, 4) == "type") {
          setName(command.substring(5));
        } else if (command.substring(0, 6) === "cancel") {
          handleCancelFolder();
          setName("");
        } else if (command.substring(0, 7) === "save") {
          if (name.length) {
            if (popupType === "folder") {
              handleSaveFolder(name).then((r) => {});
            } else {
              handleEmptyFile(name).then((r) => {});
            }
            setName("");
          }
        }
      } else {
        if (command.substring(0, 5) === "enter") {
          setHoneyDirectory(command.substring(6));
        } else if (command === "exit") {
          exitCurrentDir();
        } else if (command === "add file") {
          handleAddFile();
        } else if (command === "add folder") {
          handleAddFolder();
        } else if (command.includes(".")) {
          readFile(command).then((data) => {
            if (data.status) {
              OpenNote(
                { openedWindows, setOpenedWindows },
                {
                  name: command,
                  content: data.content,
                  location: directory() + "\\" + honey_directory(),
                }
              );
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
      await createFile(name);
      console.log("File created successfully");
      setShowPopup(false);
      listDir().then((data) => {
        setCurrentDirList(data);
      });
    } catch (error) {
      console.log("Error creating file:", error);
    }
  };

  const handleCancelFolder = () => {
    setShowPopup(false);
  };

  const handleDelete = async (fileName: string, isDir: boolean) => {
    try {
      if (isDir) {
        // Delete directory
        await deleteDir(fileName);
      } else {
        // Delete file
        await deleteFile(fileName);
      }
      console.log(
        `${isDir ? "Directory" : "File"} "${fileName}" deleted succesfully`
      );
      // Refresh the directory listing after the deletion
      listDir().then((files) => {
        setCurrentDirList(files);
      });
    } catch (error) {
      console.log(
        `Error deleting ${isDir ? "directory" : "file"} "${fileName}":`,
        error
      );
    }
    setShowOptionsDropdownForFile(null);
  };

  const handleRename = async (oldName: string, newName: string) => {
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
        className={`${montserrat.className} p-4 flex flex-col text-yellow-100 relative h-full bg-transparent rounded-lg`}
      >
        <div className="flex items-center space-x-2">
          <button onClick={exitCurrentDir} className={"text-sm"}>
            ...
          </button>
          <div className="overflow-x-auto whitespace-nowrap">
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
        <div className={"h-[85%] overflow-y-auto"}>
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
                setHistory((prev) => [...prev, honey_directory()]);
                setHoneyDirectory(folderName);
              }}
              openNote={
                file.is_dir
                  ? undefined
                  : async (file) => {
                      const data = await readFile(file.name);
                      OpenNote(
                        { openedWindows, setOpenedWindows },
                        {
                          name: file.name,
                          content: data.content,
                          location: directory() + "\\" + honey_directory(),
                        }
                      );
                    }
              }
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
