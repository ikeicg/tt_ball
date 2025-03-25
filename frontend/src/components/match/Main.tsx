import { FC, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import TopBoard from "./TopBoard";
import PlaySection from "./PlaySection";
import styles from "./match.module.css";
import useGameStore from "../../utils/store";

const SERVER_URL = "http://localhost:5050/match";

const Main: FC = () => {
  const matchSocketRef = useRef<Socket | null>(null);
  const { setMatch } = useGameStore();
  const { matchId } = useParams();
  // const [notification, setNotification] = useState<string>("");

  const playername: string = localStorage.getItem("stored_name") || "anon";

  useEffect(() => {
    if (!matchId) return;

    if (!matchSocketRef.current) {
      const socket = io(SERVER_URL);

      matchSocketRef.current = socket;

      socket.emit("join_match", { name: playername, matchId });

      socket.on("start_match", (matchState) => {
        setMatch(matchState);
      });

      // socket.on("notification", (message: string) => {
      //   setNotification(message);
      // });

      return () => {
        socket.disconnect();
        matchSocketRef.current = null;
      };
    }
  }, [matchId, playername, setMatch]);

  return (
    <div className={styles.mainContainer}>
      <TopBoard note={"Game Stage and Score"} exit={true} />
      <TopBoard note={"In Game Prompts and Notifications"} exit={false} />
      <PlaySection />
    </div>
  );
};

export default Main;
