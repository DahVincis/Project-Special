import React from 'react';
import ParallaxSection from './components/ParallaxSection';
import About from './components/About';
import MeetOwner from './components/MeetOwner';
import ContactUs from './components/ContactUs';
import OurWork from './components/OurWork';

function App() {
    return (
        <div className="App">
            <ParallaxSection />
            <OurWork />
            <About />
            <MeetOwner />
            <ContactUs />
        </div>
    );
}

export default App;
