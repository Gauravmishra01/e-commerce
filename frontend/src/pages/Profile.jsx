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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#e2e8f0)] px-4 pb-16 pt-24">
      <Tabs defaultValue="profile" className="mx-auto max-w-7xl items-center">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* -------------------- PROFILE TAB -------------------- */}
        <TabsContent value="profile">
          <div className="flex flex-col justify-center items-center">
            <h1 className="font-bold mb-7 text-2xl text-gray-800">
              Update Profile
            </h1>

            <div className="w-full flex gap-10 justify-between items-start px-7 max-w-screen-2xl">
              {/* ---------- PROFILE PHOTO ---------- */}
              <Card className="flex flex-col items-center p-6 w-72">
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <img
                    src={updateUser.profilePic}
                    alt="profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-800"
                  />

                  <Label
                    htmlFor="profilePic"
                    className="mt-4 cursor-pointer bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Change Picture
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

              {/* ---------- PROFILE FORM ---------- */}
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
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

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-60"
                      >
                        {loading ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* -------------------- PASSWORD TAB -------------------- */}
        <TabsContent value="security">
          <div className="max-w-2xl mx-auto p-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
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
                  <Button
                    type="submit"
                    className="bg-slate-950 text-white hover:bg-slate-800"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
