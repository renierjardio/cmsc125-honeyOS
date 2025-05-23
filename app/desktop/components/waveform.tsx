import React, { useRef, useEffect } from "react";

export function Waveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const draw = () => {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = "transparent";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "hotpink";
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      };

      draw();
    });

    return () => {
      audioCtx.close();
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="absolute top-1/2 -translate-y-1/2 z-0 w-full"
    />
  );
}
