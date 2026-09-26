import React from 'react'
import Navbar from './Navbar'
import { FaCartShopping } from "react-icons/fa6";
import { MdInventory } from "react-icons/md";

export default function CardsLand() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#172B39] text-white font-proxima flex flex-col justify-start items-center px-4 pt-24 overflow-hidden">
        <div className="flex justify-center items-center gap-5">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-all">
            <MdInventory size={22} color="lightblue" />
            <p>Inventory</p>
          </button>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-all">
            <FaCartShopping size={20} color="lightblue" />
            <p>Shop</p>
          </button>
        </div>
      </div>
    </>
  );
}
