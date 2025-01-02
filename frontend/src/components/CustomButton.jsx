/* eslint-disable react/prop-types */
import React from "react";

const CustomButton = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
  size = "medium",
}) => {
  const baseStyles =
    "flex items-center justify-center rounded-lg font-medium transition-colors";

  const variants = {
    primary:
      "bg-primary hover:bg-primaryVariant text-white disabled:bg-blue-300",
    outline:
      "border border-gray-300 hover:bg-primary text-gray-700 disabled:bg-slate-100",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300",
    success: "bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300",
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;
