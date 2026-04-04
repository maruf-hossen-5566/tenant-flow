import React from 'react';
import {Outlet} from "react-router-dom";
import Header from "@/components/custom/header/header.jsx";
import Footer from "@/components/custom/footer/footer.jsx";

const Layout = () => {
    return (
        <>
            <Header/>
            <Outlet/>
            <Footer/>
        </>
    );
};

export default Layout;