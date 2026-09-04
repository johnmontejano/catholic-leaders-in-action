import { Experience } from "./components/Experience";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Membership } from "./components/Membership";
import { Navigation } from "./components/Navigation";
import { NextEvent } from "./components/NextEvent";
import { Stories } from "./components/Stories";

export function App() {
  return (
    <>
      <a
        className="z-modal fixed left-4 top-4 -translate-y-24 rounded-full bg-lamp-cream px-5 py-3 font-medium text-void-black transition-transform duration-200 focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>
      <Navigation />
      <main id="main-content">
        <Hero />
        <Experience />
        <NextEvent />
        <Membership />
        <Stories />
      </main>
      <Footer />
    </>
  );
}
