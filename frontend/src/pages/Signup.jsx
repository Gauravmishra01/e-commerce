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
import api from "@/lib/api";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

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
      const res = await api.post("/user/register", formData);
      if (res.data.success) {
        navigate("/verify");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("Signup Failed:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="premium-chip w-fit">
            <Sparkles className="h-4 w-4" />
            Join Ekart
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
            Create an account that unlocks a cleaner, faster storefront
            experience.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Saved checkout details, order history, and future personalization
            all start here.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              [
                ShieldCheck,
                "Protected profile",
                "Your account data stays secure",
              ],
              [
                ArrowRight,
                "Faster checkout",
                "Repeat orders become effortless",
              ],
            ].map(([BenefitIcon, title, detail]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {React.createElement(BenefitIcon, {
                  className: "h-5 w-5 text-slate-950",
                })}
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {title}
                </p>
                <p className="mt-1 text-sm text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="w-full border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl">Create your account</CardTitle>
            <CardDescription>
              Enter your details to get started.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
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
                    placeholder="Create a password"
                    type={showPassword ? "text" : "password"}
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
            <Button
              onClick={submitHandler}
              type="submit"
              className="w-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Signup"
              )}
            </Button>
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-950 underline underline-offset-4"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
