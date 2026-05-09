import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import Dashboard from "@/pages/Dashboard";
import GoalJars from "@/pages/GoalJars";
import Wrapped from "@/pages/Wrapped";
import Insights from "@/pages/Insights";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import FutureVision from "@/pages/FutureVision";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      { index: true,        element: <Dashboard /> },
      { path: "jars",       element: <GoalJars /> },
      { path: "insights",   element: <Insights /> },
      { path: "wrapped",    element: <Wrapped /> },
      { path: "profile",    element: <Profile /> },
      { path: "settings",   element: <Settings /> },
      { path: "future",     element: <FutureVision /> },
      { path: "*",          element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
