"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import useFileSystem from "@/hooks/useFileSystem";
import { SpeechRecognitionContext } from "@/app/context/speechRecognitionContext";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import { closeWindow } from "@/app/desktop/programOpener";

interface FileType {
  content: string;
  location: string;
  name: string;
}

interface NoteContextType {
  currentContent: FileType;
  setCurrentContent: React.Dispatch<React.SetStateAction<FileType>>;
  newContent: FileType;
  setNewContent: React.Dispatch<React.SetStateAction<FileType>>;
  customName: string | undefined;
  setCustomName: (name: string) => void;

  tempName: string;
  setTempName: (name: string) => void;

  showNotification: { show: boolean; type: string; message: string };
  setShowNotification: React.Dispatch<
    React.SetStateAction<{ show: boolean; type: string; message: string }>
  >;

  showSaveAsDialog: boolean;
  setShowSaveAsDialog: (show: boolean) => void;

  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;

  message: { content: string; after: "close" | "no-close" };
  setMessage: (msg: { content: string; after: "close" | "no-close" }) => void;

  saveFile: (nameOverride?: string) => Promise<boolean>;
  onClose: () => boolean;
}

export const NoteContext = createContext<NoteContextType | undefined>(
  undefined
);

export const NoteProvider = ({
  children,
  file,
  windowIndex,
}: {
  children: React.ReactNode;
  file?: FileType;
  windowIndex: number;
}) => {
  const { command } = useContext(SpeechRecognitionContext);
  const { openedWindows, setOpenedWindows } = useContext(OpenedWindowsContext);
  const { writeFile } = useFileSystem();

  const [currentContent, setCurrentContent] = useState<FileType>({
    content: "",
    location: "",
    name: "",
  });
  const [newContent, setNewContent] = useState<FileType>({
    content: "",
    location: "",
    name: "",
  });
  const [customName, setCustomName] = useState(file?.name);
  const [tempName, setTempName] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showNotification, setShowNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [message, setMessage] = useState({
    content: "",
    after: "no-close" as "close" | "no-close",
  });

  useEffect(() => {
    if (file) {
      setCurrentContent(file);
      setNewContent(file);
    }
  }, [file]);

  useEffect(() => {
    if (openedWindows[windowIndex]?.focused) {
      if (command.includes("close note")) {
        if (onClose())
          closeWindow(openedWindows, setOpenedWindows, windowIndex);
      }

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
          const addition =
            content === "newline" || content === "new line" ? "\n" : content;
          setNewContent((prev) => ({
            ...prev,
            content: prev.content + addition,
          }));
        } else if (
          command.startsWith("save as") ||
          command.startsWith("save us")
        ) {
          const name = command.substring(8);
          setTempName(name);
          setShowConfirmDialog(true);
          setMessage({
            content: `New file will be saved as ${name}.txt`,
            after: "no-close",
          });
        } else if (command.startsWith("save")) {
          saveFile();
        }
      }
    }
  }, [command]);

  const saveFile = async (nameOverride?: string): Promise<boolean> => {
    let response = { status: false, message: "" };
    const filename = nameOverride ?? file?.name;
    if (!filename) return false;

    if (nameOverride || currentContent.content !== newContent.content) {
      response = await writeFile(
        newContent.location + "\\" + filename,
        newContent.content
      );
      if (response.status) {
        setCurrentContent(newContent);
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

      setTimeout(
        () => setShowNotification({ show: false, type: "", message: "" }),
        3000
      );
    }
    return response.status;
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
    <NoteContext.Provider
      value={{
        currentContent,
        setCurrentContent, // add this
        newContent,
        setNewContent,
        customName,
        setCustomName,
        tempName, // add this
        setTempName,
        showNotification,
        setShowNotification, // add this
        showSaveAsDialog,
        setShowSaveAsDialog,
        showConfirmDialog,
        setShowConfirmDialog,
        message,
        setMessage,
        saveFile,
        onClose,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
