import React, { useState } from 'react';
import { Exam, GradeLevel, ExamSubmission, Question } from '../types';
import { sound } from '../utils/audio';
import {
  FileCheck2,
  Clock,
  Award,
  ShieldAlert,
  Play,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Lock,
  X,
  BookOpen,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface ExamsSectionProps {
  exams: Exam[];
  submissions: ExamSubmission[];
  grade: GradeLevel;
  studentName?: string;
  isTeacher: boolean;
  onStartExam: (exam: Exam) => void;
  onAddExam?: (newExam: Exam) => void;
  onDeleteExam?: (id: string) => void;
}

export const ExamsSection: React.FC<ExamsSectionProps> = ({
  exams,
  submissions,
  grade,
  studentName,
  isTeacher,
  onStartExam,
  onAddExam,
  onDeleteExam
}) => {
  const [showPreExamNotice, setShowPreExamNotice] = useState<Exam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedReviewSub, setSelectedReviewSub] = useState<{ exam: Exam; sub: ExamSubmission } | null>(null);

  // New Exam Builder state for Teacher
  const [examTitle, setExamTitle] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState<number>(20);
  const [questionsList, setQuestionsList] = useState<Question[]>([
    {
      id: 'nq-1',
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      marks: 5
    }
  ]);

  const gradeExams = exams.filter((e) => e.grade === grade);

  const handleAddQuestionToBuilder = () => {
    sound.playClick();
    setQuestionsList((prev) => [
      ...prev,
      {
        id: `nq-${Date.now()}`,
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        marks: 5
      }
    ]);
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof Question,
    val: unknown
  ) => {
    setQuestionsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleUpdateOption = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    setQuestionsList((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[qIndex].options] as [string, string, string, string];
      newOpts[optIndex] = value;
      copy[qIndex].options = newOpts;
      return copy;
    });
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || questionsList.length === 0) return;

    for (const q of questionsList) {
      if (!q.text.trim()) {
        sound.playWarning();
        alert('يرجى كتابة نص جميع الأسئلة!');
        return;
      }
    }

    const totalMarks = questionsList.reduce((acc, q) => acc + q.marks, 0);

    const newExam: Exam = {
      id: `exam-custom-${Date.now()}`,
      grade,
      title: examTitle,
      unitTitle: unitTitle || 'امتحان إلكتروني',
      timeLimitMinutes: Number(timeLimit) || 20,
      totalMarks,
      createdAt: new Date().toISOString().split('T')[0],
      questions: questionsList
    };

    sound.playSuccess();
    onAddExam?.(newExam);

    setExamTitle('');
    setUnitTitle('');
    setTimeLimit(20);
    setQuestionsList([
      {
        id: 'nq-1',
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        marks: 5
      }
    ]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            <span>قسم الامتحانات الإلكترونية المحمية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            امتحانات محكمة بدون إمكانية إعادة · يتم تصحيح الأوراق واعتماد النتائج من قِبل المستر محمد علاء
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => {
              sound.playClick();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء امتحان جديد للطلاب</span>
          </button>
        )}
      </div>

      {/* Exams Cards */}
      {gradeExams.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">لا توجد امتحانات مضافة لهذا الصف حالياً</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {gradeExams.map((exam) => {
            // Check if current student has a prior submission for this exam
            const studentSub = submissions.find(
              (s) => s.examId === exam.id && s.studentName === studentName
            );

            const hasSubmitted = !!studentSub;
            const isGraded = studentSub?.isGraded;

            return (
              <div
                key={exam.id}
                className="p-6 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/70 px-3 py-1 rounded-lg border border-cyan-500/30">
                      {exam.unitTitle}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{exam.timeLimitMinutes} دقيقة</span>
                      </span>

                      {isTeacher && onDeleteExam && (
                        <button
                          onClick={() => {
                            sound.playWarning();
                            onDeleteExam(exam.id);
                          }}
                          className="p-1 text-rose-400 hover:bg-rose-950/60 rounded-lg border border-rose-500/30 transition-all"
                          title="حذف الامتحان"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {exam.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800/80">
                    <span>عدد الأسئلة: <b className="text-white">{exam.questions.length}</b></span>
                    <span>الدرجة الكلية: <b className="text-white">{exam.totalMarks} درجة</b></span>
                    <span>التاريخ: {exam.createdAt}</span>
                  </div>

                  {/* Submission status banner */}
                  {hasSubmitted && (
                    <div className="mb-4">
                      {isGraded ? (
                        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>تم اعتماد وتصحيح النتيجة من المستر:</span>
                            </div>
                            {studentSub.teacherNotes && (
                              <p className="text-[11px] text-slate-300 mt-1 italic">
                                "{studentSub.teacherNotes}"
                              </p>
                            )}
                          </div>
                          <span className="font-mono font-black text-emerald-400 text-base bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-500/30 shrink-0">
                            {studentSub.score} / {studentSub.totalMarks}
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-amber-300 font-semibold">
                            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                            <span>تم التسليم · قيد التصحيح والاعتماد من المستر</span>
                          </div>
                          <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
                            مغلق للإعادة
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Exam actions */}
                <div className="pt-2 flex items-center gap-3">
                  {!hasSubmitted ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowPreExamNotice(exam);
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>بدء الامتحان في وضع الأمان (فرصة واحدة فقط)</span>
                    </button>
                  ) : isGraded ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setSelectedReviewSub({ exam, sub: studentSub });
                      }}
                      className="flex-1 py-3 px-4 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>عرض تقرير الإجابات النموذجية والشرح المعتمَد</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 bg-slate-800/80 text-slate-500 border border-slate-700/50 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                      title="الامتحان ميتعادش وفقاً للتعليمات"
                    >
                      <Lock className="w-4 h-4" />
                      <span>تم تسليم الامتحان (لا يمكن الإعادة · بانتظار تصحيح المستر)</span>
                    </button>
                  )}

                  {/* Teacher can always preview exam */}
                  {isTeacher && hasSubmitted && (
                    <button
                      onClick={() => onStartExam(exam)}
                      className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                      title="معاينة كمعلم"
                    >
                      معاينة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Graded Model Answers Review Modal (Only available after teacher grades) */}
      {selectedReviewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-3xl w-full bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    تقرير مصحح ومعتمد
                  </span>
                  <span className="text-xs text-slate-400">من المستر محمد علاء</span>
                </div>
                <h3 className="text-lg font-black text-white">{selectedReviewSub.exam.title}</h3>
              </div>
              <button
                onClick={() => setSelectedReviewSub(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-center">
              <div>
                <span className="text-xs text-slate-400 block mb-1">الدرجة النهائية</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {selectedReviewSub.sub.score} / {selectedReviewSub.sub.totalMarks}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">النسبة المئوية</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {Math.round((selectedReviewSub.sub.score / selectedReviewSub.sub.totalMarks) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">حالة المراقبة</span>
                <span className="text-xs font-bold text-white block mt-1.5">
                  {selectedReviewSub.sub.cheatAlertsCount === 0 ? '0 مخالفات' : `${selectedReviewSub.sub.cheatAlertsCount} إنذارات`}
                </span>
              </div>
            </div>

            {selectedReviewSub.sub.teacherNotes && (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 mb-6">
                <span className="font-bold block text-emerald-300 mb-1">ملاحظات المستر محمد علاء:</span>
                {selectedReviewSub.sub.teacherNotes}
              </div>
            )}

            {/* Questions Detailed Breakdown */}
            <h4 className="text-sm font-bold text-white mb-3">مراجعة الإجابات النموذجية والشرح:</h4>
            <div className="space-y-4 mb-6">
              {selectedReviewSub.exam.questions.map((q, idx) => {
                const studentAns = selectedReviewSub.sub.answers[idx];
                const isCorrect = studentAns === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-200">
                        {idx + 1}. {q.text}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {isCorrect ? `+${q.marks}` : '0'} درجة
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 ml-1">إجابتك:</span>
                        <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold line-through'}>
                          {studentAns !== undefined ? q.options[studentAns] : 'لم تتم الإجابة'}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div>
                          <span className="text-slate-400 ml-1">الإجابة النموذجية الصحيحة:</span>
                          <span className="text-emerald-400 font-bold">
                            {q.options[q.correctOptionIndex]}
                          </span>
                        </div>
                      )}

                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mt-2 text-slate-300">
                        <span className="font-bold text-cyan-400 ml-1">تفسير المستر محمد علاء:</span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedReviewSub(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              إغلاق نافذة المراجعة
            </button>
          </div>
        </div>
      )}

      {/* Pre-Exam Anti-Cheat Instructions Modal */}
      {showPreExamNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-center text-white mb-2">
              تعليمات المراقبة المشددة للامتحان
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6">
              حرصاً على أمانة التقييم لطلاب الفدائيين، يُرجى الالتزام بالتعليمات التالية:
            </p>

            <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <b>الامتحان فرصة واحدة ولا يُعاد:</b> بمجرد بدء الامتحان وتسليمه لا يمكنك دخوله مرة أخرى نهائياً.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <b>التصحيح لدى المستر:</b> لن تظهر الإجابات النموذجية أو الدرجة بعد التسليم مباشرة، بل بعد اعتماد وتصحيح الامتحان من المستر محمد علاء.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <b>حظر الخروج أو التبديل:</b> يُمنع تصغير الشاشة أو التبديل بين النوافذ؛ يتم رصد أي محاولة وخصم الدرجات تلقائياً بعد 3 إنذارات.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPreExamNotice(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                إلغاء والعودة
              </button>
              <button
                onClick={() => {
                  sound.playSuccess();
                  const target = showPreExamNotice;
                  setShowPreExamNotice(null);
                  onStartExam(target);
                }}
                className="py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>موافق، ابدأ الامتحان الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-2xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">إنشاء امتحان جديد لطلاب الفدائيين</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الامتحان</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="مثال: امتحان الفصل الأول: كيرشوف وتطبيقاته"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الوحدة أو الباب</label>
                  <input
                    type="text"
                    value={unitTitle}
                    onChange={(e) => setUnitTitle(e.target.value)}
                    placeholder="الفصل الأول"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الزمن المحدد (بالدقائق)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Questions List Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">
                    قائمة أسئلة الاختيار من متعدد ({questionsList.length} أسئلة):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestionToBuilder}
                    className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-cyan-900 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة سؤال</span>
                  </button>
                </div>

                {questionsList.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        السؤال {qIdx + 1}
                      </span>
                      {questionsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playWarning();
                            setQuestionsList((p) => p.filter((_, i) => i !== qIdx));
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs"
                        >
                          حذف السؤال
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'text', e.target.value)}
                      placeholder="نص السؤال الفيزيائي..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />

                    {/* 4 Choices */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['أ', 'ب', 'ج', 'د'].map((letter, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctOptionIndex === optIdx}
                            onChange={() => handleUpdateQuestion(qIdx, 'correctOptionIndex', optIdx)}
                            className="text-cyan-500"
                            title="حدد كإجابة صحيحة"
                          />
                          <input
                            type="text"
                            required
                            value={q.options[optIdx] || ''}
                            onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            placeholder={`الخيار (${letter})`}
                            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      placeholder="الشرح والتفسير الفيزيائي النموذجي بعد انتهاء الامتحان..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30"
                >
                  حفظ ونشر الامتحان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
