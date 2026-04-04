import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <div className="z-50 mt-12 bg-background border-t">
            <div className="max-w-5xl mx-auto px-6 w-full text-center h-16 flex items-center justify-center gap-4">
                © {currentYear} - All rights reserved.
            </div>
        </div>
    );
};

export default Footer;