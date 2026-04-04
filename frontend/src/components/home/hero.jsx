import React from 'react';
import {Button} from "@/components/ui/button.jsx";

const Hero = () => {
    return (
        <div className="w-full h-full px-6 mt-32">
            <h2 className="text-5xl font-semibold leading-tight text-center">
                Streamline Your Projects, Empower Your Teams—All in One Place
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mt-6 text-center">
                Manage multiple teams and
                clients effortlessly. Our
                multi-tenant project management
                app keeps everything
                organized, private, and on
                track. Perfect for agencies,
                consultancies, and growing
                businesses.</p>
            <div className="w-full mt-8 flex items-center justify-center gap-4">
                <Button size="lg">Get started</Button>
            </div>
            <div className="w-full mt-12 flex items-center justify-center">
                <img
                    className="rounded-sm"
                    src="/images/hero_image.png"
                    alt="Hero image"
                />
            </div>
        </div>);
};

export default Hero;