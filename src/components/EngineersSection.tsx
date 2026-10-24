import React, { useState } from 'react';
import { EngineerProblem, GradeLevel, EngineerSubmission } from '../types';
import { sound } from '../utils/audio';
import {
  Wrench,
  Zap,
  Star,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Cpu,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  Upload,
  Send,
  FileCheck,
  Clock,
  Sparkles,
  Camera
} from 'lucide-react';
import { ENGINEER_BANNER } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';

interface EngineersSectionProps {
  problems: EngineerProblem[];
  submissions: EngineerSubmission[];
  grade: GradeLevel;
  studentName: string;
  studentPhone?: string;
  isTeacher: boolean;
  onSubmitSolution: (submission: Omit<EngineerSubmission, 'id' | 'submittedAt'>) => void;
  onAddProblem?: (prob: Omit<EngineerProblem, 'id'>) => void;
  onDeleteProblem?: (id: string) => void;
  onOpenCalculator: () => void;
}

export const EngineersSection: React.FC<EngineersSectionProps> = ({
  problems,
  submissions,
  grade,
  studentName,
  studentPhone,
  isTeacher,
  onSubmitSolution,
  onAddProblem,
  onDeleteProblem,
  onOpenCalculator
}) => {
  const [activeHints, setActiveHints] = useState<Record<string, number>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  
  // Student submission form states per problem
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [writtenSteps, setWrittenSteps] = useState<Record<string, string>>({});
  const [stepImages, setStepImages] = useState<Record<string, string>>({});
  const [stepImageNames, setStepImageNames] = useState<Record<string, string>>({});
  const [submittingProblemId, setSubmittingProblemId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Teacher new problem form
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [unit, setUnit] = useState('');
  const [numericalAnswer, setNumericalAnswer] = useState('');
  const [hint1, setHint1] = useState('');
  const [hint2, setHint2] = useState('');
  const [solutionStepsText, setSolutionStepsText] = useState('');
  const [engineerInsight, setEngineerInsight] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [diagramFileName, setDiagramFileName] = useState('');

  const diagramInputRef = React.useRef<HTMLInputElement>(null);
  const solutionPhotoInputRef = React.useRef<HTMLInputElement>(null);

  const gradeProblems = problems.filter((p) => p.grade === grade);

  const handleDiagramFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDiagramFileName(file.name);
      compressImageFile(file)
        .then((compressed) => {
          setDiagramUrl(compressed);
          sound.playSuccess();
        })
        .catch((err) => {
          console.error('Diagram compression error:', err);
        });
    }
  };

  const handleStudentStepPhoto = (problemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStepImageNames((p) => ({ ...p, [problemId]: file.name }));
      compressImageFile(file)
        .then((compressed) => {
          setStepImages((p) => ({ ...p, [problemId]: compressed }));
          sound.playSuccess();
        })
        .catch((err) => console.error(err));
    }
  };

  const toggleHint = (problemId: string, totalHints: number) => {
    sound.playClick();
    setActiveHints((prev) => {
      const current = prev[problemId] || 0;
      return { ...prev, [problemId]: current < totalHints ? current + 1 : 0 };
    });
  };

  const toggleSolution = (problemId: string) => {
    sound.playClick();
    setShowSolution((prev) => ({ ...prev, [problemId]: !prev[problemId] }));
  };

  const handleSubmitSolutionToTeacher = (problem: EngineerProblem) => {
    const answer = (userInputs[problem.id] || '').trim();
    const steps = (writtenSteps[problem.id] || '').trim();
    const photo = stepImages[problem.id];

    if (!answer && !steps && !photo) {
      sound.playWarning();
      alert('يرجى كتابة الناتج أو توضيح خطوات حلك أو إرفاق صورة الحل قبل التسليم.');
      return;
    }

    sound.playSuccess();
    onSubmitSolution({
      problemId: problem.id,
      problemTitle: problem.title,
      studentName,
      studentPhone,
      grade,
      numericalAnswer: answer || 'انظر خطوات الحل المرفقة',
      writtenSteps: steps || 'مرفق صورة ورقة الحل بالأسفل',
      stepsImageUrl: photo || undefined,
      status: 'pending',
      starsAwarded: 0
    });

    setSubmittingProblemId(null);
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !statement || !numericalAnswer) return;

    sound.playSuccess();
    const finalDiagram = diagramUrl || ENGINEER_BANNER;

    onAddProblem?.({
      grade,
      title,
      difficulty: 5,
      statement,
      unit: unit || 'مسائل المستويات العليا',
      diagramUrl: finalDiagram,
      hints: [hint1, hint2].filter(Boolean),
      numericalAnswer,
      solutionSteps: solutionStepsText.split('\n').filter(Boolean),
      engineerInsight:
        engineerInsight || 'تطبيق هندسي عملي يربط بين النظرية الفيزيائية والأنظمة الهندسية الحديثة.'
    });

    setTitle('');
    setStatement('');
    setUnit('');
    setNumericalAnswer('');
    setHint1('');
    setHint2('');
    setSolutionStepsText('');
    setEngineerInsight('');
    setDiagramUrl('');
    setDiagramFileName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-amber-400" />
              <span>قسم المهندسين 💪 (مسائل العباقرة للتصحيح)</span>
            </h2>
            <span className="bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">
              تصحح بيد المستر ✍️
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            حل المسألة وأرسل خطواتك للمستر محمد علاء، ليصححها بنفسه ويمنحك حتى 20 نجمة ⭐ للوصول لهدف الـ 100 نجمة والتكريم!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCalculator();
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>آلة كاسيو FX-991EX</span>
          </button>

          {isTeacher && (
            <button
              onClick={() => {
                sound.playClick();
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مسألة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Problems List */}
      {gradeProblems.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">لا توجد مسائل مهندسين مضافة لهذا الصف حالياً</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {gradeProblems.map((prob, idx) => {
            const currentHintsCount = activeHints[prob.id] || 0;
            const isSolOpen = showSolution[prob.id];

            // Look up if this student already submitted a solution for this problem
            const existingSub = submissions.find(
              (s) => s.problemId === prob.id && s.studentName === studentName
            );

            return (
              <div
                key={prob.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 shadow-2xl transition-all"
              >
                {/* Problem Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold font-mono flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{prob.title}</h3>
                      <span className="text-xs text-slate-400">{prob.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Difficulty Badge */}
                    <div className="flex items-center gap-0.5 text-amber-400" title="مستوى عليا 5 نجوم">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    {isTeacher && onDeleteProblem && (
                      <button
                        onClick={() => {
                          sound.playWarning();
                          onDeleteProblem(prob.id);
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg border border-rose-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-sm font-semibold text-slate-200 leading-relaxed mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {prob.statement}
                </div>

                {/* Optional Blueprint Diagram */}
                {prob.diagramUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 max-h-64 bg-slate-950">
                    <img
                      src={prob.diagramUrl}
                      alt="Schematic"
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                )}

                {/* Submission Deck / Feedback from Teacher */}
                {existingSub ? (
                  <div className="p-5 rounded-2xl border mb-6 bg-slate-950/80 border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-cyan-400" />
                        <span>حالة تسليم إجابتك للمستر محمد علاء:</span>
                      </span>

                      {existingSub.status === 'graded' ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تم التصحيح والاعتماد (+{existingSub.starsAwarded} ⭐)</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>قيد مراجعة وتصحيح المستر ⏳</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">الناتج المسلم:</span>
                        <span className="font-mono font-bold text-white">{existingSub.numericalAnswer}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">وقت التسليم:</span>
                        <span className="font-mono text-slate-300">{existingSub.submittedAt}</span>
                      </div>
                    </div>

                    {existingSub.teacherFeedback && (
                      <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-200">
                        <span className="font-bold block text-amber-300 mb-1">
                          ✍️ تقييم وملاحظات المستر محمد علاء:
                        </span>
                        {existingSub.teacherFeedback}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Student Submit Solution Form */
                  <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 mb-6 space-y-3">
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>سلم حلك للمستر محمد علاء (تصحح يدوياً لمنح النجوم ⭐):</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          الناتج النهائي المحسوب
                        </label>
                        <input
                          type="text"
                          value={userInputs[prob.id] || ''}
                          onChange={(e) =>
                            setUserInputs((p) => ({ ...p, [prob.id]: e.target.value }))
                          }
                          placeholder="مثال: 10 Ω أو 2.5 A..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          إرفاق صورة لورقة الحل (اختياري)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStudentStepPhoto(prob.id, e)}
                          className="hidden"
                          id={`photo-${prob.id}`}
                        />
                        <label
                          htmlFor={`photo-${prob.id}`}
                          className="w-full py-2 px-3 bg-slate-900 border border-dashed border-amber-500/40 hover:border-amber-400 rounded-xl text-xs text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer truncate"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{stepImageNames[prob.id] ? `تم اختيار: ${stepImageNames[prob.id]}` : 'تصوير الحل بالموبايل'}</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        خطوات وتفسير الحل الرياضي والفيزيائي
                      </label>
                      <textarea
                        rows={2}
                        value={writtenSteps[prob.id] || ''}
                        onChange={(e) =>
                          setWrittenSteps((p) => ({ ...p, [prob.id]: e.target.value }))
                        }
                        placeholder="اكتب خطوات الحل أو فرض التيارات أو القانون المستخدم..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      onClick={() => handleSubmitSolutionToTeacher(prob)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الحل للمستر محمد علاء للتصحيح ومنح النجوم</span>
                    </button>
                  </div>
                )}

                {/* Progressive Hints & Teacher Solution Reveal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHint(prob.id, prob.hints.length)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>
                        {currentHintsCount === 0
                          ? 'طلب تلميح ذكي'
                          : `تلميح (${currentHintsCount} من ${prob.hints.length})`}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleSolution(prob.id)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>{isSolOpen ? 'إخفاء خطوات الحل' : 'كشف الحل الهندسي الكامل'}</span>
                      {isSolOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Hints Drawer */}
                  {currentHintsCount > 0 && (
                    <div className="space-y-2 pt-2 animate-fade-in">
                      {prob.hints.slice(0, currentHintsCount).map((hint, hIdx) => (
                        <div
                          key={hIdx}
                          className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold ml-1">تلميح {hIdx + 1}:</span>
                            {hint}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Full Solution Drawer */}
                  {isSolOpen && (
                    <div className="p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 text-xs space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-cyan-400">خطوات الحل التفصيلية للمهندسين:</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          الناتج النهائي = {prob.numericalAnswer}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-slate-300">
                        {prob.solutionSteps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 font-mono text-[11px]"
                          >
                            {step}
                          </div>
                        ))}
                      </div>

                      {/* Engineering Insight */}
                      {prob.engineerInsight && (
                        <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/20 text-cyan-200 mt-3">
                          <span className="font-bold block text-cyan-300 mb-1">
                            📐 الرؤية الهندسية (Engineering Insight):
                          </span>
                          {prob.engineerInsight}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">إضافة مسألة مهندسين جديدة (مستويات عليا)</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المسألة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مسألة كيرشوف ذات القنطرة غير المتزنة"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوحدة / الباب</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="الفصل الأول"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الناتج الرقمي الصحيح</label>
                  <input
                    type="text"
                    required
                    value={numericalAnswer}
                    onChange={(e) => setNumericalAnswer(e.target.value)}
                    placeholder="مثال: 12.5 Ω"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص المسألة بالكامل</label>
                <textarea
                  rows={4}
                  required
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="أكتب نص المسألة الفيزيائية ومعطياتها بدقة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>صورة أو رسمة المسألة الهندسية (رفع من جهازك)</span>
                  <span className="text-[11px] text-amber-400 font-normal">اختياري</span>
                </label>
                <input
                  type="file"
                  ref={diagramInputRef}
                  accept="image/*"
                  onChange={handleDiagramFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => diagramInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-500/40 bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{diagramFileName ? `تم اختيار: ${diagramFileName}` : 'اختر صورة المخطط من جهازك'}</span>
                </button>
                {diagramUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-amber-500/30 max-h-32 bg-slate-950">
                    <img src={diagramUrl} alt="Preview" className="w-full h-32 object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setDiagramUrl('');
                        setDiagramFileName('');
                        if (diagramInputRef.current) diagramInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold"
                    >
                      إلغاء الصورة
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التلميح الأول</label>
                  <input
                    type="text"
                    value={hint1}
                    onChange={(e) => setHint1(e.target.value)}
                    placeholder="فكرة البداية..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التلميح الرياضي الثاني</label>
                  <input
                    type="text"
                    value={hint2}
                    onChange={(e) => setHint2(e.target.value)}
                    placeholder="القانون أو التناظر..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">خطوات الحل التفصيلية (كل خطوة في سطر)</label>
                <textarea
                  rows={3}
                  value={solutionStepsText}
                  onChange={(e) => setSolutionStepsText(e.target.value)}
                  placeholder="الخطوة 1: حساب الجهد...&#10;الخطوة 2: تطبيق قانون كيرشوف الثاني..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الرؤية الهندسية والتطبيق العملي</label>
                <input
                  type="text"
                  value={engineerInsight}
                  onChange={(e) => setEngineerInsight(e.target.value)}
                  placeholder="كيف يستخدم المهندس هذا المفهوم في الواقع..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30"
                >
                  حفظ ونشر مسألة المهندسين
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
