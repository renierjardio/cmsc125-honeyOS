import Window from "@/app/desktop/components/window";
import { WindowProps } from "@/app/types";
import Image from "next/image";
import { BiImage } from "react-icons/bi";
import { removeFile, BaseDirectory } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { useState } from "react";

const FOLDER_NAME = "honeyOS/Pictures";

export default function ImageViewerWindow({
  windowIndex,
  name,
  imageSrc,
  location,
}: WindowProps & { name: string; imageSrc: string; location: string }) {
  const [deleted, setDeleted] = useState(false);

  const deleteImage = async () => {
    try {
      const filePath = await join(FOLDER_NAME, name);
      await removeFile(filePath, { dir: BaseDirectory.Data });
      setDeleted(true); // Optional: close window or show deleted message
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  if (deleted) {
    return (
      <Window
        name={`Image Viewer - ${name}`}
        windowIndex={windowIndex}
        icon={<BiImage size={25} color="yellow" />}
      >
        <div className="flex items-center justify-center h-full text-white font-semibold">
          Image deleted.
        </div>
      </Window>
    );
  }

  return (
    <Window
      name={`Image Viewer - ${name}`}
      windowIndex={windowIndex}
      icon={<BiImage size={25} color="yellow" />}
    >
      <div className="flex flex-col items-center justify-center p-8 gap-4 w-full h-full overflow-auto mx-auto relative">
        <div className="w-auto h-full max-w-full max-h-[80vh] rounded-lg overflow-hidden border border-2 border-[#743D31] shadow-lg">
          <img
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center mt-4">
          <Image
            src="/revisedHoneyOS/deleteButton.png"
            alt="Delete"
            width={48}
            height={48}
            onClick={deleteImage}
            className="cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            style={{ userSelect: "none" }}
          />
        </div>
      </div>
    </Window>
  );
}
