import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { setUser } from "@/redux/userSlice";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const { user } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/user/login", formData);
      if (res.data.success && res.data.user?.role === "admin") {
        dispatch(setUser(res.data.user));
        localStorage.setItem("accessToken", res.data.accessToken);
        toast.success("Admin login successful");
        navigate("/admin");
        return;
      }

      toast.error("Admin access required");
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
          <div className="premium-chip w-fit border-white/10 bg-white/10 text-white/80">
            <ShieldCheck className="h-4 w-4" />
            Admin access
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
            Manage the platform with a calmer, more premium control room.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Orders, products, coupons, and content are easier to manage when the
            interface feels structured and efficient.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              [Shield, "Secure access", "Restricted to admins only"],
              [ArrowRight, "Faster workflows", "Clear actions and dashboards"],
            ].map(([BenefitIcon, title, detail]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                {React.createElement(BenefitIcon, {
                  className: "h-5 w-5 text-white/80",
                })}
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-white/65">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="w-full max-w-xl border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <CardHeader>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white">
              <Sparkles className="h-4 w-4" /> Admin access
            </div>
            <CardTitle className="text-3xl">Sign in to admin panel</CardTitle>
            <CardDescription>
              Use an administrator account to manage the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Admin email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500"
                  />
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button
              onClick={submitHandler}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Login as admin"
              )}
            </Button>
            <p className="text-sm text-slate-600">
              Need customer access instead?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-950 underline underline-offset-4"
              >
                Use the regular login page
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
