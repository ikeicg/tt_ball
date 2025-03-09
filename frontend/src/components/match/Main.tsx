import { FC } from "react";
import TopBoard from "./TopBoard";
import PlaySection from "./PlaySection";
import styles from "./match.module.css";

const Main: FC = () => {
  return (
    <>
      <div className={styles.mainContainer}>
        <TopBoard />
        <PlaySection />
      </div>
    </>
  );
};

export default Main;
