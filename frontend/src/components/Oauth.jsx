import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from "react";
import { FaGoogle } from "react-icons/fa";
import { auth } from "../firebase/firebase.config";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

const Oauth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      const data = await response.json();
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      console.log(error.message || "Google" + error);
    }
  };
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
