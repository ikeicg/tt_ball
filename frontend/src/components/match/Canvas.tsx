import { FC, useRef, useEffect } from "react";

import styles from "./match.module.css";

const Canvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // draw function

  //sizing the canvas and drawing background
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !canvasContainer) return;

    const drawBackground = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isPortrait = window.innerHeight > window.innerWidth; // Directly calculate

      ctx.fillStyle = "#D6643B";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000";
      if (!isPortrait) {
        ctx.fillRect(0, 0, canvas.width * 0.05, canvas.height);
        ctx.fillRect(canvas.width * 0.95, 0, canvas.width, canvas.height);
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.05);
        ctx.fillRect(0, canvas.height * 0.95, canvas.width, canvas.height);
      }
    };

    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;

      canvasContainer.style.width = "90%";
      canvasContainer.style.height = isPortrait ? "80%" : "75%";

      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;

      drawBackground(canvas);
    };

    // Initial call to set size and background
    handleResize();

    // Listen for window resize event
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []); // Removed `isPortrait` dependency to avoid unnecessary renders

  // drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();

    // Flip coordinate system upside down
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    //draw the game play here
    // ...

    ctx.restore();
  });

  return (
    <>
      <div ref={canvasContainerRef} className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.gameCanvas}></canvas>
      </div>
    </>
  );
};

export default Canvas;
