import { FaHeart, FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="flex items-center justify-between bg-primary p-6">
      <div className="flex items-center space-x-2">
        <Link>
          <FaUser className="text-white hover:text-black hover:text-slate-700 text-2xl transition-all duration-300" />
        </Link>
        <p className="group flex">
          <span className="text-white group-hover:text-black text-3xl font-extrabold italic transition-all duration-500">
            Kost
          </span>
          <span className="text-black group-hover:text-white text-3xl font-extrabold italic transition-all duration-500">
            Hunt
          </span>
        </p>
      </div>
      <div className="flex space-x-5">
        <Link className="text-white hover:text-black after:bg-current relative inline-block px-4 text-xl transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
          Beranda
        </Link>
        <Link className="text-white hover:text-black after:bg-current relative inline-block px-4 text-xl transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
          Info
        </Link>
        <Link className="text-white hover:text-black after:bg-current relative inline-block px-4 text-xl transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
          Kost
        </Link>
        <Link className="text-white hover:text-black after:bg-current relative inline-block px-4 text-xl transition-all duration-300 after:absolute after:bottom-0 after:left-1/4 after:h-0.5 after:w-1/2 after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
          Kontak
        </Link>
      </div>
      <div className="flex space-x-4 text-center">
        <FaSearch className="text-white hover:text-black text-2xl transition-all duration-300" />
        <Link to="/favorit">
          <FaHeart className="text-white hover:text-red-400 text-2xl transition-all duration-300" />
        </Link>
      </div>
    </nav>
  );
};

export default Header;
