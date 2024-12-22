/* eslint-disable react/prop-types */
import React from "react";
import { FaHeart, FaMap, FaMapMarkedAlt } from "react-icons/fa";
import gambarKost from "../assets/default/kostDefault.jpg";
import "../styles/section.css";

const KostCard = ({ item }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-gray-100 shadow-md transition-transform duration-300 hover:translate-y-1">
      <img
        src={item?.img[0] || gambarKost}
        alt={item?.name || "Kost"}
        className="h-48 w-full object-cover"
      />

      <div className="flex flex-grow flex-col p-5">
        <h3 className="mb-2 text-2xl text-gray-800">
          {item?.name || "Nama Kost"}
        </h3>
        <div className="mb-3 flex items-center text-gray-600">
          <FaMapMarkedAlt className="mr-1 h-4 w-4 text-primary" />
          <span>{item?.location || "Lokasi"}</span>
        </div>
        <div className="mb-4">
          {item?.originalPrice ? (
            <div>
              <span className="text-lg font-bold text-primary">
                Rp {(item?.price || 0).toLocaleString()} /bulan
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                Rp {(item?.originalPrice || 0).toLocaleString()} /bulan
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">
              Rp {(item?.price || 0).toLocaleString()} /bulan
            </span>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {item.facilitites?.map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
        </div>

        <div className="mt-auto flex items-center">
          <button className="rounded border-2 border-primary px-4 py-2 text-sm font-bold text-primary transition-colors duration-300 hover:bg-primary hover:text-white">
            Lihat Detail
          </button>
          <button className="ml-auto rounded-full border border-blue-200 p-2 transition-colors duration-300 hover:bg-blue-50">
            <FaHeart className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KostCard;
