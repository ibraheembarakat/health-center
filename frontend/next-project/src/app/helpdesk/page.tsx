"use client"
import Footer from "../Component/layout/Footer";
import Navbar from "../Component/layout/Navbar";
import HeroPages from "../Component/UI/HeroPages";
import { useEffect, useState } from "react";
import { HeroPage } from "../interface";
import HelpDeskSection from "../Component/Section/HelpDeskSection";
import EndSection from "../Component/Section/EndSection";
function HelpDesk() {
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
        <div>
            <div className="py-5 flex flex-col gap-40 max-lg:gap-20">
                <div className="flex flex-col gap-10">
                    <Navbar />
                    {data ? <HeroPages {...data} /> : <div>Loading...</div>}
                </div>
                <HelpDeskSection/>
                <Footer />
            </div>
        </div>
    )
}

export default HelpDesk