import { FC } from "react";
import styles from "./match.module.css";

const TopBoard: FC<{ note: string; exit: boolean }> = ({ note, exit }) => {
  return (
    <div className={styles.topBoard}>
      <div className={styles.notifications}> {note}</div>
      {exit && <button className={styles.exitButton}>Exit</button>}
    </div>
  );
};

export default TopBoard;
