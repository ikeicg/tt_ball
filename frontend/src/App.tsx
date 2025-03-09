import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Match from "./pages/Match";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:matchId" element={<Match />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
