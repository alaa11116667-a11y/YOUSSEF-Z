import React, { useState } from 'react';
import { Complaint } from '../types';
import { sound } from '../utils/audio';
import {
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Bot,
  HeartHandshake
} from 'lucide-react';

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (complaint: Omit<Complaint, 'id' | 'timestamp'>) => void;
  defaultStudentName?: string;
}

export const ComplaintsModal: React.FC<ComplaintsModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
  defaultStudentName = ''
}) => {
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('الثانوية العامة');
  const [category, setCategory] = useState<Complaint['category']>('شكوى تقنية');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    sound.playClick();
    navigator.clipboard.writeText('01021462904');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !message) return;

    sound.playSuccess();
    onSubmitComplaint({
      studentName,
      phone: phone || 'غير محدد',
      grade,
      category,
      message
    });

    setIsSent(true);

    // Optionally redirect to WhatsApp with prefilled message
    const waText = encodeURIComponent(
      `السلام عليكم م. علاء جهاد،\nمعك الطالب: ${studentName}\nالصف: ${grade}\nنوع الطلب: ${category}\nالتفاصيل: ${message}`
    );
    window.open(`https://wa.me/201021462904?text=${waText}`, '_blank');

    setTimeout(() => {
      setIsSent(false);
      setMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-xl w-full bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg">مركز الدعم والشكاوى الفخم</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  مباشر
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تحت إشراف مطور المنصة: <span className="text-cyan-300 font-bold">علاء جهاد</span> (طالب بكلية الذكاء الاصطناعي)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Developer Contact Card */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>المهندس علاء جهاد · Alaa Gehad</span>
              </div>
              <div className="text-[11px] text-cyan-400 mt-0.5">
                طالب في كلية الذكاء الاصطناعي · مطور برمجيات المنصة
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                title="نسخ رقم الواتساب"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copied ? 'تم النسخ!' : '01021462904'}</span>
              </button>

              <a
                href="https://wa.me/201021462904"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>واتساب مباشر</span>
              </a>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {isSent && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block">تم إرسال رسالتك وتوجيهها للمطور عبر الواتساب بنجاح!</span>
              <span>سيتم الرد والتعامل مع طلبك في أسرع وقت.</span>
            </div>
          </div>
        )}

        {/* Complaints Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب / المرسل</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف أو الواتساب</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الصف الدراسي</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                <option value="أخرى / ولي أمر">أخرى / ولي أمر</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">نوع الشكوى أو الطلب</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="شكوى تقنية">شكوى تقنية في المنصة</option>
                <option value="استفسار علمي">استفسار علمي في الفيزياء</option>
                <option value="اقتراح">اقتراح لتطوير المنصة</option>
                <option value="طلب امتحان">طلب امتحان أو مراجعة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">تفاصيل الشكوى أو الاستفسار</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أكتب بالتفصيل ما ترغب في إبلاغ المهندس علاء جهاد به..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              إغلاق
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الشكوى والتواصل فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
