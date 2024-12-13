import React from "react";
import { FaGoogle } from "react-icons/fa";

const handleGoogleSignUp = () => {
  try {
    console.log("Google Sign-up clicked");
  } catch (error) {
    console.log(error.message || "Google" + error);

    setMessage("Google sign-up failde. please try again.");
  }
};

const Oauth = () => {
  return (
    <div className="relative">
      <FaGoogle className="absolute left-4 top-1/2 -translate-y-1/2 transform text-white" />
      <button
        onClick={handleGoogleSignUp}
        type="button"
        className="flex w-full items-center justify-center rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600 focus:outline-none"
      >
        Continue with google
      </button>
    </div>
  );
};

export default Oauth;
