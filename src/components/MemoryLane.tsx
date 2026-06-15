import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Trash2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Memory {
  id: number;
  title: string;
  sub: string;
  desc: string;
  colorTheme: string;
  svgIcon: React.ReactNode;
  storageKey: string;
}

export default function MemoryLane() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState<Record<number, boolean>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    // Load pre-existing uploaded photos from localStorage
    const loadedImages: Record<string, string> = {};
    ['mom_photo_0', 'mom_photo_1', 'mom_photo_2'].forEach((key) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        loadedImages[key] = stored;
      }
    });
    setImages(loadedImages);
  }, []);

  const handleFileChange = (id: number, file: File | null, storageKey: string) => {
    if (!file) return;

    // Verify it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    // Limit file size to ~3MB to avoid localStorage capacity issues
    if (file.size > 3 * 1024 * 1024) {
      alert('To ensure full local storage speed, please choose an image smaller than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        localStorage.setItem(storageKey, base64);
        setImages((prev) => ({ ...prev, [storageKey]: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteImage = (id: number, storageKey: string) => {
    localStorage.removeItem(storageKey);
    setImages((prev) => {
      const copy = { ...prev };
      delete copy[storageKey];
      return copy;
    });
  };

  const handleDrag = (id: number, e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [id]: active }));
  };

  const handleDrop = (id: number, e: React.DragEvent, storageKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [id]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(id, e.dataTransfer.files[0], storageKey);
    }
  };

  const triggerFileInput = (id: number) => {
    fileInputRefs.current[id]?.click();
  };

  const memories: Memory[] = [
    {
      id: 0,
      title: "Sporty & Cap Mom",
      sub: "Adventure & Style",
      desc: "Sitting on a red bench in your stylish black-and-white floral dress, looking super cool in your red cap and sunglasses!",
      colorTheme: "from-red-50 to-rose-100 border-rose-300",
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-rose-500 fill-none stroke-current stroke-2">
          {/* Cap outline */}
          <path d="M25,50 C25,30 75,30 75,50 M30,50 L70,50" />
          <path d="M50,30 L50,50" />
          <path d="M72,48 C85,48 92,55 90,60 C80,60 70,53 72,48 Z" className="fill-rose-200" />
          {/* Sunglasses */}
          <rect x="32" y="58" width="14" height="10" rx="3" className="fill-slate-800" />
          <rect x="54" y="58" width="14" height="10" rx="3" className="fill-slate-800" />
          <path d="M46,63 L54,63" />
        </svg>
      ),
      storageKey: "mom_photo_0"
    },
    {
      id: 1,
      title: "Singapore Riverfront Travel",
      sub: "Glamour & Wonder",
      desc: "Standing gloriously on the bridge, radiant in your beautiful pink floral summer dress, fancy sunglasses, and turquoise beads.",
      colorTheme: "from-cyan-50 to-blue-100 border-cyan-300",
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-sky-500 fill-none stroke-current stroke-2">
          {/* Bridge arches & water waves */}
          <path d="M10,75 C40,55 60,55 90,75" />
          <path d="M10,80 L90,80" />
          <path d="M20,85 C40,81 60,81 80,85" />
          {/* Flapping Summer Dress Silhouette */}
          <path d="M42,35 C45,30 55,30 58,35 L68,68 L32,68 Z" className="fill-pink-200/60" />
          {/* Turquoise beads */}
          <circle cx="50" cy="40" r="4" className="stroke-teal-400 fill-teal-100" />
          <circle cx="45" cy="42" r="3" className="stroke-teal-400 fill-teal-100" />
          <circle cx="55" cy="42" r="3" className="stroke-teal-400 fill-teal-100" />
        </svg>
      ),
      storageKey: "mom_photo_1"
    },
    {
      id: 2,
      title: "The Royal Saree Grace",
      sub: "Heritage & Radiance",
      desc: "Sitting gracefully on the stairs of a rose pink house, glowing in your stunning purple and orange festive saree next to marigold pots.",
      colorTheme: "from-purple-50 to-purple-100 border-purple-300",
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-purple-600 fill-none stroke-current stroke-2">
          {/* Saree drape & marigold flowers */}
          <path d="M30,30 C50,22 80,45 60,75 L35,75 Z" className="fill-amber-200/40" />
          <path d="M42,28 C52,45 40,75 25,65 C20,50 35,32 42,28 Z" className="fill-purple-200/50" />
          <circle cx="75" cy="65" r="5" className="fill-amber-500 stroke-amber-600" />
          <circle cx="79" cy="72" r="4" className="fill-amber-500 stroke-amber-600" />
          <circle cx="71" cy="72" r="4" className="fill-amber-500 stroke-amber-600" />
          {/* Steps */}
          <path d="M15,80 L85,80 M20,87 L80,87" />
        </svg>
      ),
      storageKey: "mom_photo_2"
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-spin" /> Memory Frame Lane
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-800">Mom's Golden Memories</h3>
        <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
          Here are three special frames matching your beautiful photos! Drag-and-drop or click to upload the files so Mom can see her real pictures in her beautiful frame.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {memories.map((m) => {
          const uploadedUrl = images[m.storageKey];
          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -4 }}
              className={`relative rounded-3xl border-2 p-5 flex flex-col justify-between bg-gradient-to-b ${m.colorTheme} shadow-md overflow-hidden min-h-[380px]`}
            >
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-slate-600 border border-slate-200/40">
                    {m.sub}
                  </span>
                  {uploadedUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="h-3 w-3" /> Live
                    </span>
                  )}
                </div>

                {/* IMAGE FRAME OR PLACEHOLDER ILLUSTRATION */}
                <div
                  onDragOver={(e) => handleDrag(m.id, e, true)}
                  onDragLeave={(e) => handleDrag(m.id, e, false)}
                  onDrop={(e) => handleDrop(m.id, e, m.storageKey)}
                  onClick={() => !uploadedUrl && triggerFileInput(m.id)}
                  className={`relative w-full h-44 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center bg-white overflow-hidden ${
                    uploadedUrl 
                      ? 'border-transparent shadow-inner' 
                      : dragActive[m.id]
                        ? 'border-purple-500 bg-purple-50/50'
                        : 'border-slate-300 hover:border-purple-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[m.id] = el; }}
                    onChange={(e) => handleFileChange(m.id, e.target.files ? e.target.files[0] : null, m.storageKey)}
                    className="hidden"
                    accept="image/*"
                  />

                  <AnimatePresence mode="wait">
                    {uploadedUrl ? (
                      <motion.div 
                        key="uploaded" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <img 
                          src={uploadedUrl} 
                          alt={m.title} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        {/* Interactive overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); triggerFileInput(m.id); }}
                            className="p-2.5 bg-white text-slate-800 rounded-full hover:bg-slate-100 shadow-md transform hover:scale-110 transition cursor-pointer"
                            title="Replace Photo"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteImage(m.id, m.storageKey); }}
                            className="p-2.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md transform hover:scale-110 transition cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="placeholder" 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center text-center p-3"
                      >
                        {m.svgIcon}
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-purple-600 font-bold">
                          <Camera className="h-3.5 w-3.5" />
                          <span>Add Mom's Photo</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                          Click or drag of her cool image here to fill the frame
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* TEXTUAL DETAILS */}
                <div className="space-y-1 pt-1">
                  <h4 className="font-serif font-bold text-slate-800 text-sm">{m.title}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-sans">{m.desc}</p>
                </div>
              </div>

              {/* Upload CTA action line at bottom */}
              {!uploadedUrl && (
                <button
                  onClick={() => triggerFileInput(m.id)}
                  className="w-full mt-4 py-2 bg-white hover:bg-slate-50 text-purple-600 text-[11px] font-bold rounded-xl border border-purple-200/80 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Photo
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
