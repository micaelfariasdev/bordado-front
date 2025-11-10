import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import Home from "./home.tsx";
import LoginPage from "./login.tsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
