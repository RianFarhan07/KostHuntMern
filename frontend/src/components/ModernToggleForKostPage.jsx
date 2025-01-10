import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const ModernToggleForKostPage = ({
  checked: externalChecked,
  onChange,
  size = "default",
  label,
  disabled = false,
}) => {
  const [internalChecked, setInternalChecked] = useState(externalChecked);

  useEffect(() => {
    setInternalChecked(externalChecked);
  }, [externalChecked]);

  const sizes = {
    small: {
      wrapper: "w-16 h-7",
      circle: "w-5 h-5",
      translate: "translate-x-9",
      icon: "text-xs",
      label: "text-sm",
    },
    default: {
      wrapper: "w-20 h-8",
      circle: "w-6 h-6",
      translate: "translate-x-12",
      icon: "text-sm",
      label: "text-base",
    },
    large: {
      wrapper: "w-24 h-10",
      circle: "w-8 h-8",
      translate: "translate-x-14",
      icon: "text-base",
      label: "text-lg",
    },
  };

  const currentSize = sizes[size];

  const handleToggle = () => {
    if (!disabled) {
      const newValue = !internalChecked;
      setInternalChecked(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`relative flex items-center rounded-full p-1 transition-colors duration-300 ${currentSize.wrapper} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${internalChecked ? "bg-green-500" : "bg-gray-300"} `}
        disabled={disabled}
      >
        <div
          className={`absolute flex items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${currentSize.circle} ${internalChecked ? currentSize.translate : "translate-x-0"} `}
        >
          {internalChecked ? (
            <FaCheck className={`text-green-500 ${currentSize.icon}`} />
          ) : (
            <FaTimes className={`text-gray-400 ${currentSize.icon}`} />
          )}
        </div>
      </button>

      {label && (
        <span className={`font-medium text-gray-700 ${currentSize.label}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ModernToggleForKostPage;
