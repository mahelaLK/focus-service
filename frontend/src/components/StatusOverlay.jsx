import React from 'react'

const StatusOverlay = ({status, errorMsg, onRetry}) => {
  return (
    <div className='fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='bg-[#111] border border-white/10 rounded-2xl p-10 flex flex-col items-center gap-5 max-w-sm w-full mx-4 shadow-2xl'>
            {status === 'loading' && (
                <>
                    <div className='w-12 h-12 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin'/>
                    <p className='font-semibold text-white text-lg'>Processing</p>
                    <p className='text-white/30 text-xs text-center leading-relaxed'>
                        Cropping image and posting <br/> to callback URL ...
                    </p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                    <p className="font-['Syne'] font-semibold text-white text-lg">Focus Saved</p>
                    <p className="font-['DM_Mono'] text-white/30 text-xs text-center leading-relaxed">
                    Cropped image posted to<br />callback successfully
                    </p>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-14 h-14 rounded-full bg-red-400/10 border border-red-400/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </div>
                    <p className="font-['Syne'] font-semibold text-white text-lg">Something went wrong</p>
                    <p className="font-['DM_Mono'] text-red-400/70 text-xs text-center break-all leading-relaxed px-2">
                    {errorMsg}
                    </p>
                    <button
                        onClick={onRetry}
                        className="mt-2 px-6 py-2.5 border border-white/15 hover:border-white/30 text-white/50 hover:text-white font-['Syne'] text-sm tracking-widest uppercase rounded-lg transition-all duration-200"
                    >
                        Try Again
                    </button>
                </>
            )}
        </div>
    </div>
  );
}

export default StatusOverlay