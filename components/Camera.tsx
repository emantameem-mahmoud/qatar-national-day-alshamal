import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Pinch gesture state
  const touchStartDist = useRef<number>(0);
  const startZoom = useRef<number>(1);

  const stopMediaTracks = (mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  };

  const startCamera = async () => {
    // Stop any existing stream before starting a new one
    stopMediaTracks(stream);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode, 
          aspectRatio: 1,
        },
        audio: false,
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Reset Zoom and Flash states on camera switch
      setZoom(1);
      setIsFlashOn(false);

      // Check for flash capability
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      // @ts-ignore - torch is not always in standard types
      if (capabilities.torch) {
        setHasFlash(true);
      } else {
        setHasFlash(false);
      }

    } catch (err) {
      console.error("Camera access error:", err);
      setError("تعذر الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
    }
  };

  // Re-run startCamera whenever facingMode changes
  useEffect(() => {
    startCamera();
    return () => {
      stopMediaTracks(stream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any]
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Flash toggle failed", err);
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchStartDist.current = dist;
      startZoom.current = zoom;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const ratio = dist / touchStartDist.current;
      const newZoom = Math.min(Math.max(startZoom.current * ratio, 1), 3);
      setZoom(newZoom);
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas to video natural dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Calculate crop area based on digital zoom
        const sWidth = video.videoWidth / zoom;
        const sHeight = video.videoHeight / zoom;
        const sx = (video.videoWidth - sWidth) / 2;
        const sy = (video.videoHeight - sHeight) / 2;

        // Mirror effect handling (Only for front camera)
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        // Draw the cropped portion to the full canvas
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageSrc);
      }
    }
  }, [onCapture, zoom, facingMode]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div 
        ref={containerRef}
        className="relative w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-inner mb-4 border-4 border-[#8A1538] touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {!stream && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 animate-pulse">
            جاري تشغيل الكاميرا...
          </div>
        )}
        {error ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
             <p className="text-red-600 mb-4">{error}</p>
             <label className="cursor-pointer bg-[#8A1538] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition">
               رفع صورة من الجهاز
               <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </label>
           </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                transform: `scale(${zoom}) ${facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'}`, // Mirror only if user facing
                transformOrigin: 'center' 
              }}
              className="w-full h-full object-cover transition-transform duration-75"
            />
            
            {/* Flash Button (Top Left) */}
            {hasFlash && (
              <button 
                onClick={toggleFlash}
                className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm z-10"
              >
                {isFlashOn ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
              </button>
            )}

            {/* Switch Camera Button (Top Right) */}
            <button 
                onClick={toggleCamera}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm z-10 hover:bg-black/70 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
            
            {/* Zoom Indicator (Bottom Right) */}
            {zoom > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm pointer-events-none">
                {zoom.toFixed(1)}x
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Zoom Slider */}
      {stream && (
        <div className="w-full px-8 mb-4 flex items-center gap-4">
           <span className="text-xs text-gray-500">1x</span>
           <input 
             type="range" 
             min="1" 
             max="3" 
             step="0.1" 
             value={zoom} 
             onChange={handleZoomChange}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A1538]"
           />
           <span className="text-xs text-gray-500">3x</span>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {stream && (
        <div className="flex flex-col gap-4 w-full px-4">
          <button
            onClick={capturePhoto}
            className="w-full bg-[#8A1538] text-white py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            التقاط صورة
          </button>
          
          <label className="w-full bg-white text-[#8A1538] border-2 border-[#8A1538] py-3 rounded-full font-bold text-center cursor-pointer hover:bg-gray-50 transition">
            أو اختر من المعرض
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}
    </div>
  );
};
