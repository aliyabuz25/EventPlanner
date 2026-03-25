import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

interface HeroVideoPlayerProps {
  src: string;
  poster?: string;
}

const getVimeoEmbedUrl = (src: string) => {
  const match = src.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (!match) {
    return null;
  }

  const videoId = match[1];
  return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0&controls=1`;
};

const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = ({ src, poster }) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const vimeoEmbedUrl = getVimeoEmbedUrl(src);

  useEffect(() => {
    if (vimeoEmbedUrl) {
      return;
    }

    if (!videoElementRef.current) {
      return;
    }

    if (!playerRef.current) {
      playerRef.current = videojs(videoElementRef.current, {
        autoplay: true,
        muted: true,
        loop: true,
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'auto',
        playsinline: true,
        poster,
        sources: [{ src, type: 'video/mp4' }],
      });
      return;
    }

    playerRef.current.poster(poster || '');
    playerRef.current.src([{ src, type: 'video/mp4' }]);
    playerRef.current.load();
  }, [poster, src]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [vimeoEmbedUrl]);

  if (vimeoEmbedUrl) {
    return (
      <div className="hero-video-shell h-full w-full">
        <iframe
          src={vimeoEmbedUrl}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Company showcase video"
        />
      </div>
    );
  }

  return (
    <div data-vjs-player className="hero-video-shell h-full w-full">
      <video
        ref={videoElementRef}
        className="video-js hero-video-js vjs-big-play-centered"
      />
    </div>
  );
};

export default HeroVideoPlayer;
