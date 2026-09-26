import { TbPlayCardStarFilled } from "react-icons/tb";
import { RiVipCrown2Fill } from "react-icons/ri";
import { FaHandshake } from "react-icons/fa";
import { FaGift } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { Link } from "react-router-dom";
//same imports bloted need opt
import React, { useState, useEffect } from "react";
import logo from "../assets/logosnak.png";
import { NavLink } from "react-router-dom";

import Card from "./Card.jsx";
import { IoIosSearch } from "react-icons/io";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

import { TbCards } from "react-icons/tb";




export default function Navbar() {
  const [moneymenu, setmoneymenu] = useState(false);
// ✅ CORRECT
const navItemClass = ({ isActive }) =>
  `w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
    isActive
      ? "rounded-lg p-2 bg-blue-300/20 shadow-md"
      : "hover:bg-slate-800/50"
  }`;

  return (
    <>
      <div className=" font-proxima fixed h-15 w-dvw flex justify-between items-center  px-4 md:px-58 bg-[#172B39]  shadow-md shadow-black/10">
        <img width={80} src={logo} alt="" />
        {}
        <div className="md:w-72 h-12 flex justify-between items-center gap-2 bg-[#101e28] text-lg rounded-lg text-white">
          <span className="w-1/2 text-lg flex justify-center items-center gap-2">
            <h1>10000.00</h1>
            <RiMoneyDollarCircleFill size={27} color="lightgreen" />
          </span>
          <button
            onClick={() => setmoneymenu(!moneymenu)}
            className="bg-blue-500 text-white h-12 w-18 text-sm  rounded-br-lg rounded-tr-lg"
          >
            Top up
          </button>
        </div>

        <span className="gap-2 flex justify-center items-center md:w-1/4">
          <button
            className="hover:opacity-85 rounded-lg bg-sky-500 w-67 md:w-45 h-11 text-white font-bold flex justify-center items-center gap-2"
            onClick={""}
          >
            <img
              width={40}
              src="https://imgs.search.brave.com/GRMjldlcNwfVFzjNuiwbn4AwuqTCeX0rONgKmcgHckY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDkvR29vZ2xlLVN5/bWJvbC03MDB4Mzk0/LnBuZw"
            />
            <span>Sign in</span>
          </button>

          <button
            className="hover:opacity-85 rounded-lg bg-red-500/70 w-37 md:w-35 h-10 text-white font-bold flex justify-center items-center gap-2"
            onClick={""}
          >
            <RiLogoutBoxRFill size={36} />
            <span>Sign out</span>
          </button>
        </span>
      </div>


    <div className='md:fixed z-10  hidden md:h-dvh md:w-15 md:top-0 md:left-0 bg-[#0e202d] md:flex md:flex-col justify-start items-center gap-5'>
      <button className='w-15 h-15 shadow-md rounded-b-xl shadow-gray-950/25 flex justify-center items-center'><IoMenu color='lightblue' size={25}  /></button>
       <NavLink to="/" className={navItemClass}>
          <TbPlayCardStarFilled color="lightblue" size={25} />
        </NavLink>
        <NavLink to="/vip" className={navItemClass}>
          <RiVipCrown2Fill color="lightblue" size={25} />
        </NavLink>
        <NavLink to="/affiliates" className={navItemClass}>
          <FaHandshake color="lightblue" size={25} />
        </NavLink>
        <NavLink to="/rewards" className={navItemClass}>
          <FaGift color="lightblue" size={25} />
        </NavLink>
        <NavLink to="/cardsland" className={navItemClass}>
          <TbCards color="lightblue" size={25} />
        </NavLink>
    </div>
    </>
  )
}
