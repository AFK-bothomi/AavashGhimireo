import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  RotateCcw, 
  Smile, 
  Cake as CakeIcon, 
  Flame, 
  Star 
} from 'lucide-react';
import { ConfettiRef, ConfettiCanvas } from './components/ConfettiCanvas';
import MemoryLane from './components/MemoryLane';
import { 
  initAudioContext, 
  playCandleBlow, 
  playCelebrationChime, 
  playHappyBirthday, 
  stopHappyBirthday, 
  isHappyBirthdayPlaying 
} from './utils/audio';

interface Candle {
  id: number;
  lit: boolean;
  color: string;
  xPercent: number; // position across the top cake tier
}

export default function App() {
  const [portalState, setPortalState] = useState<'locked' | 'celebrating' | 'wishes'>('locked');
  const [isBoxOpening, setIsBoxOpening] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [wishHearts, setWishHearts] = useState<{ id: number; left: number; delay: number; scale: number }[]>([]);
  
  // Create 5 candles with different pastel wax colors
  const [candles, setCandles] = useState<Candle[]>([
    { id: 1, lit: true, color: '#FFB7B2', xPercent: 18 },
    { id: 2, lit: true, color: '#FFDAC1', xPercent: 34 },
    { id: 3, lit: true, color: '#E2F0CB', xPercent: 50 },
    { id: 4, lit: true, color: '#B5EAD7', xPercent: 66 },
    { id: 5, lit: true, color: '#C7CEEA', xPercent: 82 },
  ]);

  const confettiRef = useRef<ConfettiRef | null>(null);

  // Initialize background floating elements in interactive state
  useEffect(() => {
    // Generate some static properties for floating wishes hearts background
    const hearts = Array.from({ length: 18 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      scale: Math.random() * 0.6 + 0.5,
    }));
    setWishHearts(hearts);
  }, []);

  // Sync music state changes
  useEffect(() => {
    if (portalState !== 'locked' && isMusicOn) {
      playHappyBirthday(true, () => {});
    } else {
      stopHappyBirthday();
    }
    return () => stopHappyBirthday();
  }, [isMusicOn, portalState]);

  // Handle auto-triggering details
  const triggerBoxUnlock = (e: React.MouseEvent) => {
    if (isBoxOpening) return;
    setIsBoxOpening(true);
    
    // Play sweet chime first
    initAudioContext();
    playCelebrationChime();
    
    // Animate box opening, then transition state
    setTimeout(() => {
      setPortalState('celebrating');
      setIsMusicOn(true);
      setIsBoxOpening(false);
      
      // Delay immediate grand celebrate to synchronize with visual pop
      setTimeout(() => {
        confettiRef.current?.celebrate(120);
      }, 300);
    }, 1200);
  };

  const handleCelebrateClick = (e: React.MouseEvent) => {
    // Sparkle chime
    playCelebrationChime();
    setCelebrationCount(prev => prev + 1);

    // Burst at click position
    if (confettiRef.current) {
      confettiRef.current.burst(e.clientX, e.clientY, 35);
      // Double side explosion 
      confettiRef.current.celebrate(80);
    }
  };

  // Blow out a candle
  const blowCandle = (id: number) => {
    setCandles(prev =>
      prev.map(c => (c.id === id ? { ...c, lit: false } : c))
    );
    playCandleBlow();

    // Spawn tiny explosion on blow
    if (confettiRef.current) {
      const parentRect = document.getElementById(`candle-pos-${id}`)?.getBoundingClientRect();
      if (parentRect) {
        confettiRef.current.burst(
          parentRect.left + parentRect.width / 2,
          parentRect.top,
          15
        );
      }
    }
  };

  // Check if all candles are blown out
  const allCandlesBlownOut = candles.every(c => !c.lit);

  const resetCandles = () => {
    setCandles(prev => prev.map(c => ({ ...c, lit: true })));
    playCelebrationChime();
    confettiRef.current?.celebrate(60);
  };

  const handleMusicToggle = () => {
    initAudioContext();
    setIsMusicOn(!isMusicOn);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-rose-50 via-purple-50 to-amber-50 text-slate-800 font-sans overflow-hidden select-none flex flex-col items-center justify-between">
      
      {/* Absolute Confetti Particle Layer */}
      <ConfettiCanvas ref={confettiRef} />

      {/* Background Decorative Ambient Blobs */}
      <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-rose-200/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-purple-200/20 blur-3xl animate-float-slow [animation-delay:2s]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-amber-200/10 blur-3xl animate-float-slow [animation-delay:1s]" />
      </div>

      {/* Floating Music Toggle Fixed at Top Right */}
      {portalState !== 'locked' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleMusicToggle}
          className={`fixed top-4 right-4 md:top-6 md:right-6 z-50 flex items-center justify-center p-3 rounded-full shadow-lg border backdrop-blur-md cursor-pointer transition-all ${
            isMusicOn 
              ? 'bg-rose-500 text-white border-rose-400 ring-4 ring-rose-200' 
              : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isMusicOn ? "Pause Music" : "Play Music Box"}
          id="music-toggle-btn"
        >
          {isMusicOn ? <Volume2 className="h-5 w-5 animate-pulse" /> : <VolumeX className="h-5 w-5" />}
        </motion.button>
      )}

      {/* Main Page Layout Wrapper */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <AnimatePresence mode="wait">
          
          {/* ==================== 1. THE ENTRY LOCK PAGE ==================== */}
          {portalState === 'locked' && (
            <motion.div
              key="locked-screen"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex flex-col items-center text-center space-y-8 py-8 w-full"
              id="view-entry-page"
            >
              {/* Header Titles */}
              <div className="space-y-3 px-4">
                <motion.span 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold uppercase tracking-wider"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Specially Created for Mom
                </motion.span>
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-6xl font-serif font-semibold tracking-tight text-slate-900 leading-tight"
                >
                  A Loving Birthday <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Surprise</span> is Waiting...
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-slate-600 text-sm md:text-base max-w-lg mx-auto font-sans font-medium"
                >
                  Hello, Mom! Today is all about you. Click the golden present below to open your beautiful portal.
                </motion.p>
              </div>

              {/* Box Presentation & Interactive Arc */}
              <div className="relative flex items-center justify-center h-64 md:h-80 w-full">
                {/* Golden pulsing ripple circles in background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-48 h-48 rounded-full border border-amber-300/40 animate-pulse-ring" />
                  <div className="absolute w-64 h-64 rounded-full border border-rose-300/20 animate-pulse-ring [animation-delay:1s]" />
                </div>

                <motion.div
                  className="relative cursor-pointer z-10"
                  animate={isBoxOpening ? {
                    scale: [1, 1.2, 0.8, 1.4],
                    rotate: [0, -10, 10, -5, 5, 0],
                  } : {
                    y: [0, -8, 0],
                  }}
                  transition={isBoxOpening ? {
                    duration: 1.1,
                    ease: "easeInOut",
                  } : {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  onClick={triggerBoxUnlock}
                >
                  {/* Visual Gift wrapped box (CSS Drawn + Lucide hybrid for luxurious feel) */}
                  <div className="relative select-none p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-300 shadow-2xl transition duration-500 hover:shadow-amber-200/50 flex flex-col items-center">
                    
                    {/* Ribbon knot on top */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex space-x-2">
                      <div className="w-8 h-8 rounded-full bg-rose-500 border border-rose-400 rotate-45 transform origin-bottom-right" />
                      <div className="w-8 h-8 rounded-full bg-rose-500 border border-rose-400 -rotate-45 transform origin-bottom-left" />
                    </div>

                    <Gift className="h-20 w-20 md:h-28 md:w-28 text-amber-500 stroke-[1.25] drop-shadow-md" />
                    
                    {/* Horizontal vertical rose ribbons */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-rose-500 border-x border-rose-400 pointer-events-none" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-rose-500 border-y border-rose-400 pointer-events-none" />
                  </div>
                </motion.div>
              </div>

              {/* Lock Action Button CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 }}
                className="relative z-20"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerBoxUnlock}
                  className="px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold text-base md:text-lg rounded-full shadow-lg hover:shadow-xl hover:shadow-rose-300 transition-all cursor-pointer flex items-center gap-2"
                  id="unlock-surprise-btn"
                >
                  <span>Unlock Your Birthday Surprise 🎁</span>
                  {isBoxOpening && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ==================== 2. THE CELEBRATION PORTAL SCREEN ==================== */}
          {portalState === 'celebrating' && (
            <motion.div
              key="celebration-portal"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center justify-center text-center space-y-8 py-4 w-full z-10"
              id="view-celebration-portal"
            >
              {/* Dynamic Header */}
              <div className="space-y-2">
                <motion.div 
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: 1, scale: 1 }}
                  className="inline-flex gap-2 items-center bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Happy Birthday to My Wonderful Mom! <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                </motion.div>
                
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                  {allCandlesBlownOut ? (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-rose-600"
                    >
                      Make a Wish, Mom! 💖
                    </motion.span>
                  ) : (
                    <span>Let's Celebrate Your Special Day! 🎂</span>
                  )}
                </h1>
                <p className="text-slate-600 text-xs md:text-sm max-w-md mx-auto font-sans font-medium">
                  {allCandlesBlownOut 
                    ? "Warm magic is in the air. Tap the candles to relit or tap the heart below to read my wishes."
                    : "Blow out the candles by tapping on them, then read my heartfelt wishes!"}
                </p>
              </div>

              {/* DYNAMIC HTML/CSS BIRTHDAY CAKE */}
              <div className="relative py-12 flex flex-col items-center justify-center">
                
                {/* Cake Container */}
                <div className="relative w-72 h-64 flex flex-col justify-end items-center select-none">
                  
                  {/* Plate Base */}
                  <div className="w-80 h-4 bg-slate-200 border-b-2 border-slate-300 rounded-full shadow-md z-0" />

                  {/* BOTTOM LAYER (Strawberry/Raspberry Dark Rose) */}
                  <div className="absolute bottom-4 w-60 h-20 bg-rose-400 rounded-t-xl rounded-b-md shadow-inner border-b-4 border-rose-500 flex justify-between overflow-hidden">
                    {/* frosting drips */}
                    <div className="w-full flex justify-between absolute top-0">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-8 h-6 bg-rose-500 rounded-b-full -mt-2" />
                      ))}
                    </div>
                    {/* Cream Dots decorative */}
                    <div className="w-full flex justify-around items-center h-full pt-4">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                      ))}
                    </div>
                  </div>

                  {/* MIDDLE LAYER (Vanilla with Cream topping) */}
                  <div className="absolute bottom-[90px] w-48 h-16 bg-cream bg-amber-50 rounded-t-lg rounded-b-sm border-b-3 border-amber-100 flex justify-between overflow-hidden">
                    {/* lavender drippings style */}
                    <div className="w-full flex justify-between absolute top-0">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-8 h-4 bg-purple-300 rounded-b-xl" />
                      ))}
                    </div>
                    <div className="w-full flex justify-around items-center h-full pt-4">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-rose-300 opacity-60" />
                      ))}
                    </div>
                  </div>

                  {/* TOP LAYER (Strawberry Pink frosting with delicate gold rim) */}
                  <div className="absolute bottom-[146px] w-36 h-12 bg-pink-100 rounded-t-md rounded-b-xs border-b-2 border-pink-200 flex justify-around items-center overflow-hidden">
                    {/* delicate dark sprinkles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-1 h-3 rounded-full bg-amber-400 rotate-12 -mt-3" />
                    ))}
                  </div>

                  {/* THE CANDLES LAYER */}
                  <div className="absolute bottom-[158px] left-[18%] right-[18%] h-14 flex justify-between items-end pointer-events-auto">
                    {candles.map((candle) => (
                      <div 
                        key={candle.id}
                        id={`candle-pos-${candle.id}`}
                        onClick={() => candle.lit ? blowCandle(candle.id) : setCandles(prev => prev.map(c => c.id === candle.id ? { ...c, lit: true } : c))}
                        style={{ left: `${candle.xPercent}%` }}
                        className="absolute bottom-0 -ml-2.5 flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110"
                      >
                        {/* FLAME */}
                        <AnimatePresence>
                          {candle.lit && (
                            <motion.div
                              initial={{ scale: 0, y: 5 }}
                              animate={{ 
                                scale: [1, 1.15, 0.95, 1],
                                y: 0,
                                skewX: [-2, 2, -1, 3, -2],
                              }}
                              exit={{ opacity: 0, scale: 0, y: -10 }}
                              transition={{ 
                                scale: { duration: 0.3 },
                                y: { duration: 0.3 },
                                skewX: { repeat: Infinity, duration: 1.2, ease: "linear" }
                              }}
                              className="w-3.5 h-6 rounded-full bg-gradient-to-t from-yellow-500 via-amber-400 to-red-500 blur-[0.3px] shadow-lg shadow-amber-300/60 flex items-end justify-center pb-0.5"
                            >
                              {/* Blue Core Flame */}
                              <div className="w-1.5 h-2.5 rounded-full bg-blue-400/80 mb-0.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* WICK */}
                        <div className="w-0.5 h-2 bg-slate-500" />

                        {/* CANDLE BODY */}
                        <div 
                          style={{ backgroundColor: candle.color }}
                          className="w-2 h-10 rounded-t-sm shadow-sm flex flex-col justify-between"
                        >
                          {/* Candle Stripes */}
                          <div className="h-full w-full bg-gradient-to-b from-white/25 to-transparent skew-y-12" />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Candles Status Reset Alert */}
                {allCandlesBlownOut && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -bottom-2 bg-rose-500 text-white rounded-full px-4 py-1 text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <span>Candles Blown Out! 🎂</span>
                    <button 
                      onClick={resetCandles} 
                      className="underline font-bold hover:text-amber-200 cursor-pointer flex items-center gap-0.5"
                    >
                      <RotateCcw className="h-3 w-3" /> Relight candles
                    </button>
                  </motion.div>
                )}
              </div>

              {/* ACTION PREVIEW PANELS WITH CONFETTI TRAINERS */}
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                
                {/* 1. Celebrate Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCelebrateClick}
                  className="w-full md:w-auto px-6 py-3.5 bg-white text-rose-500 border-2 border-rose-400 font-bold rounded-full shadow-md hover:bg-rose-50/50 transition duration-300 cursor-pointer flex items-center justify-center gap-2"
                  id="celebrate-extra-btn"
                >
                  <Sparkles className="h-4.5 w-4.5 text-rose-500 animate-spin" />
                  <span>Celebrate! ✨ {celebrationCount > 0 && `(${celebrationCount})`}</span>
                </motion.button>

                {/* 2. Read Wishes button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    initAudioContext();
                    playCelebrationChime();
                    setPortalState('wishes');
                  }}
                  className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-transparent"
                  id="navigate-wishes-btn"
                >
                  <span>Read My Wishes ❤️</span>
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>

            </motion.div>
          )}

          {/* ==================== 3. THE HEARTFELT WISHES SECTION ==================== */}
          {portalState === 'wishes' && (
            <motion.div
              key="wishes-screen"
              initial={{ opacity: 0, rotateX: 10, y: 30 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -10, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center w-full max-w-3xl px-2 py-4 space-y-8 z-10"
              id="view-wishes-section"
            >
              {/* Back Button */}
              <div className="w-full text-left">
                <button
                  onClick={() => setPortalState('celebrating')}
                  className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600 font-bold text-sm bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm transition duration-300 cursor-pointer"
                  id="back-to-cake-btn"
                >
                  <RotateCcw className="h-4 w-4" /> Back to Cake 🎂
                </button>
              </div>

              {/* Memory Lane Gallery Component (Inserted beautifully) */}
              <div className="w-full">
                <MemoryLane />
              </div>

              {/* Beautiful Parchment Card / Love Letter for Mom */}
              <motion.div 
                className="relative w-full bg-cream-50 bg-[#FDFBF7] p-8 md:p-12 rounded-3xl shadow-xl shadow-rose-200/40 border-4 border-[#F3EFE0] overflow-hidden"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
              >
                {/* Vintage wax seal button decorator */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-rose-700/90 flex items-center justify-center shadow-md shadow-rose-900/30 opacity-95">
                  <Heart className="h-6 w-6 text-amber-100 fill-amber-100 animate-pulse" />
                </div>

                {/* Sub-bg glowing watermark */}
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-rose-50/70 border border-rose-100/40 opacity-40" />

                {/* Content Layout */}
                <div className="space-y-6 relative z-10">
                  <div className="space-y-1">
                    <p className="font-serif italic text-rose-500 font-bold text-lg">My Dearest Mom,</p>
                    <div className="w-16 h-1 bg-gradient-to-r from-rose-400 to-amber-300 rounded" />
                  </div>

                  {/* HEARTFELT LETTER */}
                  <div className="font-serif text-slate-800 text-base md:text-lg leading-relaxed space-y-5">
                    <p className="text-xl md:text-3xl font-bold text-rose-600 tracking-tight leading-snug">
                      Happy birthday to my Mom❤️
                    </p>
                    <p className="whitespace-pre-line text-slate-700 font-medium italic md:text-xl md:leading-relaxed bg-rose-50/45 p-6 rounded-2xl border border-rose-100/50 my-4 shadow-sm">
                      Thank you for always being there for me, even when I'm annoying or hard to handle. I know I don't say it enough, but I really love you and I appreciate everything you do for this family.
                    </p>
                    <p className="text-slate-600 text-sm md:text-base">
                      You are my constant warmth, my peace, and my greatest cheer. Having you as my mother is a blessing that guides everything good in my life. I hope today brings you as much light and happiness as you bring to everyone around you!
                    </p>
                  </div>

                  {/* Loving wishes bullet point list */}
                  <div className="pt-4 border-t border-slate-150 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="text-amber-500 mt-1">✨</span>
                      <p className="text-slate-600 text-sm font-medium">To always laughing through the storms of life together.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-amber-500 mt-1">✨</span>
                      <p className="text-slate-600 text-sm font-medium">To your endless warm hugs that melt every worry away.</p>
                    </div>
                  </div>

                  {/* Closing signature */}
                  <div className="pt-6 text-right font-serif">
                    <p className="text-slate-500 text-sm italic">With all my heart, admiration, and gratitude,</p>
                    <p className="text-rose-600 font-bold text-xl mt-1 tracking-wide">Happy Birthday, Mom! ❤️</p>
                  </div>
                </div>

                {/* Floating ambient hearts inside the letter container */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  {wishHearts.map((heart) => (
                    <div
                      key={heart.id}
                      style={{
                        position: 'absolute',
                        left: `${heart.left}%`,
                        bottom: '-10px',
                        fontSize: `${heart.scale * 1.5}rem`,
                        animation: `float-slow 6s ease-in-out infinite`,
                        animationDelay: `${heart.delay}s`,
                        opacity: 0.12,
                      }}
                    >
                      ❤️
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Extra Celebration Actions */}
              <div className="flex flex-col items-center space-y-4 pt-4">
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                  Did you know you can blow out the candles again?
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetCandles();
                    setPortalState('celebrating');
                  }}
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-full text-xs font-bold shadow-md hover:bg-purple-600 transition flex items-center gap-1.5 cursor-pointer"
                  id="replay-surprise-btn"
                >
                  <CakeIcon className="h-3.5 w-3.5" /> Replay Decoration & Blow Candles
                </motion.button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Branding Area - Clean, high quality margin, humble */}
      <footer className="w-full py-6 text-center text-[11px] text-slate-400 font-medium relative z-10">
        Created with love for a very special Mother • 2026
      </footer>

    </div>
  );
}
