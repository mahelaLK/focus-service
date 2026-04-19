import React from 'react'

const InfoBar = ({domain, filename, width, height}) => {

    const items = [
        {label: 'domain', value: domain},
        {label: 'file', value: filename},
        {label: 'size', value: `${width} x ${height}px`}
    ];

  return (
    <div className='flex items-center gap-6'>
        {items.map(({label, value})=>(
            <div key={label} className='flex items-center gap-2'>
                <span className='text-white/25 text-xs uppercase tracking-widest'>
                    {label}
                </span>
                <span className='text-emerald-400 text-xs'>
                    {value}
                </span>
            </div>
        ))}
    </div>
  )
}

export default InfoBar