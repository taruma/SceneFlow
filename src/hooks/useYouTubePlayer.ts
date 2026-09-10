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
  const isSeekingWhilePausedRef = useRef<boolean>(false);
  const seekPauseTimeoutRef = useRef<number | null>(null);

  // Reset player instance when video ID changes
  useEffect(() => {
    setPlayer(null);
    isSeekingWhilePausedRef.current = false;
    if (seekPauseTimeoutRef.current) {
      clearTimeout(seekPauseTimeoutRef.current);
      seekPauseTimeoutRef.current = null;
    }
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
    return () => {
      stopTimer();
      if (seekPauseTimeoutRef.current) {
        clearTimeout(seekPauseTimeoutRef.current);
      }
    };
  }, [stopTimer]);

  const onReady: YouTubeProps['onReady'] = useCallback((event) => {
    setPlayer(event.target);
    setPlayerState(event.target.getPlayerState());
  }, []);

  const onStateChange: YouTubeProps['onStateChange'] = useCallback((event) => {
    setPlayerState(event.data);
    if (event.data === 1) { // Playing
      if (isSeekingWhilePausedRef.current) {
        isSeekingWhilePausedRef.current = false;
        if (seekPauseTimeoutRef.current) {
          clearTimeout(seekPauseTimeoutRef.current);
          seekPauseTimeoutRef.current = null;
        }
        player?.pauseVideo();
        return;
      }
      startTimer();
      onPlay?.();
    } else {
      // If buffering (3), extend window slightly so unbuffered chunk loading doesn't autoplay when done
      if (event.data === 3 && isSeekingWhilePausedRef.current) {
        if (seekPauseTimeoutRef.current) clearTimeout(seekPauseTimeoutRef.current);
        seekPauseTimeoutRef.current = window.setTimeout(() => {
          isSeekingWhilePausedRef.current = false;
          seekPauseTimeoutRef.current = null;
        }, 1200);
      } else if (event.data !== 3) {
        isSeekingWhilePausedRef.current = false;
        if (seekPauseTimeoutRef.current) {
          clearTimeout(seekPauseTimeoutRef.current);
          seekPauseTimeoutRef.current = null;
        }
      }
      stopTimer();
      onPause?.();
    }
  }, [startTimer, stopTimer, onPlay, onPause, player]);

  const seekTo = useCallback((seconds: number, allowSeekAhead = true, autoPlay?: boolean) => {
    if (player) {
      const isCurrentlyPlaying = (player.getPlayerState?.() === 1) || playerState === 1;
      const shouldPlay = autoPlay !== undefined ? autoPlay : isCurrentlyPlaying;

      if (!shouldPlay) {
        isSeekingWhilePausedRef.current = true;
        if (seekPauseTimeoutRef.current) {
          clearTimeout(seekPauseTimeoutRef.current);
        }
        // Auto-expire the seek-pause guard after settling so subsequent user play clicks are never blocked
        seekPauseTimeoutRef.current = window.setTimeout(() => {
          isSeekingWhilePausedRef.current = false;
          seekPauseTimeoutRef.current = null;
        }, 600);

        player.pauseVideo();
        player.seekTo(seconds, allowSeekAhead);
        player.pauseVideo();
      } else {
        isSeekingWhilePausedRef.current = false;
        if (seekPauseTimeoutRef.current) {
          clearTimeout(seekPauseTimeoutRef.current);
          seekPauseTimeoutRef.current = null;
        }
        player.seekTo(seconds, allowSeekAhead);
        player.playVideo();
      }
      setCurrentTime(seconds);
    }
  }, [player, playerState]);

  const playVideo = useCallback(() => {
    if (player) {
      isSeekingWhilePausedRef.current = false;
      if (seekPauseTimeoutRef.current) {
        clearTimeout(seekPauseTimeoutRef.current);
        seekPauseTimeoutRef.current = null;
      }
      player.playVideo();
    }
  }, [player]);

  const pauseVideo = useCallback(() => {
    if (player) {
      isSeekingWhilePausedRef.current = false;
      if (seekPauseTimeoutRef.current) {
        clearTimeout(seekPauseTimeoutRef.current);
        seekPauseTimeoutRef.current = null;
      }
      player.pauseVideo();
    }
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (!player) return;
    isSeekingWhilePausedRef.current = false;
    if (seekPauseTimeoutRef.current) {
      clearTimeout(seekPauseTimeoutRef.current);
      seekPauseTimeoutRef.current = null;
    }
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
    seekTo(newTime, true);
  }, [player, seekTo]);

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
