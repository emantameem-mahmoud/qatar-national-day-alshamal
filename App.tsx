import React, { useState, useRef, useEffect } from 'react';
import { AppStep } from './types';
import { Camera } from './components/Camera';
import { Credits } from './components/Credits';
import { generateQatarNationalDayImage } from './services/geminiService';

// Filter Definitions
const FILTERS = [
  { id: 'normal', name: 'طبيعي', style: '', ctxFilter: 'none' },
  { id: 'qatar-flag', name: 'ألوان قطر', style: 'grayscale(1) sepia(1) hue-rotate(320deg) saturate(4) brightness(0.8) contrast(1.2)', ctxFilter: 'grayscale(1) sepia(1) hue-rotate(320deg) saturate(4) brightness(0.8) contrast(1.2)' },
  { id: 'sketch', name: 'رسم', style: 'grayscale(1) contrast(3) brightness(1.2)', ctxFilter: 'grayscale(1) contrast(3) brightness(1.2)' },
  { id: 'sepia', name: 'سيبيا', style: 'sepia(1)', ctxFilter: 'sepia(1)' },
  { id: 'vintage', name: 'تراثي', style: 'sepia(0.6) contrast(1.2)', ctxFilter: 'sepia(0.6) contrast(1.2)' },
  { id: 'bw', name: 'أبيض وأسود', style: 'grayscale(1)', ctxFilter: 'grayscale(1)' },
  { id: 'warm', name: 'دافئ', style: 'sepia(0.2) saturate(1.4)', ctxFilter: 'sepia(0.2) saturate(1.4)' },
  { id: 'cool', name: 'بارد', style: 'hue-rotate(30deg) saturate(1.1)', ctxFilter: 'hue-rotate(30deg) saturate(1.1)' },
  { id: 'glitch', name: 'غليتش', style: 'contrast(1.5) saturate(1.5) hue-rotate(180deg)', ctxFilter: 'contrast(1.5) saturate(1.5) hue-rotate(180deg)' },
];

// Shared Symbols Data
const QATARI_SYMBOLS_DATA = [
  // Flag (Serrated Edge)
  { path: "M0,10 L10,10 L10,0 L12,2 L14,0 L16,2 L18,0 L20,2 L22,0 L24,2 L26,0 L28,2 L30,0 L30,20 L0,20 Z", viewBox: "0 0 30 20" },
  // Dallah (Coffee Pot - Stylized)
  { path: "M10,25 C10,25 5,20 5,10 C5,5 8,2 15,2 C22,2 25,5 25,10 C25,20 20,25 20,25 L20,28 L30,20 L28,15 M15,2 L15,0", viewBox: "0 0 35 30" },
  // Oryx (Stylized Horns/Head)
  { path: "M10,25 L5,5 L15,15 L25,5 L20,25 Q15,30 10,25", viewBox: "0 0 30 30" },
  // Star/Islamic Geometry
  { path: "M15,0 L18,10 L29,10 L20,16 L23,26 L15,20 L7,26 L10,16 L1,10 L12,10 Z", viewBox: "0 0 30 30" }
];

