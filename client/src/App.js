import React from 'react';
import Header from './components/Header';
import ParallaxSection from './components/ParallaxSection';
import About from './components/About';
import MeetOwner from './components/MeetOwner';
import ContactUs from './components/ContactUs';
import OurWork from './components/OurWork';
import Footer from './components/Footer';

function App() {
    return (
        <div className="App">
            <Header />
            <ParallaxSection />
            <About />
            <OurWork />
            <MeetOwner />
            <ContactUs />
            <Footer />
        </div>
    );
}

export default App;
