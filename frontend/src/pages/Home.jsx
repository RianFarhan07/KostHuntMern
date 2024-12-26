import Hero from "../components/Hero";
import KostList from "../components/KostList";
import About from "../components/About";
import ContactUs from "../components/ContactUs";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="font-poppins">
      <Hero />
      <About />
      <KostList />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default Home;
