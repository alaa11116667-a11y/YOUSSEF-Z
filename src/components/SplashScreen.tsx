import React, { useEffect, useState } from 'react';
import { sound } from '../utils/audio';
import { Atom, Shield, Sparkles, ChevronLeft } from 'lucide-react';
import { HERO_BANNER } from '../data/initialData';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3);

  useEffect(() => {
    sound.playWelcome();
    const startTime = Date.now();
    const duration = 3000; // exactly 3 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      const secLeft = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setSecondsRemaining(secLeft);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14] overflow-hidden select-none">
      {/* Background with physics imagery and ambient gradient */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src={HERO_BANNER}
          alt="Physics Banner"
          className="w-full h-full object-cover scale-105 filter blur-[1px] animate-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-[#070b14]" />
      </div>

      {/* Orbit Rings Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[500px] h-[500px] rounded-full border border-cyan-500/10 animate-spin" style={{ animationDuration: '24s' }} />
        <div className="w-[360px] h-[360px] rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '16s', animationDirection: 'reverse' }} />
        <div className="w-[240px] h-[240px] rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-lg w-full mx-4 text-center p-8 bg-slate-900/70 border border-cyan-500/30 rounded-3xl backdrop-blur-xl shadow-2xl shadow-cyan-950/50">
        {/* Badge Slogan */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-sm font-bold mb-6">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>شعارنا: الفدائيين 💪</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300">مادة الفيزياء</span>
        </div>

        {/* Atom Animated Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/40 border border-cyan-300/40">
            <Atom className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '12s' }} />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 physics-glow">
          المهندس محمد علاء يرحب بكم
        </h1>
        <p className="text-base text-slate-300 font-medium mb-6">
          المنصة التعليمية الرسمية لمادة الفيزياء · مرحباً بأبطال الفدائيين
        </p>

        {/* Timer & Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>جاري تهيئة بيئة الامتحان والمعامل...</span>
            <span className="font-mono text-cyan-400 font-bold">{secondsRemaining} ثواني ({progress}%)</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skip button if user wants immediate entry */}
        <button
          onClick={() => {
            sound.playClick();
            onComplete();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 px-3 rounded-lg hover:bg-slate-800/60"
        >
          <span>تخطي والبدء فوراً</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
