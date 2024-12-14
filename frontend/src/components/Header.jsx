import { useState } from "react";
import { FaHeart, FaSearch, FaUser } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const [isSearchActive, setSearchActive] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  const toggleSearch = () => {
    setSearchActive(!isSearchActive);
    setMenuOpen(false);
  };

  const toogleMenu = () => {
    setMenuOpen(!isMenuOpen);
    setSearchActive(false);
  };

  const getLinkComponent = () => {
    // Jika berada di halaman Home, kembalikan <a> untuk href
    if (location.pathname === "/") {
      return "a"; // Menggunakan tag <a> jika di Home
    }
    // Jika di halaman lain, gunakan <Link> untuk routing React
    return Link;
  };

  const getLinkTarget = () => {
    // Menentukan target link berdasarkan halaman
    if (location.pathname === "/") {
      return { href: `#home` }; // Gunakan href jika di Home
    }
    return { to: "/" }; // Gunakan to jika di halaman lain
  };

  const LinkComponent = getLinkComponent();

  return (
    // ganti jadi fixed jika ada masalah
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between bg-primary p-6">
      {/* Logo & Branding */}
      <div className="flex items-center space-x-2">
        <Link to={"/profile"}>
          {currentUser ? (
            <img
              src={encodeURI(currentUser.avatar)}
              alt="profile"
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <FaUser className="text-2xl text-white transition-all duration-300 hover:text-slate-700" />
          )}
        </Link>
        <Link to={"/"}>
          <p className="group flex">
            <span className="text-3xl font-extrabold italic text-white transition-all duration-500 group-hover:text-black">
              Kost
            </span>
            <span className="text-3xl font-extrabold italic text-black transition-all duration-500 group-hover:text-white">
              Hunt
            </span>
          </p>
        </Link>
      </div>

      {/* Menu Links untuk desktop */}
      <div className="hidden space-x-5 md:flex">
        <LinkComponent
          {...getLinkTarget()} // Gunakan href jika di Home, atau to jika di halaman lain
          className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Beranda
        </LinkComponent>
        <a
          href="#about"
          className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Info
        </a>
        <Link className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100">
          Kost
        </Link>
        <Link className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100">
          Kontak
        </Link>
      </div>

      {/* Tombol Hamburger untu menu movile */}
      <div className="flex space-x-4 text-center">
        <FaSearch
          onClick={toggleSearch}
          className="text-2xl text-white transition-all duration-300 hover:text-black"
        />
        <Link to="/favorit">
          <FaHeart className="text-2xl text-white transition-all duration-300 hover:text-red-400" />
        </Link>
        <GiHamburgerMenu
          onClick={toogleMenu}
          className="text-2xl text-white transition-all duration-300 hover:text-black md:hidden"
        />
      </div>

      {/* Search box */}
      <div
        className={`top absolute right-[7%] top-full h-20 w-[300px] origin-top bg-white transition-transform duration-300 ease-in-out ${isSearchActive ? `scale-y-1` : `scale-y-0`}`}
      >
        <div className="relative flex h-full items-center">
          <input
            type="search"
            id="search"
            placeholder="Cari Kost..."
            className="h-full w-full rounded-lg pl-3 text-base text-gray-800 md:text-lg"
          />
          <label
            htmlFor="search"
            className="absolute right-4 cursor-pointer text-xl text-gray-800"
          >
            <FaSearch />
          </label>
        </div>
      </div>

      {/* Menu Mobile muncul dari kanan */}
      <div
        className={`absolute right-0 top-[60px] h-[calc(100vh-60px)] w-64 bg-primary transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mt-10 flex flex-col items-center justify-center space-y-4 px-4">
          <LinkComponent
            {...getLinkTarget()}
            className="text-2xl text-white transition-all hover:text-black"
          >
            Beranda
          </LinkComponent>
          <a
            href="#about"
            className="mt text-2xl text-white transition-all hover:text-black"
          >
            Info
          </a>
          <Link
            to="/kost"
            className="mt text-2xl text-white transition-all hover:text-black"
          >
            Kost
          </Link>
          <Link
            to="/kontak"
            className="mt text-2xl text-white transition-all hover:text-black"
          >
            Kontak
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
