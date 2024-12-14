import { useState } from "react";
import { FaHeart, FaSearch, FaUser } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  const toggleSearch = () => {
    setIsSearchActive((prev) => !prev);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsSearchActive(false);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setIsSearchActive(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Implementasi logout di sini, seperti menghapus token atau session
  };

  const navigationLinks = [
    { name: "Profile", href: "/profile" },
    { name: "My Kost", href: "/my-kost" },
    { name: "Stats", href: "/stats" },
    { name: "Log Out", onClick: handleLogout },
  ];

  const LinkComponent = location.pathname === "/" ? "a" : Link;
  const linkTargetHome =
    location.pathname === "/" ? { href: "#home" } : { to: "/" };
  const linkTargetAbout =
    location.pathname === "/" ? { href: "#about" } : { to: "/" };
  const linkTargetKost =
    location.pathname === "/" ? { href: "#kost" } : { to: "/" };
  const linkTargetKontak =
    location.pathname === "/" ? { href: "#kontak" } : { to: "/" };

  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between bg-primary p-6">
      {/* Logo & User Section */}
      <div className="flex items-center space-x-2">
        <div>
          {currentUser ? (
            <>
              <button className="relative" onClick={toggleDropdown}>
                <img
                  src={encodeURI(currentUser.avatar)}
                  alt="profile"
                  className="h-9 w-9 rounded-full object-cover"
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-4 mt-6 rounded bg-primary px-3">
                  <ul>
                    {navigationLinks.map((item) => (
                      <li
                        key={item.name}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (item.onClick) item.onClick();
                        }}
                      >
                        {item.href ? (
                          <Link
                            to={item.href}
                            className="block px-4 py-2 hover:bg-gray-200"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <button className="block px-4 py-2 hover:bg-gray-200">
                            {item.name}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <FaUser className="text-2xl text-white transition-all duration-300 hover:text-slate-700" />
          )}
        </div>
        <Link to="/">
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

      {/* Desktop Navigation */}
      <div className="hidden space-x-5 md:flex">
        <LinkComponent
          {...linkTargetHome}
          className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Beranda
        </LinkComponent>
        <LinkComponent
          {...linkTargetAbout}
          href="#about"
          className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Info
        </LinkComponent>
        <Link
          {...linkTargetKost}
          to="#kost"
          className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Kost
        </Link>
        <LinkComponent
          {...linkTargetKontak}
          to="#kontak"
          className="relative inline-block px-4 text-xl text-white transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-black hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Kontak
        </LinkComponent>
      </div>

      {/* Mobile Actions */}
      <div className="flex space-x-4 text-center">
        <FaSearch
          onClick={toggleSearch}
          className="text-2xl text-white transition-all duration-300 hover:text-black"
        />
        <Link to="/favorit">
          <FaHeart className="text-2xl text-white transition-all duration-300 hover:text-red-400" />
        </Link>
        <GiHamburgerMenu
          onClick={toggleMenu}
          className="text-2xl text-white transition-all duration-300 hover:text-black md:hidden"
        />
      </div>

      {/* Search Box */}
      {isSearchActive && (
        <div className="absolute right-[7%] top-full h-20 w-[300px] origin-top bg-white transition-transform duration-300 ease-in-out">
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
      )}

      {/* Mobile Menu */}
      <div
        className={`absolute right-0 top-[60px] h-[calc(100vh-60px)] w-64 bg-primary transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mt-10 flex flex-col items-center justify-center space-y-4 px-4">
          <LinkComponent
            {...linkTargetHome}
            className="text-2xl text-white transition-all hover:text-black"
          >
            Beranda
          </LinkComponent>
          <LinkComponent
            {...linkTargetAbout}
            href="#about"
            className="mt text-2xl text-white transition-all hover:text-black"
          >
            Info
          </LinkComponent>
          <LinkComponent
            {...linkTargetKost}
            to="#kost"
            className="mt text-2xl text-white transition-all hover:text-black"
          >
            Kost
          </LinkComponent>
          <LinkComponent
            {...linkTargetKontak}
            to="#kontak"
            className="mt text-2xl text-white transition-all hover:text-black"
          >
            Kontak
          </LinkComponent>
        </div>
      </div>
    </nav>
  );
};

export default Header;
