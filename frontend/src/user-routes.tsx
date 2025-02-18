import { lazy } from "react";
import { RouteObject } from "react-router";

const App = lazy(() => import("./pages/App.tsx"));

export const userRoutes: RouteObject[] = [
	{ path: "/", element: <App />},
];