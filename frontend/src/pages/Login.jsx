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
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#e2e8f0)] px-4">
      <Card className="w-full max-w-sm border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Login to your account</CardTitle>
          <CardDescription>Enter your details to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3">
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
                    className="w-5 h-5 text-gray-700 absolute right-3 top-2 cursor-pointer"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="w-5 h-5 text-gray-700 absolute right-3 top-2 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            onClick={submitHandler}
            className="w-full cursor-pointer bg-red-600 hover:bg-red-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Please wait...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <p className="text-gray-700 text-sm">
            Don't have an account?{" "}
            <Link
              to={"/signup"}
              className="hover:underline cursor-pointer text-red-800"
            >
              Signup
            </Link>
          </p>
          <p className="text-gray-700 text-sm">
            Admin?{" "}
            <Link
              to={"/admin-login"}
              className="hover:underline cursor-pointer text-slate-900 font-medium"
            >
              Go to admin login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
