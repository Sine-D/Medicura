import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-400 py-20 text-center text-white mb-10 rounded-b-2xl">
        <div className="container mx-auto px-5">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">About MediCura</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90">Your trusted partner in health and wellness for over 15 years</p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 inline-block pb-3 relative after:content-[''] after:block after:w-20 after:h-1 after:bg-blue-800 after:mx-auto after:mt-2">Our Story</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
            <div className="flex-1">
              <p className='text-justify'>Established in 2008, MediCura has grown from a small community clinic to a comprehensive medical center serving thousands of patients each year. Our journey began with a simple vision: to make quality healthcare accessible, compassionate, and personalized.</p>
              <br />
              <p className='text-justify'>Today, we continue to uphold that vision by combining cutting-edge medical technology with a patient-centered approach. Our team of dedicated healthcare professionals works together to provide integrated care that addresses not just symptoms, but overall wellness.</p>
              <br />
              <p className='text-justify'>At MediCura, we believe that healthcare should be a partnership between patients and providers, built on trust, respect, and open communication.</p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-blue-800  w-100 h-100 flex items-center justify-center">
                <img src={assets.story_image} alt="MediCura Story" className='w-100 h-100 object-cover' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-blue-100 py-12 rounded-xl mb-10">
        <div className="container mx-auto px-5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800 inline-block pb-3 relative after:content-[''] after:block after:w-20 after:h-1 after:bg-blue-800 after:mx-auto after:mt-2">Our Mission & Vision</h2>
          </div>
          <div className="text-center max-w-3xl mx-auto">
            <p>Our mission is to provide exceptional healthcare services that improve the lives of our patients and community. We are committed to delivering compassionate, comprehensive care with integrity, respect, and excellence.</p>
            <br />
            <p>Our vision is to be the leading healthcare provider in our region, recognized for clinical excellence, innovative treatments, and outstanding patient experiences. We strive to set new standards in medical care while remaining accessible to all.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-400 py-16 text-white text-center rounded-xl my-10">
        <div className="container mx-auto px-5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white inline-block pb-3 relative after:content-[''] after:block after:w-20 after:h-1 after:bg-white after:mx-auto after:mt-2">MediCura By The Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
            <div className="p-5">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div>Years of Service</div>
            </div>
            <div className="p-5">
              <div className="text-4xl font-bold mb-2">24</div>
              <div>Medical Specialties</div>
            </div>
            <div className="p-5">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div>Healthcare Professionals</div>
            </div>
            <div className="p-5">
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div>Patients Served Yearly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 inline-block pb-3 relative after:content-[''] after:block after:w-20 after:h-1 after:bg-blue-800 after:mx-auto after:mt-2">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Compassion */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12.001 4.529c2.349-4.104 12-2.87 12 3.397 0 4.418-5.373 7.86-9.373 11.293a2.998 2.998 0 0 1-3.254 0C5.373 15.786 0 12.344 0 7.926c0-6.267 9.651-7.501 12.001-3.397z"/></svg>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Compassion</h3>
              <p>We treat every patient with empathy, kindness, and understanding.</p>
            </div>
            {/* Excellence */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Excellence</h3>
              <p>We are committed to the highest standards of medical care and service.</p>
            </div>
            {/* Integrity */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5.236a2 2 0 0 0-1.106-1.789l-6-3.272a2 2 0 0 0-1.788 0l-6 3.272A2 2 0 0 0 4 5.236V12c0 6 8 10 8 10z"/></svg>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Integrity</h3>
              <p>We uphold honesty and ethical behavior in all that we do.</p>
            </div>
            {/* Teamwork */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Teamwork</h3>
              <p>We collaborate to provide the best possible care for our patients.</p>
            </div>
            {/* Innovation */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a7 7 0 0 1 7 7c0 2.386-1.19 4.5-3 5.74V18a2 2 0 1 1-4 0v-3.26C6.19 13.5 5 11.386 5 9a7 7 0 0 1 7-7z"/></svg>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Innovation</h3>
              <p>We embrace new technologies and treatments to improve patient outcomes.</p>
            </div>
            {/* Community */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M16 13c2.67 0 8 1.34 8 4v3H0v-3c0-2.66 5.33-4 8-4h8zm-8-2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm8 0c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Community</h3>
              <p>We are dedicated to serving and improving the health of our community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-blue-100 rounded-xl">
        <div className="container mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 inline-block pb-3 relative after:content-[''] after:block after:w-20 after:h-1 after:bg-blue-800 after:mx-auto after:mt-2">Our Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="h-64 overflow-hidden">
                <img src={assets.leadership1} alt="Dr. Sarah Johnson" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-blue-800 mb-1">Dr. Sarah Johnson</h3>
                <p className="text-gray-600">Medical Director</p>
                <p className="text-sm text-gray-500 mt-2">15+ years of experience in medical leadership</p>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="h-64 overflow-hidden">
                <img src={assets.leadership2} alt="Dr. Michael Chen" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-blue-800 mb-1">Dr. Michael Chen</h3>
                <p className="text-gray-600">Chief of Surgery</p>
                <p className="text-sm text-gray-500 mt-2">Expert in minimally invasive surgical techniques</p>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="h-64 overflow-hidden">
                <img src={assets.leadership3} alt="Dr. Emily Rodriguez" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-blue-800 mb-1">Dr. Emily Rodriguez</h3>
                <p className="text-gray-600">Head of Pediatrics</p>
                <p className="text-sm text-gray-500 mt-2">Specialized in child healthcare and development</p>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="h-64 overflow-hidden">
                <img src={assets.leadership4} alt="Robert Williams" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-blue-800 mb-1">Robert Williams</h3>
                <p className="text-gray-600">Administrative Director</p>
                <p className="text-sm text-gray-500 mt-2">Healthcare management and operations expert</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;