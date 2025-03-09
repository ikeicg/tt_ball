import { FC, useRef, useEffect } from "react";

import styles from "./match.module.css";

const Canvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      console.log("Canvas height:", canvasRef.current.height);
      console.log("Canvas width:", canvasRef.current.width);
    }
  }, []);

  return (
    <>
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.gameCanvas}></canvas>
      </div>
    </>
  );
};

export default Canvas;
