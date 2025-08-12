import React from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import MethodSection from './components/MethodSection';
import WorkshopsSection from './components/WorkshopsSection';
import VisionSection from './components/VisionSection';
import WhySection from './components/WhySection';
import GetInvolvedSection from './components/GetInvolvedSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      
      <main>
        <HeroSection />
        
        <AboutSection />
        
        <MethodSection />
        
        <WorkshopsSection />
        
        <VisionSection />
        
        <WhySection />
        
        <GetInvolvedSection />
        
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
