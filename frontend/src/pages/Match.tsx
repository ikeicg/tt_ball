import { FC, useEffect, useState } from "react";
import Main from "../components/match/Main";
import Loading from "../components/match/Loading";

const Match: FC = () => {
  const [stateLoaded, setStateLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setStateLoaded(true), 1000); // 1 seconds
  }, []);

  return <>{!stateLoaded ? <Loading /> : <Main />}</>;
};

export default Match;
