import React, { useState, useEffect, useRef } from 'react';
import { Exam, ExamSubmission } from '../types';
import { sound } from '../utils/audio';
import { CasioCalculator } from './CasioCalculator';
import {
  ShieldAlert,
  Clock,
  Calculator,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Flag,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface ExamEngineProps {
  exam: Exam;
  studentName: string;
  studentPhone?: string;
  onFinishExam: (submission: ExamSubmission) => void;
  onExit: () => void;
}

export const ExamEngine: React.FC<ExamEngineProps> = ({
  exam,
  studentName,
  studentPhone,
  onFinishExam,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(exam.timeLimitMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmission | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request Fullscreen on mount
  useEffect(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    // Timer countdown
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleForceSubmit('انتهى الوقت المخصص للامتحان رسمياً.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Strict Zero Tolerance Anti-Cheat: NO WARNINGS, ZERO STRIKES. Immediate lock and submit!
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        handleInstantDisqualification('تم رصد الخروج من شاشة الامتحان أو التبديل لنافذة أخرى (تم قفل الامتحان فوراً دون إنذارات).');
      }
    };

    const handleWindowBlur = () => {
      if (!isSubmitted) {
        handleInstantDisqualification('تم رصد فقدان تركيز نافذة الامتحان ومحاولة الخروج (تم قفل الامتحان فوراً دون إنذارات).');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmitted) {
        handleInstantDisqualification('تم الخروج من وضع ملء الشاشة المحمي (تم قفل الامتحان فوراً دون إنذارات).');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      sound.playWarning();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p'))
      ) {
        e.preventDefault();
        handleInstantDisqualification('محاولة استخدام اختصارات لوحة المفاتيح وفحص العناصر (تم قفل الامتحان فوراً دون إنذارات).');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSubmitted]);

  const handleInstantDisqualification = (reason: string) => {
    sound.playAlarm();
    handleForceSubmit(reason);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    sound.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const toggleReviewFlag = (questionIdx: number) => {
    sound.playClick();
    setMarkedForReview((prev) => ({
      ...prev,
      [questionIdx]: !prev[questionIdx]
    }));
  };

  const handleFinalSubmit = () => {
    sound.playSuccess();
    calculateAndFinish();
  };

  const handleForceSubmit = (reasonMsg: string) => {
    sound.playAlarm();
    calculateAndFinish(reasonMsg);
  };

  const calculateAndFinish = (reasonMsg?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score accurately
    let calculatedScore = 0;
    exam.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        calculatedScore += q.marks;
      }
    });

    const submission: ExamSubmission = {
      id: `sub-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentName,
      studentPhone,
      grade: exam.grade,
      score: calculatedScore,
      totalMarks: exam.totalMarks,
      submittedAt: new Date().toLocaleString('ar-EG'),
      cheatAlertsCount: reasonMsg ? 1 : 0,
      answers: selectedAnswers,
      isGraded: false, // Student CANNOT see answers or score until Eng. Mohamed Alaa approves!
      teacherNotes: reasonMsg ? `[تم القفل الفوري بسبب الخروج]: ${reasonMsg}` : undefined
    };

    setSubmissionResult(submission);
    setIsSubmitted(true);
    setShowSubmitConfirm(false);

    // Deliver to Firestore for teacher review
    onFinishExam(submission);
  };

  const currentQ = exam.questions[currentIndex];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Screen after exam finishes (Score & model solutions hidden until teacher approves!)
  if (isSubmitted && submissionResult) {
    const wasDisqualified = submissionResult.cheatAlertsCount > 0;

    return (
      <div className="min-h-screen bg-[#080d1a] text-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center overflow-x-hidden">
        <div className="max-w-xl w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl text-center">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl border ${
              wasDisqualified
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-cyan-400/40 text-white'
            }`}
          >
            {wasDisqualified ? <AlertTriangle className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 ${
              wasDisqualified
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
            }`}
          >
            <span>{wasDisqualified ? 'تم قفل الامتحان فوراً للخروج ⚠️' : 'تم تسليم ورقة إجابتك بأمان 🔒'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {wasDisqualified ? 'تم قفل الامتحان فوراً دون إنذارات' : 'تم تسليم الامتحان للمستر محمد علاء'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            {wasDisqualified
              ? 'بناءً على تعليمات الباشمهندس محمد علاء الصارمة: لا توجد أي إنذارات في الامتحان، وتم إغلاق ورقة إجابتك فوراً وحفظها في تقرير المراقبة.'
              : 'تم استلام إجاباتك بنجاح ووصلت إلى لوحة تحكم المستر. بناءً على نظام الامتحانات المعتمد، تظل الدرجة والإجابات النموذجية سرية ومحجوبة حتى يقوم المستر بتصحيحها واعتمادها يدوياً.'}
          </p>

          {/* Submission Receipt */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right text-xs space-y-3 mb-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">اسم الطالب:</span>
              <span className="font-bold text-white text-sm">{studentName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">عنوان الامتحان:</span>
              <span className="font-semibold text-cyan-300">{exam.title}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">توقيت التسليم:</span>
              <span className="font-mono text-slate-300">{submissionResult.submittedAt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">حالة الاعتماد:</span>
              <span className="font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                بانتظار تصحيح واعتماد المستر ⏳
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 mb-6">
            🔒 لا يمكن إعادة هذا الامتحان إلا بعد موافقة خاصة ومباشرة من الباشمهندس محمد علاء في لوحة التحكم.
          </div>

          <button
            onClick={onExit}
            className="w-full py-3.5 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-600/30 transition-all"
          >
            العودة للمنصة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between relative select-none overflow-x-hidden">
      {/* Top Exam Status Bar */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 bg-slate-900/90 border-b border-cyan-500/30 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-white text-xs shadow">
            امتحان
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[160px] sm:max-w-md">
              {exam.title}
            </h1>
            <div className="text-[11px] text-slate-400">
              الطالب: <span className="text-cyan-300 font-semibold">{studentName}</span>
            </div>
          </div>
        </div>

        {/* Center Timer & Controls */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
              secondsRemaining < 300
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800/90 border-slate-700 text-cyan-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsCalculatorOpen(!isCalculatorOpen);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all"
            title="فتح آلة كاسيو FX-991EX"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">آلة كاسيو</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowSubmitConfirm(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            تسليم
          </button>
        </div>
      </header>

      {/* Strict Anti-Cheat Banner (NO WARNINGS) */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>مراقبة مشددة مفعلة: الخروج من النافذة يقفل الامتحان فوراً دون أي إنذارات</span>
        </div>
        <span className="text-slate-400 text-[10px]">نظام الفدائيين المشدد</span>
      </div>

      {/* Main Question Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        <div className="bg-slate-900/80 border border-cyan-500/20 rounded-3xl p-5 sm:p-8 backdrop-blur-md shadow-xl">
          {/* Question Meta */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-500/30">
                السؤال {currentIndex + 1} من {exam.questions.length}
              </span>
              <span className="text-xs text-slate-400">({currentQ.marks} درجات)</span>
            </div>

            <button
              onClick={() => toggleReviewFlag(currentIndex)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                markedForReview[currentIndex]
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{markedForReview[currentIndex] ? 'مُعلَم للمراجعة' : 'تعليم للمراجعة'}</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-white leading-relaxed mb-6">
            {currentQ.text}
          </div>

          {/* Optional Question Diagram */}
          {currentQ.diagramUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 max-h-56">
              <img
                src={currentQ.diagramUrl}
                alt="Diagram"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              const optionLetters = ['أ', 'ب', 'ج', 'د'];

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentIndex, optIdx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                        isSelected
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {optionLetters[optIdx]}
                    </span>
                    <span className="text-sm font-semibold">{opt}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Palette Navigation & Bottom Controls */}
        <div className="mt-6 space-y-4">
          {/* Quick Question Selector Numbers */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            {exam.questions.map((_, idx) => {
              const isAns = selectedAnswers[idx] !== undefined;
              const isRev = markedForReview[idx];
              const isCurr = currentIndex === idx;

              let btnClass = 'bg-slate-800 text-slate-400 border-slate-700';
              if (isCurr) {
                btnClass = 'ring-2 ring-cyan-400 bg-cyan-900 text-white font-black';
              } else if (isRev) {
                btnClass = 'bg-amber-900/60 text-amber-300 border-amber-500';
              } else if (isAns) {
                btnClass = 'bg-emerald-900/60 text-emerald-300 border-emerald-500/60';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setCurrentIndex(idx);
                  }}
                  className={`w-9 h-9 rounded-xl text-xs font-mono font-bold border transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Previous / Next buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentIndex((p) => Math.max(0, p - 1));
              }}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (currentIndex < exam.questions.length - 1) {
                  setCurrentIndex((p) => p + 1);
                } else {
                  setShowSubmitConfirm(true);
                }
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>{currentIndex === exam.questions.length - 1 ? 'مراجعة وتسليم' : 'السؤال التالي'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Floating Casio Calculator */}
      <CasioCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        isEmbeddedInExam={true}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">هل أنت متأكد من تسليم ورقة الامتحان؟</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              أجبت على {Object.keys(selectedAnswers).length} من أصل {exam.questions.length} سؤال. 
              بعد التسليم يتم إرسال نتيجتك للمستر محمد علاء للاعتماد ولا يمكن إعادة الامتحان إلا بموافقته.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                الرجوع ومتابعة الحل
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                تأكيد وتسليم الامتحان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
