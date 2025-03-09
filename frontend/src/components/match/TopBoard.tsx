import { FC } from "react";
import styles from "./match.module.css";

const TopBoard: FC = () => {
  return (
    <div className={styles.topBoard}>
      <div className={styles.notifications}> Notification / Error / Winner</div>
      <button className={styles.exitButton}>Exit</button>
    </div>
  );
};

export default TopBoard;
