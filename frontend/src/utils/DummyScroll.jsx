import React from "react";

const DummyScroll = () => {
  return (
    <div>
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <h1 className="text-3xl">Hero Section</h1>
      </div>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="flex h-40 items-center justify-center border-b bg-gray-100"
        >
          <p>Content Section {i + 1}</p>
        </div>
      ))}
    </div>
  );
};

export default DummyScroll;
