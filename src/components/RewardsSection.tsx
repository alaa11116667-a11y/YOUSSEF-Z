import React, { useState } from 'react';
import { RegisteredStudent, GradeLevel } from '../types';
import { sound } from '../utils/audio';
import {
  Award,
  Star,
  Trophy,
  Camera,
  Gift,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Medal,
  Users,
  Flame,
  FileCheck
} from 'lucide-react';

interface RewardsSectionProps {
  currentStudentName: string;
  studentStars: number;
  grade: GradeLevel;
  studentsList: RegisteredStudent[];
  isTeacher: boolean;
  onAwardBonusStars?: (studentId: string, starsToAdd: number) => void;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({
  currentStudentName,
  studentStars,
  grade,
  studentsList,
  isTeacher,
  onAwardBonusStars
}) => {
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const targetGoal = 100;
  const progressPercent = Math.min(100, Math.round((studentStars / targetGoal) * 100));
  const remainingStars = Math.max(0, targetGoal - studentStars);
  const isQualified = studentStars >= targetGoal;

  // Sort top students by stars for leaderboard
  const topStudents = [...studentsList]
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 10);

  // If list is small, show mock high achievers for inspiration
  const displayLeaderboard = topStudents.length > 0 ? topStudents : [
    { id: '1', name: 'أحمد محمود رضوان', grade: 'grade3', stars: 95, registeredAt: '2026-10-10', phone: '', parentPhone: '' },
    { id: '2', name: 'مريم أسامة الشريف', grade: 'grade3', stars: 90, registeredAt: '2026-10-11', phone: '', parentPhone: '' },
    { id: '3', name: 'عمر خالد فوزي', grade: 'grade2', stars: 85, registeredAt: '2026-10-12', phone: '', parentPhone: '' },
    { id: '4', name: 'سارة إبراهيم المنشاوي', grade: 'grade1', stars: 75, registeredAt: '2026-10-15', phone: '', parentPhone: '' }
  ];

