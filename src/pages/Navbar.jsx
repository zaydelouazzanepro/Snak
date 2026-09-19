import React from 'react'
import { TbPlayCardStarFilled } from "react-icons/tb";
import { RiVipCrown2Fill } from "react-icons/ri";
import { FaHandshake } from "react-icons/fa";
import { FaGift } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";

export default function Navbar() {
  return (
    <div className='md:fixed z-10  hidden md:h-dvh md:w-15 md:top-0 md:left-0 bg-[#0e202d] md:flex md:flex-col justify-start items-center gap-5'>
      <button className='w-15 h-15 shadow-md rounded-b-xl shadow-gray-950/25 flex justify-center items-center'><IoMenu color='lightblue' size={25}  /></button>
      <span className='rounded-lg p-2 bg-blue-300/20'><TbPlayCardStarFilled color='lightblue' size={25} /></span>
      <span><RiVipCrown2Fill color='lightblue' size={25}  /></span>
      <span><FaHandshake color='lightblue' size={25}  /></span>
      <span><FaGift color='lightblue' size={25}  /></span>
    </div>
  )
}
