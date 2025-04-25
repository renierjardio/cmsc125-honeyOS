import { useState } from 'react';
import { DocumentTextIcon, EllipsisVerticalIcon, FolderIcon, PhotoIcon, TrashIcon } from '@heroicons/react/16/solid';
import { HoneyFile } from '@/app/types';

interface FileManagerItemProps {
  file: HoneyFile;
  handleDelete: (fileName: string, isDirectory: boolean) => void;
  setHoneyDirectory: (path: string) => void;
}

const FileManagerItem: React.FC<FileManagerItemProps> = ({ file, handleDelete, setHoneyDirectory }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    // Pass the file name and type (file or directory) to the delete function
    handleDelete(file.name, file.is_dir);
    // Close the dropdown after the delete action
    setIsDropdownOpen(false);
  };

  return (
    <div
      key={file.name}
      className='flex items-center justify-between p-1 cursor-pointer'
      onClick={file.is_dir ? () => setHoneyDirectory(file.name) : () => {}}
    >
      <div className='flex space-x-4'>
        {file.is_dir ? (
          <FolderIcon className='w-6 h-6' />
        ) : file.name.includes('.txt') ? (
          <DocumentTextIcon className='w-6 h-6' />
        ) : (
          <PhotoIcon className='w-6 h-6' />
        )}
        <span>{file.name}</span>
        {/* Dropdown button for delete */}
        <div className='relative'>
          <button className='w-6 h-6 border-none focus:outline-none' onClick={toggleDropdown}>
            {/* Three dots icon */}
            <EllipsisVerticalIcon className='w-6 h-6' />
          </button>
          {/* Dropdown content */}
          {isDropdownOpen && (
            <div className='absolute bg-white shadow-md rounded-lg z-10'>
              {/* Delete option */}
              <button className='w-full px-4 py-2 hover:bg-gray-200 focus:outline-none' onClick={handleDeleteClick}>
                <TrashIcon className='w-6 h-6' /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManagerItem;