  const handleContactTeacherForReward = () => {
    sound.playSuccess();
    const msg = encodeURIComponent(
      `السلام عليكم يا باشمهندس محمد علاء، أنا الطالب ${currentStudentName}، حققت بفضل الله 100 نجمة في منصة الفدائيين في الفيزياء وتأهلت للتكريم والصورة التذكارية معك!`
    );
    window.open(`https://wa.me/201021462904?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Big Hero Milestone Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-cyan-950/80 border border-amber-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>نظام مكافآت وتكريم الفدائيين الأكبر في مصر 🏆</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              اجمع 100 نجمة وتصور مع الباشمهندس محمد علاء! 📸
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              كل امتحان تحله، وكل شيت واجب تسلمه، وكل مسألة مهندسين تثبت فيها عبقريتك تمنحك نجوماً ذهبية. 
              عند وصولك إلى 100 نجمة، ستنال تكريماً رسمياً وصورة تذكارية مع المهندس محمد علاء في السنتر بالإضافة لدرع الفدائي الذهبي!
            </p>

            {/* Current Student Progress */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>رصيدك الحالي: {studentStars} نجمة</span>
                </span>
                <span className="text-slate-400">
                  {isQualified ? '🎉 تم التأهل للتكريم!' : `باقي لك ${remainingStars} نجمة`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-700 shadow-lg shadow-amber-500/50"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center min-w-[200px]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
              <Camera className="w-7 h-7" />
            </div>

            <span className="text-xs text-slate-400 font-bold block">الجائزة الكبرى</span>
            <span className="text-sm font-black text-amber-300 block mb-3">100 نجمة = صورة وتكريم</span>

            {isQualified ? (
              <button
                onClick={handleContactTeacherForReward}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>حجز موعد التكريم والصورة!</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowCertificate(true);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                <span>معاينة شهادة التفوق</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rewards Ladder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1: 25 Stars */}
        <div className={`p-5 rounded-3xl border transition-all ${studentStars >= 25 ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              25 نجمة ⭐
            </span>
            {studentStars >= 25 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          </div>
          <h3 className="font-bold text-white text-sm mb-1">لقب "مهندس المستقبل"</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            شارة التميز الأولى والظهور الرسمي في لوحة شرف الفدائيين المعتمدة.
          </p>
        </div>

        {/* Tier 2: 50 Stars */}
        <div className={`p-5 rounded-3xl border transition-all ${studentStars >= 50 ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              50 نجمة ⭐
            </span>
            {studentStars >= 50 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          </div>
          <h3 className="font-bold text-white text-sm mb-1">هدية فيزياء خاصة</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            الحصول على مذكرة الفدائي المطبوعة مجاناً أو خصم على اشتراك الحصص والسنتر.
          </p>
        </div>

        {/* Tier 3: 75 Stars */}
        <div className={`p-5 rounded-3xl border transition-all ${studentStars >= 75 ? 'bg-amber-950/40 border-amber-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
              75 نجمة ⭐
            </span>
            {studentStars >= 75 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          </div>
          <h3 className="font-bold text-white text-sm mb-1">إعفاء من واجب الحصة</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            إعفاء رسمي كامل من واجب الحصة القادمة مع شهادة تقدير رقمية معتمدة.
          </p>
        </div>

        {/* Tier 4: 100 Stars Grand Prize */}
        <div className={`p-5 rounded-3xl border-2 transition-all ${studentStars >= 100 ? 'bg-amber-950/60 border-amber-400 shadow-xl shadow-amber-500/20' : 'bg-slate-900/80 border-amber-500/40'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-400">
              100 نجمة 👑
            </span>
            {studentStars >= 100 && <CheckCircle className="w-5 h-5 text-amber-400" />}
          </div>
          <h3 className="font-black text-amber-300 text-sm mb-1">صورة وتكريم مع المستر محمد علاء</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            التكريم الأكبر: صورة شخصية خاصة مع الباشمهندس في السنتر + درع الفدائي الذهبي.
          </p>
        </div>
      </div>

      {/* Ways to Earn Stars & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ways to Earn Stars */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">كيف تجمع النجوم وتصل إلى 100 نجمة بسرعة؟</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold">
                  📝
                </div>
                <div>
                  <span className="font-bold text-white block">حل وتسليم الامتحانات المحمية</span>
                  <span className="text-slate-400 text-[11px]">عند تسليم الامتحان بدون مخالفات مراقبة</span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                +15 إلى +30 ⭐
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400 font-bold">
                  💪
                </div>
                <div>
                  <span className="font-bold text-white block">حل مسائل قسم المهندسين (مستويات عليا)</span>
                  <span className="text-slate-400 text-[11px]">يقوم المستر بتصحيح حلك واعتماده</span>
                </div>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                +20 ⭐
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400 font-bold">
                  📚
                </div>
                <div>
                  <span className="font-bold text-white block">حل وتسليم شيتات الواجب الأسبوعي</span>
                  <span className="text-slate-400 text-[11px]">التسليم قبل موعد الحصة</span>
                </div>
              </div>
              <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                +10 ⭐
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 font-bold">
                  🎯
                </div>
                <div>
                  <span className="font-bold text-white block">الدرجة النهائية في الامتحان (قفل الامتحان)</span>
                  <span className="text-slate-400 text-[11px]">مكافأة إضافية للتفوق الكامل</span>
                </div>
              </div>
              <span className="font-mono font-bold text-purple-400 text-sm bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-500/30">
                +25 ⭐ بونص
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">لوحة شرف أوائل الفدائيين</h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-semibold">ترتيب الطلاب حسب النجوم</span>
          </div>

          <div className="space-y-2.5">
            {displayLeaderboard.map((st, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={st.id || idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isFirst
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : isSecond
                      ? 'bg-slate-800/80 border-slate-700'
                      : isThird
                      ? 'bg-slate-800/60 border-slate-700/60'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isFirst
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : isSecond
                          ? 'bg-slate-300 text-slate-900 font-bold'
                          : isThird
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{st.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {st.grade === 'grade1' ? 'أولى ثانوي' : st.grade === 'grade2' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 flex items-center gap-1 text-sm bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{st.stars || 10}</span>
                    </span>

                    {/* Teacher Quick Star Granter */}
                    {isTeacher && onAwardBonusStars && (
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          onAwardBonusStars(st.id, 10);
                        }}
                        className="p-1 px-2 text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
                        title="منح 10 نجوم تشجيعية"
                      >
                        +10 ⭐
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Digital Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center text-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
              <Trophy className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-1">
              منصة الفدائيين في الفيزياء · شهادة تفوق وتقدير
            </span>
            <h3 className="text-2xl font-black text-white mb-2">شهادة بطل الفدائيين</h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              يشهد الباشمهندس <b className="text-white">محمد علاء</b> بأن الطالب المتميز:
              <br />
              <span className="text-lg font-black text-cyan-400 my-2 block">{currentStudentName}</span>
              قد أظهر تميزاً فيزيائياً وعقلاً هندسياً رفيعاً وجمع <b className="text-amber-400 font-mono">{studentStars} نجمة</b> في بنك أسئلة وتحديات الفيزياء.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between mb-6">
              <span>ختم الاعتماد: معتمد من م. محمد علاء</span>
              <span className="font-mono text-cyan-400">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>

            <button
              onClick={() => setShowCertificate(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
