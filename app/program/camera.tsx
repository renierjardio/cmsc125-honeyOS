import Window from "@/app/desktop/components/window";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaCamera } from "react-icons/fa";
import { WindowProps } from "@/app/types";
import Image from "next/image";

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
              />
              <Image
                src="/revisedHoneyOS/openGalleryButton.png"
                alt="Open Gallery"
                width={56}
                height={56}
                onClick={() => setShowGallery(true)}
                className="cursor-pointer hover:opacity-80 active:scale-90 transition-all duration-150"
              />
            </div>
          </>
        ) : (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full overflow-y-auto rounded-lg p-2"
              style={{ maxHeight: "500px" }}
            >
              {capturedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative w-full pb-[75%] rounded-lg overflow-hidden" 
                >
                  <Image
                    src={img}
                    alt={`Captured ${index}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
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
            />
          </>
        )}
      </div>
    </Window>
  );
}
