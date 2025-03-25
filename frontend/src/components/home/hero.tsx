import { FC, useEffect, useRef, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";

import styles from "./hero.module.css";

const SERVER_URL = "http://localhost:5050/lobby";

const HomeHero: FC = () => {
  const [storedName, setStoredName] = useState<string | null>(
    localStorage.getItem("stored_name")
  );
  const [matching, setMatching] = useState<boolean>(false);
  const navigate = useNavigate();

  const lobbySocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!lobbySocketRef.current) {
      const socket = io(SERVER_URL);

      if (!socket) return;
      lobbySocketRef.current = socket;

      socket.on("start_match", ({ matchId }) => {
        setMatching(false);
        navigate(`/match/${matchId}`);
      });
      return () => {
        socket.disconnect();
        lobbySocketRef.current = null;
      };
    }
  }, [navigate]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const name: string = event.target.value;
    setStoredName(name);
    localStorage.setItem("stored_name", name);
  }

  function handleJoinMatch(): void {
    setMatching(true);
    lobbySocketRef.current?.emit("join_match", { name: storedName || "anon" });
  }

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>TTBALL</h1>

      <input
        className={styles.input}
        type="text"
        placeholder="Your Player Name"
        value={storedName || ""}
        onChange={handleInputChange}
      />

      <button className={styles.button} onClick={handleJoinMatch}>
        Join A Match
      </button>

      {matching && <p className={styles.status}>Looking for a match...</p>}
    </section>
  );
};

export default HomeHero;
