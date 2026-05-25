import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#e2e8f0)] px-4">
      <Card className="w-full max-w-sm border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white">
            <Shield className="h-4 w-4" /> Admin access
          </div>
          <CardTitle className="text-2xl">Sign in to admin panel</CardTitle>
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
                  className="absolute right-3 top-2 h-5 w-5 cursor-pointer text-gray-700"
                />
              ) : (
                <Eye
                  onClick={() => setShowPassword(true)}
                  className="absolute right-3 top-2 h-5 w-5 cursor-pointer text-gray-700"
                />
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            onClick={submitHandler}
            className="w-full bg-slate-950 text-white hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Login as admin"
            )}
          </Button>
          <p className="text-sm text-slate-500">
            Need customer access instead?{" "}
            <Link
              to="/login"
              className="font-medium text-slate-950 underline underline-offset-4"
            >
              Use the regular login page
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
