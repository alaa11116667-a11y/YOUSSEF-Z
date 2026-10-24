import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Bot,
  MessageSquare,
  Copy,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Atom
} from 'lucide-react';

interface DeveloperFooterProps {
  onOpenComplaints: () => void;
}

export const DeveloperFooter: React.FC<DeveloperFooterProps> = ({ onOpenComplaints }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText('01021462904');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Luxury Draft Developer Card */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0b162c] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-600/30 border border-cyan-400/40">
                <Bot className="w-7 h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
                <Sparkles className="w-3 h-3 text-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  تصميم وتطوير المنصة
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-amber-300 font-bold">ذكاء اصطناعي وبرمجيات</span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-white mt-1">
                المهندس: <span className="text-cyan-300">علاء جهاد</span> (طالب في كلية الذكاء الاصطناعي)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                تطوير منصة الفدائيين في الفيزياء للباشمهندس محمد علاء بأحدث تقنيات الويب الذكية وحماية الامتحانات.
              </p>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-center md:self-auto">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-sm"
              title="نسخ رقم الواتساب"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? 'تم النسخ بنجاح!' : '01021462904'}</span>
            </button>

            <a
              href="https://wa.me/201021462904"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>واتساب للشكاوى</span>
            </a>

            <button
              onClick={() => {
                sound.playClick();
                onOpenComplaints();
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>مركز الشكاوى الفخم</span>
            </button>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-right">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Atom className="w-4 h-4 text-cyan-500" />
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} · منصة الفدائيين في مادة الفيزياء · إشراف المهندس محمد علاء</span>
          </div>
          <div className="text-[11px] text-slate-400">
            برمجة وتطوير: <b className="text-slate-300">علاء جهاد</b> (01021462904)
          </div>
        </div>
      </div>
    </footer>
  );
};
