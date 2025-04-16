import { FC, useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import TopBoard from "./TopBoard";
import PlaySection from "./PlaySection";
import styles from "./match.module.css";
import useGameStore from "../../utils/store";
import { extractGameInfo } from "../../utils/helpers";

const SERVER_URL = "http://localhost:5050/match";

const Main: FC = () => {
  const matchSocketRef = useRef<Socket | null>(null);
  const { match, message, setMatch, setMessage } = useGameStore();
  const { matchId } = useParams();
  const [notification, setNotification] = useState<string>("");
  const [scoreBoard, setScoreBoard] = useState<string>("");

  const playername: string = localStorage.getItem("stored_name") || "anon";

  useEffect(() => {
    if (!matchId || matchSocketRef.current || matchId == "test") return;
    // remove "test" flag later and protect routes

    const socket = io(SERVER_URL);
    matchSocketRef.current = socket;

    socket.emit("join_match", { name: playername, matchId });

    socket.on("start_match", (matchState) => {
      console.log("Match started:", matchState);
      setMatch(matchState);
    });

    socket.on("notification", (data: { msg: string }) => {
      setMessage(data.msg);
    });

    return () => {
      socket.disconnect();
      matchSocketRef.current = null;
    };
  }, [matchId, playername, setMatch]);

  // set notifications
  useEffect(() => {
    if (!match || match?.id !== matchId) return;

    const gameInfo = extractGameInfo(match);
    if (gameInfo) {
      setNotification(gameInfo.notification);
      setScoreBoard(gameInfo.scoreboard);
    }
  }, [match, matchId]);

  useEffect(() => {
    if (message) {
      setNotification(message);
    }
  }, [message]);

  const memoizedPlaySection = useMemo(() => <PlaySection />, [match]);

  return (
    <div className={styles.mainContainer}>
      <TopBoard note={scoreBoard} exit={true} />
      <TopBoard note={notification} exit={false} />
      {memoizedPlaySection}
    </div>
  );
};

export default Main;
