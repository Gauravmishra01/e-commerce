import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import VerifyEmail from "./pages/VerifyEmail";
import Footer from "./components/ui/Footer";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./lib/api";
import { setUser } from "./redux/userSlice";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Home />
        <Footer />
      </>
    ),
  },

  {
    path: "/signup",
    element: (
      <>
        <Signup />
      </>
    ),
  },

  {
    path: "/login",
    element: (
      <>
        <Login />
      </>
    ),
  },
  {
    path: "/verify",
    element: (
      <>
        <Verify />
      </>
    ),
  },
  {
    path: "/verify/:token",
    element: (
      <>
        <VerifyEmail />
      </>
    ),
  },
  {
    path: "/profile/:userId",
    element: (
      <>
        <Navbar />
        <Profile />
      </>
    ),
  },
  {
    path: "/products",
    element: (
      <>
        <Navbar />
        <Products />
      </>
    ),
  },
  {
    path: "/cart",
    element: (
      <>
        <Navbar />
        <Cart />
      </>
    ),
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    element: (
      <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin-login" />
    ),
    children: [
      {
        path: "/admin",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin/:section",
        element: <AdminDashboardPage />,
      },
    ],
  },
]);

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);

  React.useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token || user) return;

      try {
        const res = await api.get("/user/me");
        if (res.data?.success && res.data?.user) {
          dispatch(setUser(res.data.user));
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem("accessToken");
        dispatch(setUser(null));
      }
    };

    restoreSession();
  }, [dispatch, user]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
