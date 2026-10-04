"use client"
import Footer from "../Component/layout/Footer";
import Navbar from "../Component/layout/Navbar";
import AddArt from "../Component/Section/AddArt";
import HeroPages from "../Component/UI/HeroPages";
import { useEffect, useState } from "react";
import { HeroPage } from "../interface";
import Showbeneficiary from "../Component/Section/Showbeneficiary";
import EndSection from "../Component/Section/EndSection";
function Awareness() {
    const [data, setData] = useState<HeroPage | null>(null);

    useEffect(() => {
        const getRegistration = async () => {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                "http://localhost:8000/api/auth/me/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true"
                    },
                }
            );

            const user = await res.json();

            setData({
                name: user.full_name,
                role: localStorage.getItem("role") || "",
                address: user.address,
                phone: user.phone,
                email: user.email,

            });
        };

        getRegistration();
    }, []);

    return (
        <div className="py-5 flex flex-col gap-15 max-lg:gap-5">
            <Navbar />
            {data ? <HeroPages {...data} /> : <div>Loading...</div>}
            <Showbeneficiary />
            <AddArt />
            <EndSection/>
            <Footer />
        </div>
    )
}

export default Awareness