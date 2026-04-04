import React from 'react';
import {Link} from "react-router-dom";

const Logo = () => {
    return (
        <Link
            to="/"
            className="font-pop text-3xl font-bold"
        >TF</Link>
    );
};

export default Logo;