import React, { useContext, useEffect, useState } from "react";
import WindowScreen from "@/app/desktop/components/window";
import { FaRegSave, FaSave } from "react-icons/fa";
import {
  FaCircleCheck,
  FaCircleInfo,
  FaCircleXmark,
  FaNoteSticky,
  FaVolumeHigh,
} from "react-icons/fa6";
import useFileSystem from "@/hooks/useFileSystem";
import { SpeechRecognitionContext } from "@/app/context/speechRecognitionContext";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import { closeWindow } from "@/app/desktop/programOpener";
import { NoteContext } from "@/app/context/noteContext"; // <- Make sure the path is correct

export default function Note({
  windowIndex,
  file,
  isNew,
}: {
  windowIndex: number;
  file?: { content: string; location: string; name: string };
  isNew?: boolean;
}) {
  const { writeFile } = useFileSystem();
  const { command } = useContext(SpeechRecognitionContext);
  const { openedWindows, setOpenedWindows } = useContext(OpenedWindowsContext);
  const noteContext = useContext(NoteContext);

  if (!noteContext) {
    throw new Error(
      "NoteContext is undefined. Please ensure NoteProvider is in the component tree."
    );
  }

  const {
    currentContent,
    newContent,
    setNewContent,
    setCurrentContent,
    showNotification,
    setShowNotification,
    showSaveAsDialog,
    setShowSaveAsDialog,
    showConfirmDialog,
    setShowConfirmDialog,
    message,
    setMessage,
    tempName,
    setTempName,
    customName,
    setCustomName,
  } = noteContext;

  const isNewFile =
    !file ||
    file.name.trim() === "" ||
    file.location.trim() === "" ||
    file.name.toLowerCase() === "untitled.txt" ||
    file.content.trim() === "";

  useEffect(() => {
    if (file) {
      setCurrentContent(file);
      setNewContent(file);
    }
  }, []);

  useEffect(() => {
    if (command.includes("close note")) {
      if (onClose()) closeWindow(openedWindows, setOpenedWindows, windowIndex);
    }

    if (openedWindows[windowIndex].focused) {
      if (showConfirmDialog) {
        if (command.startsWith("confirm")) {
          setShowConfirmDialog(false);
          saveFile(tempName);
        } else if (command.startsWith("cancel")) {
          setShowConfirmDialog(false);
          setShowSaveAsDialog(false);
          if (message.after === "close")
            closeWindow(openedWindows, setOpenedWindows, windowIndex);
        }
      } else {
        if (command.startsWith("type")) {
          const content = command.substring(5);
          const updatedContent =
            content === "newline" || content === "new line"
              ? newContent.content + "\n"
              : newContent.content + content;

          setNewContent({
            ...newContent,
            content: updatedContent,
          });
        } else if (
          command.startsWith("save as") ||
          command.startsWith("save us")
        ) {
          const newName = command.substring(8);
          setTempName(newName);
          setShowConfirmDialog(true);
          setMessage({
            content: `New file will be saved as ${newName}.txt`,
            after: "no-close",
          });
        } else if (command.startsWith("save")) {
          saveFile();
        }
      }
    }
  }, [command]);

  const saveFile = async (newFileName?: string) => {
    if (newFileName || currentContent.content !== newContent.content) {
      const filename = newFileName || currentContent.name;
      const response = await writeFile(
        newContent.location + "\\" + filename,
        newContent.content
      );

      if (response.status) {
        setCurrentContent({ ...newContent });
        setShowNotification({
          show: true,
          type: "success",
          message: response.message,
        });
      } else {
        setShowNotification({
          show: true,
          type: "error",
          message: response.message,
        });
      }

      setTimeout(() => {
        setShowNotification({ show: false, type: "", message: "" });
      }, 3000);

      return response.status;
    }
    return false;
  };

  const onClose = () => {
    if (currentContent.content !== newContent.content) {
      setShowConfirmDialog(true);
      setMessage({
        content:
          "You have unsaved changes. Do you want to save before closing?",
        after: "close",
      });
      setTempName(currentContent.name);
      return false;
    }
    return true;
  };

  return (
    <WindowScreen
      name={"Note"}
      customName={customName}
      windowIndex={windowIndex}
      onClose={onClose}
      icon={<FaNoteSticky size={25} className={"text-yellow-500"} />}
    >
      <div className="h-full w-full bg-transparent pt-6 px-2 pb-2">
        {showNotification.show && (
          <div
            className={`${
              showNotification.type === "error" ? "bg-red-400" : "bg-green-600"
            } absolute w-full grid justify-items-center text-center h-fit p-2 rounded-lg opacity-80 text-white text-sm`}
          >
            <div className={"flex flex-row space-x-1"}>
              {showNotification.type === "error" ? (
                <FaCircleXmark size={20} />
              ) : (
                <FaCircleCheck size={20} />
              )}
              <p>{showNotification.message}</p>
            </div>
          </div>
        )}

        <textarea
          value={newContent.content}
          onChange={(e) =>
            setNewContent({ ...newContent, content: e.target.value })
          }
          className="bg-transparent text-black input w-full h-full p-2"
        />

        <div className="flex flex-row space-x-3 absolute bottom-16 left-4">
          {!isNewFile && (
            <button
              onClick={async () => {
                await saveFile();
              }}
              className={`${
                currentContent.content !== newContent.content
                  ? "bg-yellow-500"
                  : "bg-gray-700 cursor-default"
              } px-2 py-1 w-fit rounded-md text-yellow-950 flex flex-row space-x-1`}
            >
              <FaSave size={20} />
              <p>Save</p>
            </button>
          )}

          <button
            onClick={() => setShowSaveAsDialog(true)}
            className="bg-yellow-500 px-2 py-1 w-fit rounded-md text-yellow-950 flex flex-row space-x-1"
          >
            <FaRegSave size={20} />
            <p>Save As</p>
          </button>

          {showSaveAsDialog && (
            <div className="flex flex-row space-x-1 h-[31px]">
              <input
                id="newFileName"
                type="text"
                className="text-white rounded-lg w-[150px] p-1 px-2 border-2 border-yellow-500"
                placeholder="enter file name"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById(
                    "newFileName"
                  ) as HTMLInputElement;
                  const status = await saveFile(input.value + ".txt");
                  if (status) {
                    setCustomName(input.value + ".txt");
                    setShowSaveAsDialog(false);
                  }
                }}
                className="text-sm bg-yellow-500 px-2 text rounded-lg"
              >
                Confirm
              </button>
            </div>
          )}

          {showConfirmDialog && (
            <div className="text-sm flex flex-row h-fit space-x-1">
              <div className="bg-green-400 flex flex-row px-2 py-1 rounded-lg space-x-1">
                <FaCircleInfo size={20} />
                <p>{message.content}</p>
              </div>
              <div className="bg-green-400 flex flex-row px-2 py-1 rounded-lg space-x-1">
                <FaVolumeHigh size={20} />
                <p>Confirm/Cancel</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </WindowScreen>
  );
}
