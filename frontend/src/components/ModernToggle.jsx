import React, { useState, useEffect } from "react";
import ReactSwitch from "react-switch";
import { motion, AnimatePresence } from "framer-motion";

const AnimatedSwitch = ({
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
      width: 36,
      height: 20,
      handleDiameter: 14,
      label: "text-sm",
    },
    default: {
      width: 48,
      height: 24,
      handleDiameter: 18,
      label: "text-base",
    },
    large: {
      width: 56,
      height: 28,
      handleDiameter: 22,
      label: "text-lg",
    },
  };

  const currentSize = sizes[size];

  const handleChange = (newValue) => {
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center gap-3">
      <ReactSwitch
        checked={internalChecked}
        onChange={handleChange}
        disabled={disabled}
        width={currentSize.width}
        height={currentSize.height}
        handleDiameter={currentSize.handleDiameter}
        offColor="#cbd5e1"
        onColor="#ffc107"
        className={
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }
        activeBoxShadow="0 0 2px 3px #3b82f6"
      />

      {label && (
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`font-medium text-gray-700 ${currentSize.label}`}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AnimatedSwitch;
