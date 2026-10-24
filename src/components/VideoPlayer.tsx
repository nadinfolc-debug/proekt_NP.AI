import { useEffect, useRef, useState } from "react";
import type { VideoMedia } from "../data/projects";
import { Picture } from "./Media";

export function VideoPlayer({ video }: { video: VideoMedia }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !active) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting && !node.paused) node.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  if (!active) {
    return (
      <button type="button" className="video-launch" onClick={() => setActive(true)}>
        <Picture
          image={{
            kind: "image",
            webp: video.posterWebp,
            jpg: video.posterJpg,
            width: video.width,
            height: video.height,
            alt: "",
          }}
          priority
        />
        <span>Смотреть ролик</span>
      </button>
    );
  }

  return (
    <div className="video-shell">
      <video
        ref={ref}
        src={video.src}
        poster={video.posterJpg}
        width={video.width}
        height={video.height}
        controls
        playsInline
        muted
        autoPlay
        preload="none"
        aria-label={video.label}
      />
      <p className="video-note">Звук выключен. Включите его в плеере, если нужно.</p>
    </div>
  );
}
