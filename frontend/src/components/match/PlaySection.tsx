import { FC } from "react";
import Canvas from "./Canvas";

const PlaySection: FC = () => {
  return (
    <>
      <Canvas />
      // I want a power tab used by player to guage intensity of their play, it
      is displayed only when a particular acton is made on the canvas
    </>
  );
};

export default PlaySection;
