import React, { useRef, useState, useContext } from "react";
import Webcam from "react-webcam";
import { BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { OpenImage } from "@/app/desktop/programOpener";
import { OpenedWindowsContext } from "@/app/context/openedWindowsContext";
import { CameraContext } from "@/app/context/cameraContext";

import Window from "@/app/desktop/components/window";
import { FaCamera } from "react-icons/fa";
import { WindowProps } from "@/app/types";
import Image from "next/image";

export default function Camera({ windowIndex }: WindowProps) {
  const { webcamRef } = useContext(CameraContext);

  const [showGallery, setShowGallery] = useState(false);

  const {
    capturedImages,
    captureImage,
    loadCapturedImages,
    deleteImage,
    galleryLoaded,
    setCapturedImages,
    setGalleryLoaded,
  } = useContext(CameraContext);

  const { openedWindows, setOpenedWindows } = useContext(OpenedWindowsContext);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      await captureImage();
    } else {
      console.error("No image captured from webcam.");
    }
  };

  const handleOpenGallery = async () => {
    if (!galleryLoaded) {
      await loadCapturedImages();
    }
    setShowGallery(true);
  };

  const openImageInViewer = async (fileName: string) => {
    try {
      const filePath = await join("honeyOS/Pictures", fileName);
      const binary = await readBinaryFile(filePath, {
        dir: BaseDirectory.Data,
      });

      const base64Content = `data:image/jpeg;base64,${Buffer.from(
        binary
      ).toString("base64")}`;

      OpenImage(
        { openedWindows, setOpenedWindows },
        {
          name: fileName,
          content: base64Content,
          location: "honeyOS/Pictures",
        }
      );
    } catch (error) {
      console.error("Failed to open image in viewer:", error);
    }
  };

  const videoConstraints = { facingMode: "user" };

  return (
    <Window
      name="Camera"
      windowIndex={windowIndex}
      icon={<FaCamera size={25} color="yellow" />}
    >
      <div className="flex flex-col items-center justify-center pt-16 p-8 gap-4 w-full h-full overflow-auto mx-auto">
        {!showGallery ? (
          <>
            <div className="w-auto h-full aspect-[4/3] rounded-lg overflow-hidden border border-2 border-[#743D31]">
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
                onClick={handleCapture}
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
                  className="relative w-full pb-[75%] rounded-lg overflow-hidden group border border-2 border-[#743D31] cursor-pointer"
                  onClick={() => openImageInViewer(img.name)}
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
