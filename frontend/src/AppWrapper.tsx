import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function AppWrapper() {
  return <RouterProvider router={router} />
}

export default AppWrapper
