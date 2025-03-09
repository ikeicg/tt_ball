import { FC, useEffect, useState } from "react";
import Main from "../components/match/Main";
import Loading from "../components/match/Loading";

const Match: FC = () => {
  const [stateLoaded, setStateLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setStateLoaded(true), 2000); // 2 seconds
  }, []);

  return <>{!stateLoaded ? <Loading /> : <Main />}</>;
};

export default Match;
