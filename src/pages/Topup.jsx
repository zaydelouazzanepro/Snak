import React from 'react'
import { IoMdClose } from "react-icons/io";
import { Monitor } from "lucide-react";
import qrcode from "qrcode-generator";
import QRCode from "../QRCode.jsx";
import { CgDanger } from "react-icons/cg";
import { useState  } from 'react';
export default function Topup({ onClose, setmoneymenu }) {
  const [amount, setAmount] = useState();
  const [err, setErr] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (setmoneymenu) {
      setmoneymenu(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed top-0 left-0 w-screen h-screen backdrop-blur-md z-30 flex justify-center items-center "
    >
      <div className=" text-white w-2xl h-2/3  bg-slate-900 rounded-xl p-4 py-10 flex flex-col justify-start items-start">
        <span className="w-full h-18 flex justify-between items-center mb-9 z-10 px-2">
          {" "}
          <h1 className="text-3xl text-white font-semibold">Top Up</h1>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <IoMdClose size={35} color="white" />
          </button>
        </span>
            <form
              className="grid grid-cols-2 grid-rows-2 flex-col gap-8 px-5 w-full h-1/2"
              action=""
            >
              <span className="flex flex-col justify-center items-start">
                <label className="text-zinc-200 font-semibold" htmlFor="">
                  Card Number
                </label>
                <input
                  placeholder="1234 XXXX XXXX"
                  className=" w-full outline-0 px-4 py-2 rounded-xl placeholder:text-blue-300 bg-slate-800"
                  type="text"
                />

                <label className="text-zinc-200 font-semibold" htmlFor="">
                  Amount ($)
                </label>
                <input
                  required
                  onChange={(e) => setAmount(e.target.value)}
                  max={99999999}
                  placeholder="$12000"
                  type="number"
                  className="w-full outline-0 px-4 py-2 rounded-xl placeholder:text-blue-300 bg-slate-800"
                />

                <label className="text-zinc-200 font-semibold" htmlFor="">
                  SOK
                </label>
                <input
                  placeholder="XXXX"
                  className=" w-full outline-0 px-4 py-2 rounded-xl placeholder:text-blue-300 bg-slate-800"
                  type="text"
                />
              </span>

              <div className="p-4  flex flex-col gap-4 justify-center items-center">
                <h1 className="text-xl">Scan To Pay ZORAX</h1>
                <span>
                  <QRCode value={amount} />
                </span>
              </div>
            </form>


{err &&
  <span className="w-full bg-yellow-500/50 p-4 flex gap-2 text-amber-300  rounded-2xl">
              <CgDanger size={35} />
              <p>
                Something went wrong ,please verify the validation date , card
                blokage , credit left in the card if you dont know the cause of
                this issue contact us via{" "}
                <a className="text-amber-500" href="">
                  the support page
                </a>
              </p>
            </span>
}
            
            


          </div>
        </div>
  )
}
