// The YouTube IFrame player methods SceneFlow calls; createVideoElementPlayer adapts a <video> to them.
export interface MediaPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
}

export function createVideoElementPlayer(video: HTMLVideoElement): MediaPlayer {
  return {
    // play() rejects when a pause interrupts it; an unplayable file is reported by the error event
    playVideo: () => {
      video.play().catch(() => {});
    },
    pauseVideo: () => video.pause(),
    seekTo: (seconds) => {
      video.currentTime = seconds;
    },
    getCurrentTime: () => video.currentTime,
    getDuration: () => video.duration,
    // YouTube state codes: 0 ended, 1 playing, 2 paused
    getPlayerState: () => (video.ended ? 0 : video.paused ? 2 : 1),
  };
}
