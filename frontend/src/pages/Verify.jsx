import React from "react";

const Verify = () => {
  return (
    <div className="relative w-full h-[760px] overflow-hidden">
      <div className="min-h-screen flex items-center justify-center bg-red-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-green-500 mb-4">
            ✅ Check your Email
          </h2>
          <p className="text-gray-400 text-sm">
            We've sent a verification email to your inbox. Please check it and
            click the link to complete your registration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
