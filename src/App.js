import { Suspense, useEffect, useState, forwardRef, useRef } from "react";
import { ARAnchor, ARView } from "react-three-mind";
import { useVideoTexture, useTexture } from "@react-three/drei";

import mind from "./assets/target.mind";
import videoUrl from "./assets/video.mp4";
import fallbackURL from "./assets/target.png";

function PlaneBox(props) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 0.5625, 0.3]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

const Plane = forwardRef(function Plane(props, ref) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 0.5625, 0.001]} />
      <Suspense fallback={<FallbackMaterial url={fallbackURL} />}>
        <VideoMaterial url={videoUrl} ref={ref} />
      </Suspense>
    </mesh>
  );
});

const VideoMaterial = forwardRef(function VideoMaterial({ url }, ref) {
  const props = {
    // unsuspend: "canplay",
    // crossOrigin: "Anonymous",
    // muted: true,
    // // loop: true,
    // playsInline: true,
  };
  const texture = useVideoTexture(url, props);
  ref.current = texture.image;
  return <meshBasicMaterial map={texture} toneMapped={false} />;
});

function FallbackMaterial({ url }) {
  const texture = useTexture(url);
  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

function App() {
  const [clicked, setClicked] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current?.paused) {
      setShowPlay(true);
    }
  }, [videoRef]);

  const togglePlay = () => {
    videoRef.current.play();
    setShowPlay(false);
  };
  const toggleSound = () => {
    if (!clicked) setClicked(true);
    videoRef.current.muted = !videoRef.current.muted;
    if (videoRef.current.paused) videoRef.current.play();
  };

  const handleAnchorFound = () => {
    if (clicked) {
      videoRef.current.play();
    }
  };

  const handleAnchorLost = () => {
    if (clicked) {
      videoRef.current.pause();
    }
  };

  return (
    <>
      <div className="button-container">
        <button onClick={() => (showPlay ? togglePlay() : toggleSound())}>
          {showPlay ? "play" : "sound"}
        </button>
      </div>

      <ARView
        imageTargets={mind}
        filterMinCF={1}
        filterBeta={10000}
        missTolerance={0}
        warmupTolerance={0}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <ARAnchor
          target={0}
          onAnchorFound={() => handleAnchorFound()} // Callback invoked when anchor was found
          onAnchorLost={() => handleAnchorLost()} // Callback invoked when previously found anchor was lost>
        >
          <PlaneBox position={[0, 0, 0.15]} />
          <Plane position={[0, 0, 0.3]} ref={videoRef} />
        </ARAnchor>
      </ARView>
    </>
  );
}

export default App;
