import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./match.module.css";
import useGameStore from "../../utils/store";
import { Socket } from "socket.io-client";

const TopBoard: FC<{
  note: string;
  exit: boolean;
  socketRef?: React.MutableRefObject<Socket | null>;
}> = ({ note, exit, socketRef }) => {
  const navigate = useNavigate();
  const { reset: resetGameStore } = useGameStore();

  const handleExit = () => {
    // Disconnect socket
    if (socketRef?.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    resetGameStore();

    navigate("/");
  };

  return (
    <div className={styles.topBoard}>
      <div className={styles.notifications}>{note}</div>
      {exit && (
        <button className={styles.exitButton} onClick={handleExit}>
          Exit
        </button>
      )}
    </div>
  );
};

export default TopBoard;
