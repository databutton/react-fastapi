import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export const AppWrapper = () => {
  return <RouterProvider router={router} />
}
