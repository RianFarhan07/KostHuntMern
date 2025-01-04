import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaHome,
  FaUsers,
  FaStar,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";

const KostSearch = () => {
  const [searchParams, setSearchParams] = useState({
    searchTerm: "",
    type: "all",
    priceMin: "",
    priceMax: "",
    city: "",
    facilities: [],
    sort: "newest",
  });

  const [loading, setLoading] = useState(false);
  const [kosts, setKosts] = useState([]);

  const facilities = [
    "WiFi",
    "AC",
    "Kamar Mandi Dalam",
    "Dapur",
    "Laundry",
    "Parkir Motor",
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Search params:", searchParams);
  };

  const KostCard = ({ kost }) => (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={kost.imageUrls[0] || "/api/placeholder/400/300"}
          alt={kost.name}
          className="h-full w-full object-cover transition-transform hover:scale-110"
        />
        <div className="absolute right-2 top-2 rounded bg-primary px-2 py-1 text-sm font-semibold text-onPrimary">
          {kost.type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-onsurface">
          {kost.name}
        </h3>
        <div className="mb-2 flex items-center gap-1 text-gray-600">
          <FaMapMarkerAlt size={16} />
          <span className="text-sm">{kost.city}</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {kost.facilities.slice(0, 3).map((facility, index) => (
            <span
              key={index}
              className="rounded-full bg-surface px-2 py-1 text-xs text-gray-600"
            >
              {facility}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            Rp {kost.price.toLocaleString("id-ID")}
            <span className="text-sm text-gray-500">/bulan</span>
          </div>
          {kost.availability ? (
            <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Tersedia
            </span>
          ) : (
            <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
              Penuh
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <a
            href={`tel:${kost.contact?.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary p-2 text-sm text-white transition-colors hover:bg-primaryVariant"
          >
            <FaPhone /> Telepon
          </a>
          <a
            href={`https://wa.me/${kost.contact?.whatsapp}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 p-2 text-sm text-white transition-colors hover:bg-green-600"
          >
            <FaWhatsapp /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4">
        {/* Search Header */}
        <div className="mb-8 rounded-lg bg-primary p-6 text-onPrimary shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">Temukan Kost Impianmu</h1>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex flex-1 items-center rounded-lg bg-white px-4 py-2">
              <FaSearch className="mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kost..."
                className="w-full bg-transparent focus:outline-none"
                value={searchParams.searchTerm}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
              />
            </div>
            <select
              className="rounded-lg px-4 py-2 text-onsurface"
              value={searchParams.type}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="all">Semua Tipe</option>
              <option value="Putra">Kost Putra</option>
              <option value="Putri">Kost Putri</option>
              <option value="Campur">Kost Campur</option>
            </select>
            <button className="rounded-lg bg-secondary px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600">
              Cari
            </button>
          </form>
        </div>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Filter</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Rentang Harga</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-lg border p-2"
                    value={searchParams.priceMin}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        priceMin: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-lg border p-2"
                    value={searchParams.priceMax}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        priceMax: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Fasilitas</h3>
                <div className="space-y-2">
                  {facilities.map((facility, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        onChange={(e) => {
                          const newFacilities = e.target.checked
                            ? [...searchParams.facilities, facility]
                            : searchParams.facilities.filter(
                                (f) => f !== facility,
                              );
                          setSearchParams((prev) => ({
                            ...prev,
                            facilities: newFacilities,
                          }));
                        }}
                      />
                      {facility}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Example kost items */}
                <KostCard
                  kost={{
                    name: "Kost Harmoni",
                    type: "Putri",
                    city: "Jakarta Selatan",
                    facilities: ["WiFi", "AC", "Kamar Mandi Dalam"],
                    price: 1500000,
                    availability: true,
                    imageUrls: ["/api/placeholder/400/300"],
                    contact: {
                      phone: "6281234567890",
                      whatsapp: "6281234567890",
                    },
                  }}
                />
                <KostCard
                  kost={{
                    name: "Kost Sejahtera",
                    type: "Putra",
                    city: "Jakarta Barat",
                    facilities: ["WiFi", "Parkir Motor", "Dapur"],
                    price: 1200000,
                    availability: false,
                    imageUrls: ["/api/placeholder/400/300"],
                    contact: {
                      phone: "6281234567890",
                      whatsapp: "6281234567890",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KostSearch;
