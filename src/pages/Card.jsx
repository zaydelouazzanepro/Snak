import React from 'react'

export default function Card(props) {
  return (
    <div className='w-34 h-52 flex flex-col justify-center items-start gap-1 '>
                <img className='h-46 w-34 rounded-xl hover:-translate-y-2 transition-all ease-in-out mt-3' src={props.url} />
                <span className='flex justify-start items-center gap-2'><Dot/><h1 className='text-zinc-100 font-semibold text-xs'>{props.players}</h1><p className='text-gray-400/30 text-xs font-thin'>playing</p></span>
    </div>
  )
}
const Dot = ()=>{
    return(
    <div className='h-2 w-2 bg-green-600 rounded-full'></div>
    )
}