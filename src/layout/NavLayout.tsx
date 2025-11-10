import { Outlet } from "react-router-dom";
import Nav from "../layout/Nav";

export default function NavLayout() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}
