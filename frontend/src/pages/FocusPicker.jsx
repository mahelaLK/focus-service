import React, { useCallback, useEffect, useRef, useState } from 'react'
import InfoBar from '../components/InfoBar';
import StatusOverlay from '../components/StatusOverlay';

const FocusPicker = ({domain, filename, width, height, callback}) => {

    const imgRef = useRef(null);
    const containerRef = useRef(null);

    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [boxPos, setBoxPos] = useState({x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const [status, setStatus] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

    const imageUrl = `https://${domain}/assets/media/orig/${filename}`;

    //  scale focus box to match displayed image vs natural image ratio
    const getBoxDisplaySize = useCallback(()=>{
        if(!imgRef.current) return {w: width, h: height};
        const rect = imgRef.current.getBoundingClientRect();
        const scaleX = rect.width/(imgRef.current.naturalWidth || rect.width);
        const scaleY = rect.height/(imgRef.current.naturalHeight || rect.height);
        return {
            w: Math.round(width*scaleX),
            h: Math.round(height*scaleY)
        };
    }, [width, height]);

    const handleImgLoad = () => {
        setImgNaturalSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight
        });
        setImgLoaded(true);
    };

    //  center box when image loads
    useEffect(()=>{
        if (!imgLoaded || !imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const bSize = getBoxDisplaySize();
        setBoxPos({
            x: Math.round((rect.width-bSize.w)/2),
            y: Math.round((rect.height-bSize.h)/2),
        });
    }, [imgLoaded, getBoxDisplaySize]);

    //  mouse drag handlers
    const onMouseDown = useCallback((e)=>{
        e.preventDefault();
        const rect = imgRef.current.getBoundingClientRect();
        setDragOffset({x: e.clientX-rect.left-boxPos.x, y: e.clientY-rect.top-boxPos.y});
        setDragging(true);
    }, [boxPos]);

    const onMouseMove = useCallback((e)=>{
        if (!dragging || !imgRef.current) return;
        const rect  = imgRef.current.getBoundingClientRect();
        const bSize = getBoxDisplaySize();
        setBoxPos({
            x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width  - bSize.w)),
            y: Math.max(0, Math.min(e.clientY - rect.top  - dragOffset.y, rect.height - bSize.h))
        });
    }, [dragging, dragOffset, getBoxDisplaySize]);

    const onMouseUp = useCallback(() => setDragging(false), []);

    //  touch drag handlers
    const onTouchStart = useCallback((e)=>{
        const touch = e.touches[0];
        const rect  = imgRef.current.getBoundingClientRect();
        setDragOffset({ x: touch.clientX - rect.left - boxPos.x, y: touch.clientY - rect.top - boxPos.y });
        setDragging(true);
    }, [boxPos]);

    const onTouchMove = useCallback((e)=>{
        if (!dragging || !imgRef.current) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect  = imgRef.current.getBoundingClientRect();
        const bSize = getBoxDisplaySize();
        setBoxPos({
            x: Math.max(0, Math.min(touch.clientX - rect.left - dragOffset.x, rect.width  - bSize.w)),
            y: Math.max(0, Math.min(touch.clientY - rect.top  - dragOffset.y, rect.height - bSize.h))
        });
    }, [dragging, dragOffset, getBoxDisplaySize]);

    const onTouchEnd = useCallback(()=>setDragging(false), []);

    // attach global mouse listeners so drag works when mouse moves outside box
    useEffect(()=>{
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return ()=>{
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
    }, [onMouseMove, onMouseUp]);

    // Save: crop and POST back
    const handleSave = async () => {
        if (!imgRef.current) return;
        setStatus('loading');
        setErrorMsg('');

        const rect  = imgRef.current.getBoundingClientRect();

        // focusX/Y = top-left of box as percentage of displayed image size
        const focusX = boxPos.x / rect.width;
        const focusY = boxPos.y / rect.height;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/crop`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({domain, filename, width, height, focusX, focusY, callback})
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Server error');

            setStatus('success');

            // Notify parent window (for iframe usage)
            window.parent.postMessage({
                type: 'focuspoint:saved',
                domain, filename, width, height, focusX, focusY
            }, '*');
        } catch (error) {
            setStatus('error');
            setErrorMsg(error.message);
        }
    };

    const bSize = getBoxDisplaySize();
    
  return (
    <div className='min-h-screen bg-neutral-900 flex flex-col'>
        {/*Header*/}
        <header className='flex items-center justify-between px-6 py-4 border-b border-white/10'>
            <div className='flex items-center gap-3'>
                <div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'/>
                <span className="font-['Syne'] font-bold text-white tracking-widest uppercase text-sm">
                    Focus Point
                </span>
            </div>
            <InfoBar domain={domain} filename={filename} width={width} height={height}/>
        </header>

        {/*Main*/}
        <main className='flex-1 flex flex-col items-center justify-center gap-5 p-6'>
            {imgLoaded && !status && (
            <p className="font-['DM_Mono'] text-white/30 text-xs tracking-widest uppercase">
                Drag the highlighted box to the focus area → Save
            </p>
            )}

            {/* Image container */}
            <div
            ref={containerRef}
            className="relative select-none"
            style={{ cursor: dragging ? 'grabbing' : 'default' }}
            >
            {/* The original image */}
            <img
                ref={imgRef}
                src={imageUrl}
                alt={filename}
                draggable={false}
                onLoad={handleImgLoad}
                onError={() => setImgError(true)}
                className={`block rounded-xl transition-opacity duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Dark overlay outside focus box */}
            {imgLoaded && imgNaturalSize.w > 0 && (
                <svg
                className="absolute inset-0 rounded-xl pointer-events-none"
                width={imgNaturalSize.w}
                height={imgNaturalSize.h}
                viewBox={`0 0 ${imgNaturalSize.w} ${imgNaturalSize.h}`}
                xmlns="http://www.w3.org/2000/svg"
                >
                <defs>
                    {/* Cut a hole in the dark rect exactly where the focus box is */}
                    <mask id="focusMask">
                    {/* White = show dark overlay */}
                    <rect width="100%" height="100%" fill="white" />
                    {/* Black = hide dark overlay (punches a clear hole) */}
                    <rect
                        x={boxPos.x}
                        y={boxPos.y}
                        width={bSize.w}
                        height={bSize.h}
                        fill="black"
                    />
                    </mask>
                </defs>
                {/* Dark overlay applied only outside the hole */}
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.6)"
                    mask="url(#focusMask)"
                />
                </svg>
            )}

            {/* Draggable focus box */}
            {imgLoaded && (
                <div
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    position : 'absolute',
                    left     : boxPos.x,
                    top      : boxPos.y,
                    width    : bSize.w,
                    height   : bSize.h,
                    cursor   : dragging ? 'grabbing' : 'grab',
                    // Punch through the dark overlay so the image inside the box is visible
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.05)',
                }}
                >
                {/* Clear window — shows original image brightness */}
                <div className="absolute inset-0"
                    style={{ background: 'transparent', backdropFilter: 'none' }}
                />

                {/* Border */}
                <div className="absolute inset-0 border-2 border-emerald-400 rounded-sm" />

                {/* Size label top */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-400 text-black font-['DM_Mono'] text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
                    {width} × {height}
                </div>

                {/* Corner handles */}
                {[
                    '-translate-x-1/2 -translate-y-1/2 top-0 left-0',
                    'translate-x-1/2  -translate-y-1/2 top-0 right-0',
                    '-translate-x-1/2  translate-y-1/2 bottom-0 left-0',
                    'translate-x-1/2   translate-y-1/2 bottom-0 right-0',
                ].map((cls, i) => (
                    <div key={i} className={`absolute w-3 h-3 bg-emerald-400 rounded-full ${cls}`} />
                ))}

                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-5 h-5 opacity-50">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400" />
                    </div>
                </div>
                </div>
            )}

            {/* Loading state */}
            {!imgLoaded && !imgError && (
                <div className="max-w-full rounded-xl animate-pulse flex items-center justify-center">
                <span className="font-['DM_Mono'] text-white/20 text-xs tracking-wider">
                    Fetching image from {domain}...
                </span>
                </div>
            )}

            {/* Error state */}
            {imgError && (
                <div className="max-w-full bg-red-950/20 border border-red-500/20 rounded-xl flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full border border-red-400/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <div className="text-center px-8">
                    <p className="font-['Syne'] text-white/60 text-sm mb-1">Could not load image</p>
                    <p className="font-['DM_Mono'] text-red-400/60 text-xs break-all">{imageUrl}</p>
                </div>
                </div>
            )}
            </div>

            {/* Save button */}
            {imgLoaded && !status && (
            <button
                onClick={handleSave}
                className="px-10 py-3 bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-black font-['Syne'] font-bold text-sm tracking-widest uppercase rounded-xl transition-all duration-150 shadow-[0_0_40px_rgba(52,211,153,0.25)]"
            >
                Save Focus
            </button>
            )}
        </main>

        {/* Status overlay */}
        {status && (
            <StatusOverlay
            status={status}
            errorMsg={errorMsg}
            onRetry={() => setStatus(null)}
            />
        )}
    </div>
  )
}

export default FocusPicker