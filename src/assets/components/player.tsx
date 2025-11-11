import { useRef, useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => audioRef.current?.play();
  const handlePause = () => audioRef.current?.pause();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const newProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(newProgress);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * audio.duration;
    audio.currentTime = newTime;
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      className="bg-gray-200 p-1 rounded h-10 size-full mb-3 flex justify-center"
    >
      <audio ref={audioRef} src={src}></audio>
      <IconButton sx={{ width: 10, height: 10, p:1 }} onClick={handlePlay}>
        <PlayArrowIcon />
      </IconButton>

      <div
        className="rounded h-2 bg-gray-700 w-full relative cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="bg-blue-500 h-2 rounded absolute top-0 left-0 transition-all duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <IconButton sx={{ width: 10, height: 10, p:1 }} onClick={handlePause}>
        <PauseIcon />
      </IconButton>
    </Box>
  );
}
