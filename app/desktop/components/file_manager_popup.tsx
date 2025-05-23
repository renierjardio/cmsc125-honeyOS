import React, { useState, useEffect } from "react";

type SaveHandler = (name: string) => void;
type CancelHandler = () => void;

interface NewFilePopupProps {
  onSave: SaveHandler;
  onCancel: CancelHandler;
  fileType?: string;
  name: string;
  setName: (name: string) => void;
  mode: "create" | "rename";
}

function getBaseName(name: string) {
  const lastDot = name.lastIndexOf(".");
  return lastDot > 0 ? name.substring(0, lastDot) : name;
}

function getExtension(name: string) {
  const lastDot = name.lastIndexOf(".");
  return lastDot > 0 ? name.substring(lastDot) : "";
}

export default function NewFilePopup({
  onSave,
  onCancel,
  fileType,
  setName,
  name,
  mode,
}: NewFilePopupProps) {
  const [extension, setExtension] = useState(".txt");
  const [originalExtension, setOriginalExtension] = useState("");

  useEffect(() => {
    if (mode === "rename" && fileType === "file") {
      setOriginalExtension(getExtension(name));
      setName(getBaseName(name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    let fileName = name;
    if (mode === "rename") {
      if (fileType === "file") {
        fileName = name + originalExtension;
      }
      // For folders, just use the name as is
    } else {
      fileName = fileType === "folder" ? name : `${name}${extension}`;
    }

    onSave(fileName);
    setName("");
    setExtension("");
  };

  const setFileType = (value: string) => {
    setExtension(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-primary p-4 rounded">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-2 bg-inherit"
          placeholder={`Enter ${
            mode === "rename"
              ? "new name"
              : fileType === "folder"
              ? "folder"
              : "file"
          } name`}
        />
        {/* Render additional options for file type if fileType is specified */}
        {fileType === "file" && mode !== "rename" && (
          <div>
            <label className="block mb-1">
              Choose file type:
              <select
                onChange={(e) => setFileType(e.target.value)}
                className="border p-2 bg-inherit"
              >
                <option value=".txt">.txt(Text File)</option>
                {/* Add more if needed */}
              </select>
            </label>
          </div>
        )}
        <div className="flex justify-end">
          <button className="p-2 border mr-2" onClick={onCancel}>
            Cancel
          </button>
          <button className="p-2 border" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
