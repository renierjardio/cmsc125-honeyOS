import { useState } from "react";
import {
  DocumentTextIcon,
  FolderIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/16/solid";
import { HoneyFile } from "@/app/types";
import NewFilePopup from "@/app/desktop/components/file_manager_popup";

interface FileManagerItemProps {
  file: HoneyFile;
  handleDelete: (fileName: string, isDirectory: boolean) => void;
  handleRename: (oldName: string, newName: string) => void;
  setHoneyDirectory: (path: string) => void;
  openNote?: (file: HoneyFile) => void;
}

const FileManagerItem: React.FC<FileManagerItemProps> = ({
  file,
  handleDelete,
  handleRename,
  setHoneyDirectory,
}) => {
  const [isRenamePopupOpen, setIsRenamePopupOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const handleDeleteConfirm = () => {
    handleDelete(file.name, file.is_dir);
    setIsDeleteConfirmOpen(false);
  };

  const handleRenameSave = (updatedName: string) => {
    handleRename(file.name, updatedName);
    setNewName(updatedName);
    setIsRenamePopupOpen(false);
  };

  return (
    <>
      <div
        className="flex items-center justify-between mb-2 cursor-pointer w-[47vw] h-9 text-sm bg-[#F6D69A] border-4 border-[#743D31] rounded-lg"
        onClick={file.is_dir ? () => setHoneyDirectory(file.name) : () => {}}
      >
        <div className="flex items-center space-x-4 pl-4">
          {file.is_dir ? (
            <FolderIcon className="w-6 h-6 text-[#743D31]" />
          ) : file.name.includes(".txt") ? (
            <DocumentTextIcon className="w-6 h-6 text-[#743D31]" />
          ) : (
            <PhotoIcon className="w-6 h-6" />
          )}
          <span className="text-[#743D31] font-semibold">{file.name}</span>
        </div>

        <div className="absolute right-32 text-[#743D31] text-xs font-medium">
          {new Date(file.created_at).toLocaleString()}
        </div>

        <div
          className="flex space-x-3 pr-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsRenamePopupOpen(true)}
            className="text-[#743D31] hover:text-yellow-600 duration-300 ease-in-out"
            title="Rename"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="text-[#743D31] hover:text-yellow-600 duration-300 ease-in-out"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isRenamePopupOpen && (
        <NewFilePopup
          name={newName}
          setName={setNewName}
          onSave={handleRenameSave}
          onCancel={() => setIsRenamePopupOpen(false)}
          fileType={file.is_dir ? "folder" : "file"}
          mode="rename"
        />
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20">
          <div className="bg-primary p-4 rounded">
            <p>
              Are you sure you want to delete <strong>{file.name}</strong>?
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="p-2 border rounded-lg mr-2 hover:bg-gray-200 hover:text-black ease-in-out duration-300"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="p-2 border rounded-lg hover:bg-gray-200 hover:text-black ease-in-out duration-300"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileManagerItem;
