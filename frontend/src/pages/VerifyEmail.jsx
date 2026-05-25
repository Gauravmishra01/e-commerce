import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  const verifyEmail = async () => {
    try {
      const res = await api.post(
        "/user/verify",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        setStatus("✅ Email Verified Successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.log(error);
      setStatus(
        "❌ Verification Failed. The token may be invalid or expired. Please try registering again.",
      );
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [token]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#e2e8f0)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
        <h2 className="text-xl font-semibold text-slate-950">{status}</h2>
        <p className="mt-3 text-sm text-slate-500">
          You will be redirected once verification completes.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
