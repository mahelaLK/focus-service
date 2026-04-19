import React from 'react'

const ErrorScreen = ({title, message, example}) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="font-['Syne'] font-bold text-white tracking-widest uppercase text-sm">
            Focus Point
          </span>
        </div>
        <h1 className="font-['Syne'] font-bold text-white text-2xl mb-3">{title}</h1>
        <p className="font-['DM_Mono'] text-white/40 text-sm mb-8 leading-relaxed">{message}</p>
        {example && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="font-['DM_Mono'] text-white/20 text-xs uppercase tracking-widest mb-3">
              Example URL
            </p>
            <code className="font-['DM_Mono'] text-emerald-400 text-xs break-all leading-relaxed">
              {example}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorScreen