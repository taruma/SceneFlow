import { useState, useRef, useEffect, useCallback } from 'react';
import type { YouTubeProps } from 'react-youtube';

interface UseYouTubePlayerOptions {
  youtubeId: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export function useYouTubePlayer({ youtubeId, onPlay, onPause }: UseYouTubePlayerOptions) {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Reset player instance when video ID changes
  useEffect(() => {
    setPlayer(null);
  }, [youtubeId]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      if (player) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 100);
  }, [player]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const onReady: YouTubeProps['onReady'] = useCallback((event) => {
    setPlayer(event.target);
    setPlayerState(event.target.getPlayerState());
  }, []);

  const onStateChange: YouTubeProps['onStateChange'] = useCallback((event) => {
    setPlayerState(event.data);
    if (event.data === 1) { // Playing
      startTimer();
      onPlay?.();
    } else {
      stopTimer();
      onPause?.();
    }
  }, [startTimer, stopTimer, onPlay, onPause]);

  const seekTo = useCallback((seconds: number, allowSeekAhead = true) => {
    if (player) {
      player.seekTo(seconds, allowSeekAhead);
      setCurrentTime(seconds);
    }
  }, [player]);

  const playVideo = useCallback(() => {
    if (player) {
      player.playVideo();
    }
  }, [player]);

  const pauseVideo = useCallback(() => {
    if (player) {
      player.pauseVideo();
    }
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (!player) return;
    const currentState = player.getPlayerState();
    if (currentState === 1) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [player]);

  const jumpBy = useCallback((seconds: number) => {
    if (!player) return;
    const newTime = Math.max(0, player.getCurrentTime() + seconds);
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [player]);

  return {
    player,
    playerState,
    currentTime,
    setCurrentTime,
    onReady,
    onStateChange,
    seekTo,
    playVideo,
    pauseVideo,
    togglePlayPause,
    jumpBy,
  };
}
