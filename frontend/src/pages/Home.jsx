import Hero from "../components/Hero";
import KostList from "../components/KostList";
import About from "../components/About";
import ContactUs from "../components/ContactUs";

const Home = () => {
  return (
    <div className="font-poppins">
      <Hero />
      <About />
      <KostList />
      <ContactUs />
    </div>
  );
};

export default Home;
