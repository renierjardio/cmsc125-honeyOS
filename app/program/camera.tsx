import Window from "@/app/desktop/components/window";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaCamera } from "react-icons/fa";
import { WindowProps } from "@/app/types";

export default function Camera({ windowIndex }: WindowProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImages([...capturedImages, imageSrc]);
    }
  };

  const videoConstraints = {
    facingMode: "user",
  };

  return (
    <Window
      name="Camera"
      windowIndex={windowIndex}
      icon={<FaCamera size={25} color={"yellow"} />}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {!showGallery ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              className="w-full h-auto rounded-lg"
              videoConstraints={videoConstraints}
            />
            <div className="flex gap-4">
              <img
                src="/public/revisedHoneyOS/snapPhotoButton.png"
                alt="Capture"
                onClick={captureImage}
                className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
              />
              <img
                src="/openGalleryButton.png"
                alt="Open Gallery"
                onClick={() => setShowGallery(true)}
                className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 w-full max-h-[400px] overflow-y-auto">
              {capturedImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Captured ${index}`}
                  className="rounded-lg w-full"
                />
              ))}
            </div>
            <button
              onClick={() => setShowGallery(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
            >
              Back to Camera
            </button>
          </>
        )}
      </div>
    </Window>
  );
}
