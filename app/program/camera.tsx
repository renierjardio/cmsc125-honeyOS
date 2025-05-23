import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import {
  writeBinaryFile,
  BaseDirectory,
  createDir,
  readDir,
  exists,
} from "@tauri-apps/api/fs";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { appDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";

import Window from "@/app/desktop/components/window";
import { FaCamera } from "react-icons/fa";
import { WindowProps } from "@/app/types";
import Image from "next/image";

function base64ToUint8Array(base64: string) {
  const binaryString = window.atob(base64.split(",")[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function Camera({ windowIndex }: WindowProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const folder = "honeyOS/Pictures";

  const captureImage = async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        console.error("No image captured from webcam.");
        return;
      }

      const bytes = base64ToUint8Array(imageSrc);

      const folderExists = await exists(folder, { dir: BaseDirectory.Data });
      if (!folderExists) {
        await createDir(folder, { dir: BaseDirectory.Data, recursive: true });
      }

      const fileName = `${uuidv4()}.jpeg`;
      const filePath = await join(folder, fileName);

      await writeBinaryFile(filePath, bytes, { dir: BaseDirectory.Data });

      const basePath = await appDir();
      const fullPath = `${basePath}${filePath.replace(/\//g, "\\")}`;

      const fileUrl = convertFileSrc(fullPath);
      setCapturedImages((prev) => [...prev, fileUrl]);
    } catch (error) {
      console.error("Error capturing or saving image:", error);
    }
  };

  const loadCapturedImages = async () => {
    try {
      const entries = await readDir(folder, {
        dir: BaseDirectory.Data,
        recursive: false,
      });

      const imageFiles = entries.filter(
        (entry) => entry.name?.endsWith(".jpeg") && entry.path
      );
      const urls = imageFiles.map((file) => convertFileSrc(file.path));
      setCapturedImages(urls);
    } catch (error) {
      console.error("Failed to load images from folder:", error);
    }
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
                onClick={() => {
                  loadCapturedImages();
                  setShowGallery(true);
                }}
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
              {capturedImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-full pb-[75%] rounded-lg overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`Captured ${idx}`}
                    fill
                    style={{
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
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
