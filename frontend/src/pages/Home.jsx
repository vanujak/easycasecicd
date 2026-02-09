import { useEffect, useRef } from "react";
import NavbarHome from "../components/NavbarHome.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Improves autoplay reliability on mobile browsers.
    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        // Ignore autoplay rejections; browser/user settings may block it.
      }
    };

    tryPlay();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          data-testid="home-background-video"
          className="h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero-1.jpg"
        >
          <source src="/easycase_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <NavbarHome />
      <main className="mx-auto max-w-6xl px-6 py-16 flex-1 w-full">
        <h1 className="text-4xl font-bold text-white">Welcome to EasyCase</h1>
        <p className="mt-2 text-white/90">Your trusted case management system</p>
      </main>
      <Footer />
    </div>
  );
}