// Processing Loader Component
const ProcessingLoader = () => {
  const [progress, setProgress] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    // Progress bar simulation (fast at first, slows down)
    const timer = setInterval(() => {
      setProgress((prev) => {
        const increment = prev < 60 ? 1.5 : prev < 85 ? 0.5 : 0.1;
        return Math.min(prev + increment, 99);
      });
    }, 50);

    // Icon cycler
    const iconTimer = setInterval(() => {
        setIconIndex(prev => (prev + 1) % QATARI_SYMBOLS_DATA.length);
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(iconTimer);
    };
  }, []);

  return (
    <div className="text-center animate-fade-in bg-white/90 p-8 rounded-3xl backdrop-blur-md shadow-2xl border-4 border-[#8A1538]/10 max-w-sm w-full mx-auto">
        {/* Icon Cycle */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
             {/* Pulsing Background */}
             <div className="absolute inset-0 bg-[#8A1538]/5 rounded-full animate-pulse"></div>
             
             {/* Outer spinning ring */}
             <div className="absolute inset-0 border-4 border-[#8A1538]/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-[#8A1538] border-t-transparent border-l-transparent rounded-full animate-spin"></div>
             
             {/* Center Icon */}
             <div key={iconIndex} className="w-14 h-14 text-[#8A1538] animate-pop-in transition-all duration-300">
                <svg viewBox={QATARI_SYMBOLS_DATA[iconIndex].viewBox} fill="currentColor" className="w-full h-full drop-shadow-md">
                    <path d={QATARI_SYMBOLS_DATA[iconIndex].path} />
                </svg>
             </div>
        </div>

        <h3 className="text-2xl font-bold text-[#8A1538] mb-2">جاري التجهيز...</h3>
        <p className="text-gray-600 font-medium mb-6 text-sm">يتم الآن دمج صورتك مع أجواء قطر 2025</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner relative">
            <div 
                className="bg-[#8A1538] h-full rounded-full transition-all duration-100 ease-out relative overflow-hidden flex items-center justify-end" 
                style={{ width: `${progress}%` }}
            >
                {/* Shimmer on bar */}
                <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{ width: '100%', transformOrigin: 'left' }}></div>
            </div>
        </div>
        <div className="flex justify-between w-full mt-2 px-1">
           <span className="text-[10px] text-gray-400 font-mono">AI PROCESSING</span>
           <span className="text-[10px] text-[#8A1538] font-bold font-mono">{Math.floor(progress)}%</span>
        </div>
    </div>
  );
};

