"use client";

import React, { createContext, useRef, useState, useEffect } from "react";
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

const FOLDER_NAME = "honeyOS/Pictures";

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

export type CapturedImage = {
  url: string;
  name: string;
};

export type CameraProviderProps = {
  webcamRef: React.RefObject<Webcam>;
  capturedImages: CapturedImage[];
  setCapturedImages: React.Dispatch<React.SetStateAction<CapturedImage[]>>;
  captureImage: () => Promise<void>;
  loadCapturedImages: () => Promise<void>;
  deleteImage: (fileName: string) => Promise<void>;
  capturedImagesRef: React.MutableRefObject<CapturedImage[]>;
  galleryLoaded: boolean;
  setGalleryLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CameraContext = createContext<CameraProviderProps>({
  webcamRef: { current: null },
  capturedImages: [],
  setCapturedImages: () => {},
  captureImage: async () => {},
  loadCapturedImages: async () => {},
  deleteImage: async () => {},
  capturedImagesRef: { current: [] },
  galleryLoaded: false,
  setGalleryLoaded: () => {},
});

export default function CameraProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const capturedImagesRef = useRef<CapturedImage[]>([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  useEffect(() => {
    capturedImagesRef.current = capturedImages;
  }, [capturedImages]);

  const captureImage = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const imageData = base64ToUint8Array(imageSrc);
    const folderExists = await exists(FOLDER_NAME, { dir: BaseDirectory.Data });
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

    const binary = await readBinaryFile(filePath, { dir: BaseDirectory.Data });
    const blob = new Blob([new Uint8Array(binary)], { type: "image/jpeg" });
    const blobUrl = URL.createObjectURL(blob);

    const newImage = { url: blobUrl, name: fileName };
    setCapturedImages((prev) => [newImage, ...prev]);
  };

  const loadCapturedImages = async () => {
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
        const blob = new Blob([new Uint8Array(binary)], { type: "image/jpeg" });
        return { url: URL.createObjectURL(blob), name: file.name! };
      })
    );

    setCapturedImages(urls);
    setGalleryLoaded(true);
  };

  const deleteImage = async (fileName: string) => {
    const filePath = await join(FOLDER_NAME, fileName);
    await removeFile(filePath, { dir: BaseDirectory.Data });
    setCapturedImages((prev) => prev.filter((img) => img.name !== fileName));
  };

  return (
    <CameraContext.Provider
      value={{
        webcamRef,
        capturedImages,
        setCapturedImages,
        captureImage,
        loadCapturedImages,
        deleteImage,
        capturedImagesRef,
        galleryLoaded,
        setGalleryLoaded,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}
