import React from 'react';
import Hero from "@/components/home/hero.jsx";

const Home = () => {
    return (
        <div className="max-w-5xl mx-auto min-h-[calc(100vh-4rem)] w-full flex flex-col items-center ">
            <Hero/>
        </div>
    );
};

export default Home;