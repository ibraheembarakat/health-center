"use client";

import { useEffect, useState } from "react";
import HeroPages from "../Component/UI/HeroPages";
import Navbar from "../Component/layout/Navbar";
import Footer from "../Component/layout/Footer";
import { HeroPage } from "../interface";
import SendComplaints from "../Component/Section/SendComplaints";
import GetComplaints from "../Component/Section/GetComplaints";

function User() {
  const [data, setData] = useState<HeroPage | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          "http://localhost:8000/api/beneficiaries/me/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true"
            },
          }
        );
        const text = await res.text();
        if (!res.ok) {
          console.error("API ERROR:", text);
          return;
        }
        const user = JSON.parse(text);
        setData({
          name: user.user.first_name + " " + user.user.last_name,
          role: localStorage.getItem("role") || "",
          address: user.user.address,
          date_of_birth: user.date_of_birth,
          registration_date: user.registration_date,
          nutrition_status: user.nutrition_status,
          weight: user.weight,
          height: user.height
        });
      } catch (err) {
        console.error(err);
      }
    };
    getUser()
  }, []);


  return (<div className="py-5 flex flex-col gap-15 max-lg:gap-5">
    <Navbar />
    {data ? <HeroPages {...data} /> : <div>Loading...</div>}
    <SendComplaints />
    <GetComplaints/>
    <Footer />
  </div>

  );
}

export default User;