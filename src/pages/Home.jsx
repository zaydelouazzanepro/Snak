import React, { useState, useEffect } from "react";
import logo from "../assets/logosnak.png";
import banner from "../assets/banner.png";
import gold from "../assets/gold.png";
import { MdCasino } from "react-icons/md";
import { SiDeliveroo } from "react-icons/si";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdArrowForwardIos } from "react-icons/md";
import Card from "./Card.jsx";
import Navbar from "./Navbar.jsx";
import { IoIosSearch } from "react-icons/io";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

import Topup from "./Topup.jsx";

const games = [
  {
    name: "Crash",
    link: "/crash",
    players: 243,
    url: "https://mediumrare.imgix.net/fbf4038ed2862c3503a5d39263d1321e8d9361d730eacfbb2403fd1e5894525c?w=180&h=236&fit=min&auto=format",
  },
  {
    name: "plinko",
    link: "/plinko",
    players: 343,
    url: "https://mediumrare.imgix.net/8c1768b783a43931a4ebc8784ce64085e39139d262e6bb50da242b9f3fda70da?w=180&h=236&fit=min&auto=format",
  },
  {
    name: "Slide",
    players: 374,
    link: "/slide",
    url: "https://mediumrare.imgix.net/6f102e2d81847242f2dad9b3f181d5cd53195ed1f5e4a992bcb73ea9ffd58373?w=180&h=236&fit=min&auto=format",
  },
  {
    name: "roulette",
    link: "/roulette",
    players: 387,
    url: "https://mediumrare.imgix.net/86cd89b12ec34439c0d1a6e32b06c971efc86091e09ba466182abe173c3d3f7d?w=180&h=236&fit=min&auto=format",
  },

  {
    name: "Mines",
    link: "/mines",
    players: 276,
    url: "https://mediumrare.imgix.net/15a51a2ae2895872ae2b600fa6fe8d7f8d32c9814766b66ddea2b288d04ba89c?w=180&h=236&fit=min&auto=format",
  },
  { players: 374, name: "Gold", link: "/gold", url: gold },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moneymenu, setmoneymenu] = useState(false);
  const results = games.filter((game) =>
    game.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false);
    };

    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#172B39] font-proxima flex flex-col justify-start items-center   px-4 overflow-hidden">
      {loading && <LoadingScreen />}
      <Navbar />

     

      <div
        style={{ backgroundImage: `url(${banner})` }}
        className="bg-cover flex flex-col mt-18 justify-center items-end  px-40 p-4 rounded-md overflow-hidden md:w-300 md:h-122 bg-sky-400 "
      >
        <div className="flex flex-col justify-center items-center gap-2 w-80 md:w-120 mb-16">
          <h1 className="text-center w-full text-4xl font-semibold text-white">
            Have fun,Gain rewards
          </h1>
          <button className="hover:opacity-85 rounded-lg bg-sky-500 w-67 md:w-95 h-11 text-white font-bold">
            Register
          </button>
          <h2 className="text-sm text-sky-700/60">Or Continue With</h2>
          <button className="hover:opacity-85 rounded-lg bg-sky-300/20 w-95 h-11 text-white font-bold flex justify-center items-center">
            <img
              width={40}
              src="https://imgs.search.brave.com/GRMjldlcNwfVFzjNuiwbn4AwuqTCeX0rONgKmcgHckY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDkvR29vZ2xlLVN5/bWJvbC03MDB4Mzk0/LnBuZw"
            />
            Google account
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-7 mt-15 md:w-310 p-4 text-white text-sm font-semibold">
        <span className="bg-sky-700/30 md:w-1/2 h-12 rounded-md flex justify-between items-center px-10">
          <h1 className="flex justify-center items-center gap-4">
            <span className="flex justify-center items-center gap-2">
              <MdCasino size={25} />
              Casino
            </span>
          </h1>
          <span className="flex justify-center items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>{" "}
            {games.length}
          </span>
        </span>
        <span className="bg-sky-700/30 md:w-1/2 h-12 rounded-md flex justify-between items-center px-10">
          <h1 className="flex justify-center items-center gap-4">
            <span className="flex justify-center items-center gap-2">
              <SiDeliveroo size={25} />
              Live Casino
            </span>
          </h1>
          <span className="flex justify-center items-center gap-2">
            <Dot /> Online{" "}
          </span>
        </span>
      </div>
      <div className="border border-sky-500/30 rounded-lg justify-start items-center h-12 flex gap-3 bg-slate-800 md:w-305 w-full px-2 py-1">
        <IoIosSearch color="white" size={35} />
        <input
          onChange={(e) => setSearch(e.target.value)}
          placeholder=""
          type="text"
          className="w-full text-lg text-white outline-0"
        />
      </div>

      <div className="flex flex-col justify-center items-start gap-5 md:w-300 p-4 text-white  font-semibold">
        <div className="flex justify-center items-center gap-1 cursor-pointer">
          <FaArrowTrendUp />
          <h1>Trending game </h1>
          <MdArrowForwardIos />
        </div>
        <div className="flex flex-wrap w-full md:w-300 md:h-auto justify-start items-center gap-4   px-4 mb-2 ">
          {results.map((game) => (
            <Card link={game.link} players={game.players} url={game.url} />
          ))}
        </div>
      </div>
      {moneymenu && (
        <Topup onClose={() => setmoneymenu(false)} />
      )}
    </main>
  );
}
const Dot = () => {
  return <div className="h-2 w-2 bg-red-700 rounded-full"></div>;
};


const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B39]">
      <img src={logo} alt="Snak" className="w-32 md:w-40 animate-pulse" />
    </div>
  );
};
