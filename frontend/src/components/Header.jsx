import { useEffect, useRef, useState } from "react";
import { FaHeart, FaSearch, FaUser, FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice";

const Header = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { currentUser } = useSelector((state) => state.user);
  const searchRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("searchTerm", searchTerm);
      navigate(`/search?${urlParams.toString()}`);
      setIsSearchActive(false);
    }
  };

  const resetSearch = () => setSearchTerm("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signout`,
      );
      const data = res.json();
      if (data === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      signOutUserFailure(error.message);
    }
  };

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Profile", href: "/profile" },
    { name: "My Kost", href: "/my-kost" },
    { name: "Stats", href: "/stats" },
    { name: "My Order", href: "/my-orders" },
    { name: "Tenant", href: "/tenant" },
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
    location.pathname === "/" ? { href: "#contact" } : { to: "/" };

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary shadow-lg">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & User Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button className="group relative" onClick={toggleDropdown}>
                  <img
                    src={currentUser.avatar}
                    alt="profile"
                    className="h-10 w-10 rounded-full border-2 border-white object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-lg bg-primary py-2 shadow-xl ring-1 ring-black ring-opacity-5">
                    {navigationLinks.map((item) => (
                      <div key={item.name}>
                        {item.href ? (
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              item.onClick();
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                          >
                            {item.name}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="rounded-full p-2 text-white transition-colors hover:text-slate-700"
                onClick={resetSearch}
              >
                <FaUser className="text-xl" />
              </Link>
            )}

            <Link
              to="/"
              onClick={resetSearch}
              className="group flex items-center"
            >
              <span className="text-3xl font-black italic text-white transition-all duration-300 group-hover:text-black">
                Kost
              </span>
              <span className="text-3xl font-black italic text-black transition-all duration-300 group-hover:text-white">
                Hunt
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden space-x-8 md:flex">
            {[
              { text: "Beranda", target: linkTargetHome },
              { text: "Info", target: linkTargetAbout },
              { text: "Kost", target: linkTargetKost },
              { text: "Kontak", target: linkTargetKontak },
            ].map((item) => (
              <LinkComponent
                key={item.text}
                onClick={resetSearch}
                {...item.target}
                className="relative text-lg font-medium text-white transition-all duration-300 before:absolute before:-bottom-2 before:left-0 before:h-0.5 before:w-full before:origin-right before:scale-x-0 before:bg-white before:transition-transform before:duration-300 hover:text-black hover:before:origin-left hover:before:scale-x-100"
              >
                {item.text}
              </LinkComponent>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSearch}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-lg transition-colors hover:bg-white/20"
            >
              {isSearchActive ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaSearch className="text-xl" />
              )}
            </button>

            <Link
              to="/favorit"
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-lg transition-colors hover:bg-white/20"
            >
              <FaHeart className="text-xl" />
            </Link>

            <button
              onClick={toggleMenu}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-lg transition-colors hover:bg-white/20 md:hidden"
            >
              {isMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <GiHamburgerMenu className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div
        className={`absolute left-0 top-full w-full transform bg-white px-4 py-4 shadow-lg transition-all duration-300 ${
          isSearchActive
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        ref={searchRef}
      >
        <form onSubmit={handleSearchSubmit} className="mx-auto max-w-3xl">
          <div className="relative">
            <input
              type="search"
              placeholder="Cari Kost..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border-2 border-gray-200 px-6 py-3 text-lg text-gray-700 outline-none transition-all duration-300 focus:border-primary"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary p-3 text-white transition-colors hover:bg-slate-700"
            >
              <FaSearch className="text-lg" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 transform bg-primary p-6 transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col space-y-6">
          {[
            { text: "Beranda", target: linkTargetHome },
            { text: "Info", target: linkTargetAbout },
            { text: "Kost", target: linkTargetKost },
            { text: "Kontak", target: linkTargetKontak },
          ].map((item) => (
            <LinkComponent
              key={item.text}
              onClick={() => {
                resetSearch();
                setIsMenuOpen(false);
              }}
              {...item.target}
              className="text-2xl font-medium text-white transition-colors hover:text-black"
            >
              {item.text}
            </LinkComponent>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Header;
