import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  writeBinaryFile,
  readBinaryFile,
  removeFile,
  BaseDirectory,
  createDir,
  readDir,
  exists,
} from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";

import Window from "@/app/desktop/components/window";
import { FaCamera } from "react-icons/fa";
import { WindowProps } from "@/app/types";
import Image from "next/image";

// Constants
const FOLDER_NAME = "honeyOS/Pictures";

// Helpers
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64.split(",")[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function getNextImageNumber(): Promise<number> {
  try {
    const entries = await readDir(FOLDER_NAME, {
      dir: BaseDirectory.Data,
      recursive: false,
    });

    const numbers = entries
      .map((entry) => {
        const match = entry.name?.match(/^HONEY-(\d+)\.jpeg$/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((n): n is number => n !== null);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return maxNumber + 1;
  } catch {
    return 1;
  }
}

// Types
type CapturedImage = {
  url: string;
  name: string;
};

export default function Camera({ windowIndex }: WindowProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  const captureImage = async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        console.error("No image captured from webcam.");
        return;
      }

      const imageData = base64ToUint8Array(imageSrc);

      const folderExists = await exists(FOLDER_NAME, {
        dir: BaseDirectory.Data,
      });
      if (!folderExists) {
        await createDir(FOLDER_NAME, {
          dir: BaseDirectory.Data,
          recursive: true,
        });
      }

      const nextNumber = await getNextImageNumber();
      const fileName = `HONEY-${nextNumber}.jpeg`;
      const filePath = await join(FOLDER_NAME, fileName);

      await writeBinaryFile(filePath, imageData, { dir: BaseDirectory.Data });

      const binary = await readBinaryFile(filePath, {
        dir: BaseDirectory.Data,
      });
      const blob = new Blob([new Uint8Array(binary)], { type: "image/jpeg" });
      const blobUrl = URL.createObjectURL(blob);

      setCapturedImages((prev) => [{ url: blobUrl, name: fileName }, ...prev]);
    } catch (error) {
      console.error("Error capturing or saving image:", error);
    }
  };

  const loadCapturedImages = async () => {
    try {
      const entries = await readDir(FOLDER_NAME, {
        dir: BaseDirectory.Data,
        recursive: false,
      });

      const imageFiles = entries
        .filter((entry) => entry.name?.match(/^HONEY-\d+\.jpeg$/) && entry.path)
        .sort((a, b) => {
          const numA = parseInt(a.name?.match(/\d+/)?.[0] ?? "0");
          const numB = parseInt(b.name?.match(/\d+/)?.[0] ?? "0");
          return numB - numA;
        });

      const urls = await Promise.all(
        imageFiles.map(async (file) => {
          const binary = await readBinaryFile(file.path!, {
            dir: BaseDirectory.Data,
          });
          const blob = new Blob([new Uint8Array(binary)], {
            type: "image/jpeg",
          });
          const blobUrl = URL.createObjectURL(blob);
          return { url: blobUrl, name: file.name! };
        })
      );

      setCapturedImages(urls);
      setGalleryLoaded(true);
    } catch (error) {
      console.error("Failed to load images from folder:", error);
    }
  };

  const deleteImage = async (fileName: string) => {
    try {
      const filePath = await join(FOLDER_NAME, fileName);
      await removeFile(filePath, { dir: BaseDirectory.Data });

      setCapturedImages((prev) => prev.filter((img) => img.name !== fileName));
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleOpenGallery = async () => {
    if (!galleryLoaded) {
      await loadCapturedImages();
    }
    setShowGallery(true);
  };

  const videoConstraints = { facingMode: "user" };

  return (
    <Window
      name="Camera"
      windowIndex={windowIndex}
      icon={<FaCamera size={25} color="yellow" />}
    >
      <div className="flex flex-col items-center justify-center p-8 gap-4 w-full h-full overflow-auto mx-auto">
        {!showGallery ? (
          <>
            <div className="w-auto aspect-[4/3] rounded-lg overflow-hidden border border-2 border-[#743D31]">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={videoConstraints}
              />
            </div>

            <div className="flex gap-4 w-full justify-center px-4">
              <Image
                src="/revisedHoneyOS/snapPhotoButton.png"
                alt="Capture"
                width={56}
                height={56}
                onClick={captureImage}
                className="cursor-pointer hover:opacity-80 active:scale-90 transition-all duration-150"
                style={{ userSelect: "none" }}
              />
              <Image
                src="/revisedHoneyOS/openGalleryButton.png"
                alt="Open Gallery"
                width={56}
                height={56}
                onClick={handleOpenGallery}
                className="cursor-pointer hover:opacity-80 active:scale-90 transition-all duration-150"
                style={{ userSelect: "none" }}
              />
            </div>
          </>
        ) : (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full overflow-y-auto rounded-lg p-2"
              style={{ maxHeight: "500px" }}
            >
              {capturedImages.map((img) => (
                <div
                  key={img.name}
                  className="relative w-full pb-[75%] rounded-lg overflow-hidden group"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
                  />
                  <Image
                    src="/revisedHoneyOS/deleteButton.png"
                    alt="Delete"
                    width={32}
                    height={32}
                    onClick={() => deleteImage(img.name)}
                    className="absolute top-2 right-2 z-10 cursor-pointer opacity-80 group-hover:opacity-100 transition-all"
                    style={{ userSelect: "none" }}
                  />
                </div>
              ))}
            </div>

            <Image
              src="/revisedHoneyOS/backButton.png"
              alt="Back to Camera"
              width={48}
              height={48}
              onClick={() => setShowGallery(false)}
              className="cursor-pointer hover:opacity-80 active:scale-90 transition-all duration-150"
              style={{ userSelect: "none" }}
            />
          </>
        )}
      </div>
    </Window>
  );
}
