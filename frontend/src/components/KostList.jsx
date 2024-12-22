import React from "react";
import KostCard from "./KostCard";
import "../styles/section.css";

const KostList = () => {
  // Sample data - you can replace this with your actual data source
  const kostData = [
    {
      id: 1,
      name: "Kost Harmony",
      location: "Jl. Harmoni No. 123",
      price: 1500000,
      originalPrice: 1800000,
      img: "/api/placeholder/400/320",
      facilities: ["AC", "WiFi", "Kamar Mandi Dalam"],
    },
    {
      id: 2,
      name: "Kost Paradise",
      location: "Jl. Surya No. 456",
      price: 1200000,
      img: "/api/placeholder/400/320",
      facilities: ["Wifi", "Dapur Bersama", "Parkir Motor"],
    },
    {
      id: 3,
      name: "Kost Exclusive",
      location: "Jl. Elite No. 789",
      price: 2000000,
      originalPrice: 2500000,
      img: "/api/placeholder/400/320",
      facilities: ["AC", "WiFi", "Water Heater", "TV"],
    },
    {
      id: 4,
      name: "Kost Exclusive",
      location: "Jl. Elite No. 789",
      price: 2000000,
      originalPrice: 2500000,
      img: "/api/placeholder/400/320",
      facilities: ["AC", "WiFi", "Water Heater", "TV"],
    },
    {
      id: 5,
      name: "Kost Exclusive",
      location: "Jl. Elite No. 789",
      price: 2000000,
      originalPrice: 2500000,
      img: "/api/placeholder/400/320",
      facilities: ["AC", "WiFi", "Water Heater", "TV"],
    },
    {
      id: 6,
      name: "Kost Exclusive",
      location: "Jl. Elite No. 789",
      price: 2000000,
      originalPrice: 2500000,
      img: "/api/placeholder/400/320",
      facilities: ["AC", "WiFi", "Water Heater", "TV"],
    },
  ];

  return (
    <section id="kost" className="kost">
      <div className="container mx-auto px-4">
        <div className="kost-header">
          <h2>
            Pilihan <span>Kost</span>
          </h2>
          <div className="header-line"></div>
        </div>
        <div className="grid grid-cols-1 gap-8 py-5 md:grid-cols-2 lg:grid-cols-3">
          {kostData.map((item) => (
            <KostCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KostList;
