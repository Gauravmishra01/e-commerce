import { ShoppingCart } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../button";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { setCart } from "@/redux/productsSlice";
import api from "@/lib/api";

const Navbar = () => {
  const { user } = useSelector((store) => store.user);
  const { cart } = useSelector((store) => store.product);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ FORCE LOGOUT EVEN IF TOKEN IS EXPIRED
  const logoutHandler = async () => {
    try {
      await api.post("/user/logout", {});
    } catch (error) {
      // Ignore backend error — still logout safely
      console.log("Backend logout failed, forcing frontend logout");
    } finally {
      // ✅ ALWAYS CLEAR SESSION (IMPORTANT)
      localStorage.removeItem("accessToken");
      dispatch(setUser(null));
      dispatch(setCart(null));
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const resolvedUserId = user?._id || user?.id;
  const cartCount = cart?.items?.length || 0;

  return (
    <header className="fixed z-20 w-full border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/Ekart.png" alt="Ekart" className="w-[92px]" />
          <span className="hidden text-xs font-medium uppercase tracking-[0.3em] text-slate-500 md:inline">
            Premium commerce
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-4 lg:gap-8">
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700 lg:gap-7 lg:text-base">
            <Link to="/" className="transition hover:text-slate-950">
              <li>Home</li>
            </Link>

            <Link to="/products" className="transition hover:text-slate-950">
              <li>Products</li>
            </Link>

            {user?.role === "admin" ? (
              <Link to="/admin" className="transition hover:text-slate-950">
                <li>Admin</li>
              </Link>
            ) : null}

            {resolvedUserId ? (
              <Link
                to={`/profile/${resolvedUserId}`}
                className="transition hover:text-slate-950"
              >
                <li>Hello, {user?.firstName}</li>
              </Link>
            ) : (
              <Link to="/login" className="transition hover:text-slate-950">
                <li>Login</li>
              </Link>
            )}
          </ul>

          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {/* ✅ AUTH BUTTON */}
          {resolvedUserId ? (
            <Button
              onClick={logoutHandler}
              className="cursor-pointer bg-slate-950 text-white hover:bg-slate-800"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="cursor-pointer bg-slate-950 text-white hover:bg-slate-800"
            >
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
