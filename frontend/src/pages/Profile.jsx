import React, { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import api from "@/lib/api";
import { ShieldCheck, UserCircle2 } from "lucide-react";

const Profile = () => {
  const { user } = useSelector((store) => store.user);
  const { userId } = useParams();
  const dispatch = useDispatch();
  const activeUserId = userId || user?._id || user?.id;

  const [loading, setLoading] = useState(false); // ✅ LOADING STATE

  const [updateUser, setUpdateUser] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
    profilePic: user?.profilePic || "/dummy.png",
    role: user?.role || "user",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [file, setFile] = useState(null);

  React.useEffect(() => {
    if (!user) return;

    setUpdateUser({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || user?.phoneNo || "",
      address: Array.isArray(user?.address)
        ? user.address.join(", ")
        : user?.address || "",
      city: user?.city || "",
      zipCode: user?.zipCode || "",
      profilePic: user?.profilePic || "/dummy.png",
      role: user?.role || "user",
    });
  }, [user]);

  // ✅ TEXT INPUT CHANGE
  const handleChange = (e) => {
    setUpdateUser({ ...updateUser, [e.target.name]: e.target.value });
  };

  // ✅ FILE CHANGE
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUpdateUser({
      ...updateUser,
      profilePic: URL.createObjectURL(selectedFile),
    });
  };

  // ✅ SUBMIT HANDLER WITH LOADING
  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("You are not logged in");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("firstName", updateUser.firstName);
      formData.append("lastName", updateUser.lastName);
      formData.append("email", updateUser.email);
      formData.append("phoneNumber", updateUser.phoneNumber);
      formData.append("address", updateUser.address);
      formData.append("city", updateUser.city);
      formData.append("zipCode", updateUser.zipCode);
      formData.append("role", updateUser.role);

      if (file) {
        formData.append("file", file);
      }

      const res = await api.put(`/user/update/${activeUserId}`, formData, {});

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setUser(res.data.user));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error("You are not logged in");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/user/change-password/${user.email}`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-16 pt-28 lg:px-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(71,85,105,0.9))] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">
              Account center
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              Your profile, preferences, and security controls in one place.
            </h1>
            <div className="mt-6 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <img
                src={updateUser.profilePic}
                alt="profile"
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <p className="text-lg font-semibold">
                  {updateUser.firstName || "Your account"}
                </p>
                <p className="text-sm text-white/65">
                  {updateUser.email || user?.email}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/75">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <UserCircle2 className="h-5 w-5 text-white/80" />
                <p className="mt-3 font-semibold text-white">Profile details</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="h-5 w-5 text-white/80" />
                <p className="mt-3 font-semibold text-white">Security</p>
              </div>
            </div>
          </div>

          <Tabs
            defaultValue="profile"
            className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-100 p-1">
              <TabsTrigger value="profile" className="rounded-full">
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-full">
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
                <Card className="border border-white/70 bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-2xl">Profile photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <img
                      src={updateUser.profilePic}
                      alt="profile"
                      className="h-36 w-36 rounded-full object-cover shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-4 ring-white"
                    />

                    <Label
                      htmlFor="profilePic"
                      className="mt-5 cursor-pointer rounded-full bg-slate-950 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Change picture
                    </Label>

                    <input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                <Card className="border border-white/70 bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Personal information
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            name="firstName"
                            value={updateUser.firstName}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label>Last Name</Label>
                          <Input
                            name="lastName"
                            value={updateUser.lastName}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label>Email</Label>
                          <Input value={updateUser.email} disabled />
                        </div>

                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            name="phoneNumber"
                            value={updateUser.phoneNumber}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label>Address</Label>
                          <Input
                            name="address"
                            value={updateUser.address}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label>City</Label>
                          <Input
                            name="city"
                            value={updateUser.city}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label>Zip Code</Label>
                          <Input
                            name="zipCode"
                            value={updateUser.zipCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Updating..." : "Update profile"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card className="border border-white/70 bg-white/90">
                <CardHeader>
                  <CardTitle className="text-2xl">Change password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="grid gap-4">
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
