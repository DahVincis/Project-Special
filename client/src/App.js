import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import MeetOwner from './components/MeetOwner';
import ContactUs from './components/ContactUs';
import OurWork from './components/OurWork';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
    return (
        <div className="App">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Header />
            <main id="main-content">
                <Hero />
                <About />
                <OurWork />
                <MeetOwner />
                <ContactUs />
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    );
}

export default App;
