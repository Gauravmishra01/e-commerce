import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Menu, Search, ShoppingCart, X } from "lucide-react";

import { Button } from "../button";
import { Input } from "../input";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import { setCart } from "@/redux/productsSlice";
import api from "@/lib/api";

const Navbar = () => {
  const { user } = useSelector((store) => store.user);
  const { cart } = useSelector((store) => store.product);
  const { products } = useSelector((store) => store.product);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const categoryLinks = React.useMemo(() => {
    return [
      ...new Set((products || []).map((item) => item.category).filter(Boolean)),
    ]
      .slice(0, 6)
      .map((item) => ({ label: item, value: item.toLowerCase() }));
  }, [products]);

  const searchSuggestions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return (products || []).slice(0, 5);
    }

    return (products || [])
      .filter((item) => item.productName?.toLowerCase().includes(term))
      .slice(0, 5);
  }, [products, searchTerm]);

  // ✅ FORCE LOGOUT EVEN IF TOKEN IS EXPIRED
  const logoutHandler = async () => {
    try {
      await api.post("/user/logout", {});
    } catch {
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

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    navigate(`/products?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 lg:px-0">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/ekart-logo.svg"
              alt="Ekart premium e-commerce logo"
              className="h-12 w-auto drop-shadow-sm md:h-14"
            />
          </Link>

          <form
            onSubmit={submitSearch}
            className="relative hidden min-w-0 flex-1 max-w-2xl lg:block"
          >
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products, brands, categories"
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
            </div>

            {searchTerm.trim() ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white/96 p-2 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Suggestions
                </div>
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        setSearchTerm(item.productName || "");
                        navigate(
                          `/products?q=${encodeURIComponent(item.productName || "")}`,
                        );
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100"
                    >
                      <img
                        src={item.productImg?.[0]?.url || "/Ekart.png"}
                        alt={item.productName || "Product"}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.category || "Curated selection"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-500">
                    No matches found.
                  </p>
                )}
              </div>
            ) : null}
          </form>

          <nav className="hidden items-center gap-2 lg:flex">
            <div className="group relative">
              <button className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                Categories <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute right-0 top-[calc(100%+0.75rem)] w-[340px] translate-y-2 rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid gap-2 sm:grid-cols-2">
                  {categoryLinks.length > 0 ? (
                    categoryLinks.map((category) => (
                      <Link
                        key={category.value}
                        to={`/products?category=${encodeURIComponent(category.value)}`}
                        className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                      >
                        {category.label}
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                      Category navigation appears when products load.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/products"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Shop
            </Link>
            {user?.role === "admin" ? (
              <Link
                to="/admin"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Admin
              </Link>
            ) : null}
            {resolvedUserId ? (
              <Link
                to={`/profile/${resolvedUserId}`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Account
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Login
              </Link>
            )}

            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {resolvedUserId ? (
              <Button onClick={logoutHandler} className="ml-1">
                Logout
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")} className="ml-1">
                Get started
              </Button>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen ? (
          <div className="pb-4 lg:hidden">
            <div className="premium-surface rounded-[1.75rem] border border-slate-200 p-4">
              <form onSubmit={submitSearch} className="mb-4">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search the catalog"
                    className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </form>

              <div className="grid gap-2 text-sm font-medium text-slate-700">
                <Link
                  to="/"
                  className="rounded-2xl px-3 py-3 transition hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="rounded-2xl px-3 py-3 transition hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/cart"
                  className="rounded-2xl px-3 py-3 transition hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Cart
                </Link>
                {resolvedUserId ? (
                  <Link
                    to={`/profile/${resolvedUserId}`}
                    className="rounded-2xl px-3 py-3 transition hover:bg-slate-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-2xl px-3 py-3 transition hover:bg-slate-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Link
                  to="/cart"
                  className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
                {resolvedUserId ? (
                  <Button onClick={logoutHandler} className="flex-1">
                    Logout
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/login")} className="flex-1">
                    Get started
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
