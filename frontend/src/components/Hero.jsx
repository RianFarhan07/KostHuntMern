import { Link } from "react-router-dom";
import bgImage from "../assets/bg.jpg";

const Hero = () => {
  return (
    <div
      id="home"
      className="relative flex min-h-screen items-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: "center",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.4) 90%, rgba(0, 0, 0, 0) 100%)",
        maskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.4) 90%, rgba(0, 0, 0, 0) 100%)",
        zIndex: 10,
      }}
    >
      <main className="fixed left-1/2 top-1/4 -translate-x-1/2 transform p-4 text-center text-slate-200">
        <h1
          className="mb-6 text-5xl font-bold leading-tight text-gray-800 drop-shadow-lg md:text-7xl"
          style={{
            textShadow:
              "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
          }}
        >
          Temukan <br />
          <span className="text-yellow-500">Kost</span> <br /> Impianmu
        </h1>
        <p
          className="mb-8 text-xl text-gray-300 drop-shadow-lg md:text-[22px]"
          style={{
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
        >
          Pilihan kost terbaik untuk kenyamanan tempat tinggal anda
        </p>
        <Link
          to="/search"
          className="rounded-lg bg-yellow-400 px-10 py-4 text-xl font-semibold text-black shadow transition hover:bg-yellow-500 hover:shadow-lg"
          style={{
            textShadow:
              "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
          }}
        >
          Cari Sekarang
        </Link>
      </main>
    </div>
  );
};

export default Hero;