// Falling Confetti Component for Result Screen
const FallingConfetti = () => {
  const pieces = Array.from({ length: 50 }).map((_, i) => {
    const left = Math.random() * 100;
    const animDelay = Math.random() * 5;
    const animDuration = Math.random() * 3 + 4; // 4-7s
    const isGold = Math.random() > 0.5;
    
    return {
      id: i,
      style: {
        left: `${left}%`,
        animationDelay: `${animDelay}s`,
        animationDuration: `${animDuration}s`,
        backgroundColor: isGold ? '#D4AF37' : '#8A1538',
      }
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110%) rotate(720deg); opacity: 0; }
          }
          .confetti-piece {
            position: absolute;
            top: -20px;
            width: 8px;
            height: 16px;
            opacity: 0;
            animation: fall linear infinite;
          }
        `}
      </style>
      {pieces.map((p) => (
        <div key={p.id} className="confetti-piece" style={p.style} />
      ))}
    </div>
  );
};

// Qatari Symbols Component
const QatariSymbolsBackground = () => {
  // Generate random particles
  const particles = Array.from({ length: 35 }).map((_, i) => {
    const symbol = QATARI_SYMBOLS_DATA[Math.floor(Math.random() * QATARI_SYMBOLS_DATA.length)];
    const size = Math.random() * 50 + 25; // 25px to 75px
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 12 + 8; // 8s to 20s
    const delay = Math.random() * -20; // Start at random times
    const isGold = Math.random() > 0.5; // 50% Gold

    return {
      id: i,
      symbol,
      style: {
        position: 'absolute' as 'absolute',
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        color: isGold ? '#FFD700' : '#FFFFFF', // Bright Gold or White
        opacity: isGold ? 0.9 : 0.5,
        filter: isGold ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))'
      }
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div 
          key={p.id} 
          className="animate-float-up animate-pulse-glow"
          style={p.style}
        >
          <svg 
            viewBox={p.symbol.viewBox} 
            fill="currentColor" 
            className="w-full h-full"
          >
            <path d={p.symbol.path} />
          </svg>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.WELCOME);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // Background State
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [customBgVideo, setCustomBgVideo] = useState<string | null>(null);
  const [showBgMenu, setShowBgMenu] = useState(false);

  // Confetti State (Initial Explosion)
  const [showConfetti, setShowConfetti] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, style: React.CSSProperties}>>([]);

  // Trigger confetti when Result step is reached
  useEffect(() => {
    if (currentStep === AppStep.RESULT) {
      setShowConfetti(true);
      
      // Generate random sparkles for initial burst
      const newSparkles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        style: {
          left: '50%',
          top: '50%',
          backgroundColor: Math.random() > 0.5 ? '#8A1538' : '#FFFFFF',
          '--tx': `${(Math.random() - 0.5) * 400}px`,
          '--ty': `${(Math.random() - 0.5) * 400}px`,
          animationDelay: `${Math.random() * 0.5}s`
        } as React.CSSProperties
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleStart = () => {
    setCurrentStep(AppStep.CAPTURE);
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    // Set default filter to Qatar Flag Colors for a nice effect
    const defaultFilter = FILTERS.find(f => f.id === 'qatar-flag') || FILTERS[0];
    handleFilterSelect(defaultFilter);
    setCurrentStep(AppStep.PREVIEW);
  };

  const handleFilterSelect = (filter: typeof FILTERS[0]) => {
    setIsFilterLoading(true);
    setSelectedFilter(filter);
    // Simulate loading delay for visual feedback
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 400);
  };

  const applyFilterAndGenerate = async () => {
    if (!capturedImage) return;

    setCurrentStep(AppStep.PROCESSING);

    try {
      // Apply filter to image before sending if it's not normal
      let finalImage = capturedImage;

      if (selectedFilter.id !== 'normal') {
        const img = new Image();
        img.src = capturedImage;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.filter = selectedFilter.ctxFilter;
          ctx.drawImage(img, 0, 0);
          finalImage = canvas.toDataURL('image/jpeg', 0.95);
        }
      }

      const generated = await generateQatarNationalDayImage(finalImage);
      setResultImage(generated);
      setCurrentStep(AppStep.RESULT);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.");
      setCurrentStep(AppStep.ERROR);
    }
  };

  const handleShare = async () => {
    if (resultImage && navigator.share) {
      try {
        const blob = await (await fetch(resultImage)).blob();
        const file = new File([blob], 'qatar-national-day-2025.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'احتفالات اليوم الوطني - قطر 2025',
          text: 'شاهد صورتي في احتفالات اليوم الوطني لمدرسة الشمال!',
          files: [file],
        });
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    } else {
      // Fallback or alert if share not supported
      alert('الرجاء حفظ الصورة أولاً ثم مشاركتها عبر تطبيقات التواصل الاجتماعي.');
    }
  };

  const handlePrint = () => {
    if (!resultImage) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <title>طباعة صورة اليوم الوطني</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body { 
              font-family: 'Tajawal', sans-serif; 
              background: white;
              margin: 0;
              padding: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .container {
              width: 100%;
              height: 100%;
              max-width: 210mm;
              max-height: 297mm;
              padding: 10mm 15mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              text-align: center;
            }
            .header {
              width: 100%;
              border-bottom: 2px solid #8A1538;
              padding-bottom: 15px;
              margin-bottom: 10px;
            }
            .school-name {
              color: #8A1538;
              font-size: 26px;
              font-weight: 800;
              margin-bottom: 8px;
            }
            .title {
              color: #333;
              font-size: 18px; 
              font-weight: 700; 
            }
            .subtitle {
              color: #555;
              font-size: 16px;
              margin-top: 4px;
            }
            .image-container {
              flex-grow: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              overflow: hidden;
              padding: 10px 0;
            }
            img { 
              max-width: 95%; 
              max-height: 100%; 
              object-fit: contain;
              border-radius: 8px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .footer { 
              width: 100%;
              border-top: 1px solid #8A1538;
              padding-top: 15px;
              color: #333; 
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .admin-row {
              display: flex;
              justify-content: space-between;
              width: 100%;
              font-weight: 700;
              font-size: 14px;
              line-height: 1.4;
            }
            .admin-item {
              display: flex;
              flex-direction: column;
            }
            .vision {
              font-size: 14px;
              color: #555;
              font-weight: 800;
              margin-top: 5px;
            }
            .execution {
              font-size: 12px;
              color: #777;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .container { height: 100vh; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
               <div class="school-name">مدرسة الشمال الابتدائية للبنات</div>
               <div class="title">احتفالات اليوم الوطني - قطر 2025</div>
               <div class="subtitle">بكم تعلو ومنكم تنتظر</div>
            </div>
            
            <div class="image-container">
              <img src="${resultImage}" onload="setTimeout(function(){window.print();}, 500);" />
            </div>
            
            <div class="footer">
              <div class="admin-row">
                 <div class="admin-item" style="text-align: right;">
                    <span>النائبة الأكاديمية</span>
                    <span>لولوة السادة</span>
                 </div>
                 <div class="admin-item" style="text-align: center;">
                    <span>النائبة الإدارية</span>
                    <span>عائشة شمسان السادة</span>
                 </div>
                 <div class="admin-item" style="text-align: left;">
                    <span>مديرة المدرسة</span>
                    <span>مريم مبارك الحسيني</span>
                 </div>
              </div>
              
              <div class="vision">الرؤية: متعلم ريادي تنمية مستدامة</div>
              <div class="execution">إعداد وتنفيذ / إيمان محمود</div>
            </div>
          </div>
          <script>
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResultImage(null);
    setErrorMsg(null);
    setSelectedFilter(FILTERS[0]);
    setShowConfetti(false);
    setCurrentStep(AppStep.WELCOME);
  };

  const handleCustomBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBgImage(reader.result as string);
        setCustomBgVideo(null); // Clear video if image selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setCustomBgVideo(videoUrl);
      setCustomBgImage(null); // Clear image if video selected
    }
  };

  // Determine which background is currently being used for UI state
  const isDefaultBg = !customBgImage && !customBgVideo;
  const isCustomBg = !!customBgImage || !!customBgVideo;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-100 font-sans text-right" dir="rtl">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#8A1538] via-[#6d102b] to-[#4a0b1e] transition-colors duration-1000">
         {customBgImage ? (
           <div 
             className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
             style={{ backgroundImage: `url(${customBgImage})` }}
           />
         ) : customBgVideo ? (
            <video
              src={customBgVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            />
         ) : (
            // Default Animated Qatari Symbols
            <QatariSymbolsBackground />
         )}
         
         {/* Overlay gradient for readability - Lighter on top/bottom */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none"></div>
         {/* White pattern overlay for texture */}
         {!customBgImage && !customBgVideo && (
            <div className="absolute inset-0 opacity-10 pointer-events-none pattern-bg"></div>
         )}
      </div>

      {/* Header Section */}
      <div className="relative z-20 w-full p-4 text-center">
         <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-b-2xl py-3 px-6 inline-block mx-auto border-b-4 border-[#8A1538]">
            <h2 className="text-[#8A1538] font-bold text-lg md:text-xl">مدرسة الشمال الابتدائية للبنات</h2>
            <p className="text-gray-700 text-sm mt-1 font-medium">مديرة المدرسة: أ. مريم مبارك الحسيني</p>
         </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] p-6 w-full max-w-lg mx-auto">
        
        {/* Welcome Screen */}
        {currentStep === AppStep.WELCOME && (
          <div className="flex flex-col items-center space-y-8 animate-fade-in-down w-full">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg tracking-tight animate-bounce-subtle">
                قطر 2025
              </h1>
              <div className="h-1.5 w-32 bg-white/80 mx-auto mt-4 rounded-full shadow-lg"></div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-white/60 shadow-xl text-center transform hover:scale-105 transition duration-300">
               <p className="text-2xl text-[#8A1538] font-bold leading-relaxed font-serif">
                 بكم تعلو ومنكم تنتظر
               </p>
               <p className="text-sm text-gray-600 mt-2 font-medium">
                 التقطي صورة واكتشفي سحر اليوم الوطني
               </p>
            </div>

            <button
              onClick={handleStart}
              className="bg-white text-[#8A1538] text-xl font-bold py-4 px-12 rounded-full shadow-2xl hover:shadow-[#8A1538]/50 hover:bg-gray-50 hover:scale-105 transition-all duration-300 transform active:scale-95 ring-4 ring-white/30"
            >
              ابدأ التجربة
            </button>

            {/* Background Settings Toggle */}
            <div className="mt-8 relative">
              <button 
                onClick={() => setShowBgMenu(!showBgMenu)}
                className="flex items-center gap-2 text-sm text-white font-medium bg-black/20 hover:bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition border border-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                خلفية التطبيق
              </button>

              {/* Background Menu */}
              {showBgMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl p-4 w-64 border border-gray-100 animate-fade-in z-30">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-400 mb-2 text-center">اختر الخلفية</div>
                    
                    {/* Default Option */}
                    <button 
                      onClick={() => {
                        setCustomBgImage(null);
                        setCustomBgVideo(null);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isDefaultBg ? 'border-[#8A1538] bg-[#8A1538]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className="text-sm font-medium text-gray-700">رموز قطرية متحركة</span>
                      {isDefaultBg && <span className="text-[#8A1538]">✓</span>}
                    </button>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Custom Uploads */}
                    <div className={`rounded-lg border p-3 transition-all ${isCustomBg ? 'border-[#8A1538] bg-[#8A1538]/5' : 'border-gray-200'}`}>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-medium text-gray-700">ميديا خاصة</span>
                         {isCustomBg && <span className="text-[#8A1538]">✓</span>}
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-xs text-center py-2 rounded text-gray-600 transition">
                            رفع صورة
                            <input type="file" accept="image/*" className="hidden" onChange={handleCustomBgUpload} />
                          </label>
                          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-xs text-center py-2 rounded text-gray-600 transition">
                            رفع فيديو
                            <input type="file" accept="video/*" className="hidden" onChange={handleCustomVideoUpload} />
                          </label>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capture Screen */}
        {currentStep === AppStep.CAPTURE && (
           <div className="w-full animate-fade-in bg-white/30 backdrop-blur-sm p-4 rounded-3xl border border-white/40 shadow-xl">
             <Camera onCapture={handleCapture} />
             <div className="text-center mt-4">
               <button onClick={handleReset} className="text-white font-bold underline text-sm drop-shadow-md">رجوع للقائمة الرئيسية</button>
             </div>
           </div>
        )}

        {/* Preview & Filter Screen */}
        {currentStep === AppStep.PREVIEW && capturedImage && (
          <div className="w-full flex flex-col items-center animate-fade-in space-y-6 bg-white/90 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="relative w-full max-w-sm aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-lg border-4 border-[#8A1538]">
               <img 
                 src={capturedImage} 
                 alt="Preview" 
                 className="w-full h-full object-cover transition-all duration-300"
                 style={{ filter: selectedFilter.style }}
               />
               {isFilterLoading && (
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                 </div>
               )}
            </div>
            
            <div className="w-full max-w-sm">
               <p className="text-center text-[#8A1538] font-bold mb-3 text-sm">اختر تأثير الصورة:</p>
               <div className="flex gap-3 overflow-x-auto pb-4 px-2 no-scrollbar justify-start md:justify-center touch-pan-x">
                 {FILTERS.map((filter) => (
                   <button
                     key={filter.id}
                     onClick={() => handleFilterSelect(filter)}
                     className={`flex-shrink-0 flex flex-col items-center gap-2 group transition-all duration-200 ${selectedFilter.id === filter.id ? 'transform scale-110' : 'opacity-70 hover:opacity-100'}`}
                   >
                     <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-sm ${selectedFilter.id === filter.id ? 'border-[#8A1538] ring-2 ring-[#8A1538]/30' : 'border-gray-200'}`}>
                       <img 
                         src={capturedImage} 
                         alt={filter.name} 
                         className="w-full h-full object-cover"
                         style={{ filter: filter.style }}
                       />
                     </div>
                     <span className={`text-xs font-medium ${selectedFilter.id === filter.id ? 'text-[#8A1538]' : 'text-gray-600'}`}>{filter.name}</span>
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button
                onClick={() => setCurrentStep(AppStep.CAPTURE)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                إعادة
              </button>
              <button
                onClick={applyFilterAndGenerate}
                className="flex-[2] bg-[#8A1538] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#6d102b] transition flex items-center justify-center gap-2"
              >
                <span>✨ دمج بالذكاء الاصطناعي</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing Screen */}
        {currentStep === AppStep.PROCESSING && (
           <ProcessingLoader />
        )}

        {/* Result Screen */}
        {currentStep === AppStep.RESULT && resultImage && (
          <div className="w-full flex flex-col items-center animate-fade-in space-y-6 bg-white/40 p-6 rounded-3xl shadow-2xl backdrop-blur-md border border-white/50 relative overflow-hidden">
            
            {/* Background Falling Confetti Loop */}
            <FallingConfetti />

            {/* Initial Explosion Confetti Elements */}
            {showConfetti && sparkles.map((sparkle) => (
              <div key={sparkle.id} className="sparkle z-20" style={sparkle.style} />
            ))}

            <div className="relative w-full max-w-sm bg-white p-2 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500 z-10">
               <div className="relative overflow-hidden rounded-xl border-2 border-[#8A1538]/10 group">
                 <img 
                   id="result-img"
                   src={resultImage} 
                   alt="Result" 
                   className="w-full h-auto animate-pop-in relative z-10"
                 />
                 
                 {/* Shimmer Overlay */}
                 <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>

                 {/* Original Image Toggle (Optional Overlay) */}
                 <div className="absolute bottom-2 right-2 flex gap-2 z-30">
                    <button 
                       onMouseDown={() => {
                          const img = document.querySelector('#result-img') as HTMLImageElement;
                          if(img && capturedImage) img.src = capturedImage;
                       }}
                       onMouseUp={() => {
                          const img = document.querySelector('#result-img') as HTMLImageElement;
                          if(img && resultImage) img.src = resultImage;
                       }}
                       onTouchStart={() => {
                          const img = document.querySelector('#result-img') as HTMLImageElement;
                          if(img && capturedImage) img.src = capturedImage;
                       }}
                       onTouchEnd={() => {
                          const img = document.querySelector('#result-img') as HTMLImageElement;
                          if(img && resultImage) img.src = resultImage;
                       }}
                       className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm"
                    >
                       اضغط باستمرار لرؤية الأصل
                    </button>
                 </div>
               </div>
               
               <div className="absolute -top-3 -left-3 bg-[#8A1538] text-white w-12 h-12 flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-white text-xs z-10">
                 2025
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm z-10">
               <button
                onClick={handleShare}
                className="col-span-1 bg-green-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                مشاركة واتساب
              </button>

              <button
                onClick={handlePrint}
                className="col-span-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                طباعة فورية
              </button>
            </div>
            
            <button
              onClick={handleReset}
              className="text-white drop-shadow-md font-bold underline text-sm mt-2 hover:text-[#8A1538] z-10"
            >
              التقاط صورة جديدة
            </button>
          </div>
        )}

        {/* Error Screen */}
        {currentStep === AppStep.ERROR && (
          <div className="text-center animate-fade-in bg-white/90 p-8 rounded-3xl shadow-xl max-w-xs border-2 border-red-100">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-red-800 mb-2">عذراً، حدث خطأ</h3>
            <p className="text-gray-600 mb-6 text-sm">{errorMsg}</p>
            <button
              onClick={() => setCurrentStep(AppStep.CAPTURE)}
              className="bg-[#8A1538] text-white py-2 px-6 rounded-full font-bold shadow-lg hover:opacity-90 transition"
            >
              المحاولة مرة أخرى
            </button>
          </div>
        )}
      </div>

      <Credits />
    </div>
  );
};

export default App;