import Hero from "../components/Hero";
import KostList from "../components/KostList";
import About from "../components/About";

const Home = () => {
  return (
    <div className="font-poppins">
      <Hero />
      <About />
      <KostList />
    </div>
  );
};

export default Home;
