import { Route, Routes } from "react-router-dom";
import { Backdrop } from "./components/Backdrop";
import { Landing } from "./pages/Landing";
import { Room } from "./pages/Room";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <>
      <Backdrop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
