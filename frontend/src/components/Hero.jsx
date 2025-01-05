import React from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/bg.jpg";

const Hero = () => {
  return (
    <div
      id="home"
      className="relative flex min-h-screen items-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: "49%center",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.4) 90%, rgba(0, 0, 0, 0) 100%)",
        maskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.4) 90%, rgba(0, 0, 0, 0) 100%)",
        zIndex: 10,
      }}
    >
      <main className="fixed top-11 p-8 text-center text-slate-200 md:top-60">
        <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-800 drop-shadow-lg md:text-7xl">
          Temukan <br />
          <span className="text-yellow-500">Kost</span> <br /> Impianmu
        </h1>
        <p
          style={{
            color: "white",
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
          className="mb-8 mt-96 text-xl text-gray-600 drop-shadow-2xl md:mt-0 md:text-[22px]"
        >
          Pilihan kost terbaik untuk kenyamanan tempat tinggal anda
        </p>
        <Link
          to="/search"
          className="absolute right-20 top-[50%] z-20 inline-block rounded-lg bg-yellow-400 px-14 py-6 text-xl font-semibold text-black shadow transition hover:bg-yellow-500 hover:shadow-lg md:left-[240px] md:right-auto md:top-80"
        >
          Cari Sekarang
        </Link>
      </main>
    </div>
  );
};

export default Hero;
