import WindowScreen from "../desktop/components/window";
import React from "react";
import { WindowProps } from "@/app/types";
import { FaSpotify } from "react-icons/fa6";
import useFont from "@/hooks/useFont";

export default function Spotify({ windowIndex }: WindowProps) {
  const { montserrat } = useFont();
  return (
    <WindowScreen
      name="Spotify"
      windowIndex={windowIndex}
      icon={<FaSpotify size={25} color={"yellow"} />}
    >
      <iframe
        className="rounded-lg"
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DX5CHJY6ZqPPz?utm_source=generator"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </WindowScreen>
  );
}
