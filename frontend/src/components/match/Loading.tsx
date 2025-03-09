import { FC } from "react";
import styles from "./match.module.css";

const Loading: FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Loading, please wait...</p>
    </div>
  );
};

export default Loading;
