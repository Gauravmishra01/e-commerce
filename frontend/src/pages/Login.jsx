import React, { useState } from "react";
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
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import api from "@/lib/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await api.post("/user/login", formData);

      if (res.data.success) {
        dispatch(setUser(res.data.user)); // Update Redux first
        localStorage.setItem("accessToken", res.data.accessToken); // Then store token
        toast.success("Login successful!");
        navigate("/"); // Now go to home
      }
    } catch (error) {
      console.log("Login Failed:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-950 bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
          <div className="premium-chip w-fit border-white/10 bg-white/10 text-white/80">
            <Sparkles className="h-4 w-4" />
            Welcome back
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
            Sign in to a faster, more curated shopping journey.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Your account keeps checkout, orders, and saved preferences in one
            polished experience.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "Secure session", "Protected account access"],
              [
                ArrowRight,
                "Faster checkout",
                "Fewer steps to complete an order",
              ],
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

        <Card className="w-full border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl">Login to your account</CardTitle>
            <CardDescription>
              Enter your details to continue shopping.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button onClick={submitHandler} className="w-full cursor-pointer">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-slate-950 underline underline-offset-4"
              >
                Signup
              </Link>
            </p>
            <p className="text-sm text-slate-600">
              Admin?{" "}
              <Link
                to="/admin-login"
                className="font-semibold text-slate-950 underline underline-offset-4"
              >
                Go to admin login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
