import React, { useState } from 'react';
import {
  AppStateData,
  GradeLevel,
  ExamSubmission,
  RegisteredStudent,
  EngineerSubmission
} from '../types';
import { sound } from '../utils/audio';
import {
  ShieldAlert,
  Users,
  Award,
  AlertTriangle,
  FileCheck,
  Megaphone,
  GraduationCap,
  CheckCircle2,
  Trash2,
  MessageSquare,
  CheckCircle,
  X,
  Phone,
  RotateCcw,
  Star,
  Cpu,
  Eye,
  Camera,
  Search
} from 'lucide-react';

interface TeacherDashboardProps {
  data: AppStateData;
  activeGrade: GradeLevel;
  onChangeGrade: (grade: GradeLevel) => void;
  onAddAnnouncement: (title: string, content: string, priority: 'normal' | 'urgent') => void;
  onDeleteSubmission: (subId: string) => void;
  onGradeSubmission: (subId: string, finalScore: number, teacherNotes?: string) => void;
  onAllowRetakeExam: (subId: string) => void;
  onGradeEngineerSubmission: (subId: string, stars: number, feedback: string) => void;
  onAwardBonusStars: (studentId: string, starsToAdd: number) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  data,
  activeGrade,
  onChangeGrade,
  onAddAnnouncement,
  onDeleteSubmission,
  onGradeSubmission,
  onAllowRetakeExam,
  onGradeEngineerSubmission,
  onAwardBonusStars,
  onDeleteStudent
}) => {
  const [activeTab, setActiveTab] = useState<
    'students' | 'submissions' | 'engineers' | 'announcements' | 'complaints'
  >('students');

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Search state
  const [studentSearch, setStudentSearch] = useState('');

  // Exam Grading Modal State
  const [gradingSub, setGradingSub] = useState<ExamSubmission | null>(null);
  const [gradedScore, setGradedScore] = useState<number>(0);
  const [teacherNotes, setTeacherNotes] = useState<string>('');

  // Engineer Submission Grading Modal State
  const [gradingEngSub, setGradingEngSub] = useState<EngineerSubmission | null>(null);
  const [engStarsAward, setEngStarsAward] = useState<number>(20);
  const [engFeedback, setEngFeedback] = useState<string>('');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const gradeNames: Record<GradeLevel, string> = {
    grade1: 'الصف الأول الثانوي',
    grade2: 'الصف الثاني الثانوي',
    grade3: 'الصف الثالث الثانوي'
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    sound.playSuccess();
    onAddAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleOpenGrading = (sub: ExamSubmission) => {
    sound.playClick();
    setGradingSub(sub);
    setGradedScore(sub.score);
    setTeacherNotes(sub.teacherNotes || 'أحسنت يا بطل الفدائيين، تم تصحيح واعتماد نتيجتك بنجاح.');
  };

  const handleConfirmGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    sound.playSuccess();
    onGradeSubmission(gradingSub.id, Number(gradedScore), teacherNotes);
    setGradingSub(null);
  };

  const handleOpenEngGrading = (engSub: EngineerSubmission) => {
    sound.playClick();
    setGradingEngSub(engSub);
    setEngStarsAward(engSub.starsAwarded || 20);
    setEngFeedback(engSub.teacherFeedback || 'تفكير هندسي عبقري وخطوات حل فيزيائية نموذجية، أحسنت يا بطل!');
  };

  const handleConfirmEngGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingEngSub) return;
    sound.playSuccess();
    onGradeEngineerSubmission(gradingEngSub.id, Number(engStarsAward), engFeedback);
    setGradingEngSub(null);
  };

  // Filter lists by grade
  const gradeStudents = (data.students || []).filter((s) => s.grade === activeGrade);
  const filteredStudents = gradeStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.phone.includes(studentSearch)
  );

  const gradeSubmissions = (data.submissions || []).filter((s) => s.grade === activeGrade);
  const gradeEngSubmissions = (data.engineerSubmissions || []).filter((s) => s.grade === activeGrade);

  return (
    <div className="space-y-6">
      {/* Teacher Top Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>لوحة تحكم الأستاذ الكاملة 👑</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            أهلاً بك يا باشمهندس محمد علاء 💪
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            سجل الطلاب المسجلين · تصحيح واعتماد الامتحانات · تصحيح مسائل المهندسين · رصد مخالفات المراقبة
          </p>
        </div>

        {/* Grade Switcher */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-400">إدارة الصف الدراسي:</span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            {(['grade1', 'grade2', 'grade3'] as GradeLevel[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  sound.playClick();
                  onChangeGrade(g);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeGrade === g
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g === 'grade1' ? 'أولى ثانوي' : g === 'grade2' ? 'تانية ثانوي' : 'تالتة ثانوي'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {/* 1. Students Roster */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('students');
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الطلاب المسجلين ({gradeStudents.length})</span>
        </button>

        {/* 2. Exam Submissions */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('submissions');
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'submissions'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>تصحيح الامتحانات ({gradeSubmissions.length})</span>
        </button>

        {/* 3. Engineers Submissions */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('engineers');
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'engineers'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>تصحيح مسائل المهندسين ({gradeEngSubmissions.length})</span>
        </button>

        {/* 4. Announcements */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('announcements');
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'announcements'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>التنبيهات</span>
        </button>

        {/* 5. Complaints */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('complaints');
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'complaints'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>الشكاوى ({data.complaints.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: REGISTERED STUDENTS DIRECTORY ================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              سجل الطلاب المسجلين على المنصة لـ: <b className="text-white">{gradeNames[activeGrade]}</b>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="بحث باسم الطالب أو الهاتف..."
                className="w-full pr-8 pl-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-xs text-slate-400">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <span>لا يوجد طلاب مسجلين حتى الآن بهذا الصف</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400">
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">هاتف الطالب (واتساب)</th>
                    <th className="p-3">هاتف ولي الأمر</th>
                    <th className="p-3">المحافظة / السنتر</th>
                    <th className="p-3">رصيد النجوم ⭐</th>
                    <th className="p-3">تاريخ التسجيل</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{st.name}</span>
                      </td>
                      <td className="p-3 font-mono text-cyan-300">
                        {st.phone ? (
                          <a
                            href={`https://wa.me/20${st.phone.replace(/^0+/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{st.phone}</span>
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {st.parentPhone && st.parentPhone !== 'غير مسجل' ? (
                          <a
                            href={`https://wa.me/20${st.parentPhone.replace(/^0+/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-cyan-400" />
                            <span>{st.parentPhone}</span>
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{st.governorate || 'عام'}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{st.stars || 10}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{st.registeredAt}</td>
                      <td className="p-3 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            sound.playSuccess();
                            onAwardBonusStars(st.id, 10);
                          }}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold"
                          title="منح 10 نجوم تشجيعية"
                        >
                          +10 ⭐
                        </button>
                        {onDeleteStudent && (
                          <button
                            onClick={() => {
                              sound.playWarning();
                              if (confirm(`هل أنت متأكد من حذف الطالب ${st.name}؟`)) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            className="p-1 text-rose-400 hover:bg-rose-950/60 rounded-lg border border-rose-500/20"
                            title="حذف الطالب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: EXAM SUBMISSIONS & APPROVAL ================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>الامتحانات المسلمة لـ: <b className="text-white">{gradeNames[activeGrade]}</b></span>
            <span>إجمالي الأوراق: <b className="text-cyan-400 font-mono">{gradeSubmissions.length}</b></span>
          </div>

          {gradeSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-xs text-slate-400">
              لا توجد أوراق امتحانات مسجلة حتى الآن لهذا الصف
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">عنوان الامتحان</th>
                    <th className="p-3">الدرجة</th>
                    <th className="p-3">حالة المراقبة</th>
                    <th className="p-3">حالة الاعتماد</th>
                    <th className="p-3">وقت التسليم</th>
                    <th className="p-3">إجراءات المستر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {gradeSubmissions.map((sub) => {
                    const isCheat = sub.cheatAlertsCount > 0;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{sub.studentName}</span>
                        </td>
                        <td className="p-3 text-slate-300">{sub.examTitle}</td>
                        <td className="p-3 font-mono font-bold text-cyan-400">
                          {sub.score} / {sub.totalMarks}
                        </td>
                        <td className="p-3">
                          {isCheat ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>خروج من الامتحان (قفل فوري)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>التزام كامل 0 مخالفات</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {sub.isGraded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>معتمد ومنشور للطالب</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>تصحيح واعتماد الآن</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{sub.submittedAt}</td>
                        <td className="p-3 flex items-center gap-1.5">
                          {sub.isGraded && (
                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="p-1.5 text-cyan-400 hover:bg-cyan-950/60 rounded-lg border border-cyan-500/30"
                              title="تعديل الدرجة أو الملاحظات"
                            >
                              تعديل
                            </button>
                          )}
                          {/* Allow Retake Button */}
                          <button
                            onClick={() => {
                              sound.playSuccess();
                              if (
                                confirm(
                                  `هل تريد السماح للطالب "${sub.studentName}" بإعادة امتحان "${sub.examTitle}" مرة أخرى؟`
                                )
                              ) {
                                onAllowRetakeExam(sub.id);
                              }
                            }}
                            className="p-1.5 text-amber-400 hover:bg-amber-950/60 rounded-lg border border-amber-500/30"
                            title="السماح للطالب بإعادة الامتحان"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              sound.playWarning();
                              onDeleteSubmission(sub.id);
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg border border-rose-500/20"
                            title="حذف ورقة الامتحان"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ENGINEER PROBLEMS SOLUTIONS GRADING ================= */}
      {activeTab === 'engineers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>إجابات وحلول مسائل المهندسين لـ: <b className="text-white">{gradeNames[activeGrade]}</b></span>
            <span>عدد الحلول المسلمة: <b className="text-amber-400 font-mono">{gradeEngSubmissions.length}</b></span>
          </div>

          {gradeEngSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-xs text-slate-400">
              <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <span>لا توجد حلول مسائل مهندسين مسلمة حتى الآن لهذا الصف</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradeEngSubmissions.map((engSub) => (
                <div
                  key={engSub.id}
                  className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <span className="font-bold text-white text-sm block">{engSub.studentName}</span>
                      <span className="text-[11px] text-amber-400 font-semibold">{engSub.problemTitle}</span>
                    </div>

                    {engSub.status === 'graded' ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                        تم التصحيح (+{engSub.starsAwarded} ⭐)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                        بانتظار تصحيحك ✍️
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">الناتج الرقمي الذي سلمه الطالب:</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {engSub.numericalAnswer}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">خطوات وتفسير الطالب:</span>
                      <p className="text-slate-200 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                        {engSub.writtenSteps}
                      </p>
                    </div>

                    {engSub.stepsImageUrl && (
                      <div>
                        <span className="text-slate-400 block mb-1">صورة ورقة الحل المرفقة:</span>
                        <div
                          onClick={() => setSelectedPhotoPreview(engSub.stepsImageUrl!)}
                          className="relative rounded-xl overflow-hidden border border-slate-700 max-h-36 bg-slate-900 cursor-pointer group"
                        >
                          <img
                            src={engSub.stepsImageUrl}
                            alt="Student paper"
                            className="w-full h-36 object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            اضغط لتكبير الصورة
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {engSub.teacherFeedback && (
                    <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs text-amber-200">
                      <span className="font-bold block text-amber-300 mb-0.5">ملاحظاتك المسجلة:</span>
                      {engSub.teacherFeedback}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-500 font-mono">{engSub.submittedAt}</span>

                    <button
                      onClick={() => handleOpenEngGrading(engSub)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{engSub.status === 'graded' ? 'تعديل التقييم والنجوم' : 'تصحيح ومنح النجوم'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: ANNOUNCEMENTS ================= */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>نشر تنبيه أو رسالة جديدة لجميع الطلاب</span>
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان التنبيه</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="مثال: موعد الحصة القادمة واختبار التكريم..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص التنبيه</label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="أكتب التوجيهات والملاحظات الهامة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={annPriority === 'normal'}
                    onChange={() => setAnnPriority('normal')}
                  />
                  <span>عادي</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-amber-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={annPriority === 'urgent'}
                    onChange={() => setAnnPriority('urgent')}
                  />
                  <span>عاجل وهام ⚠️</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition-all"
              >
                بث التنبيه للطلاب فوراً
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">التنبيهات المنشورة حالياً:</h3>
            {data.announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-2xl border ${
                  ann.priority === 'urgent'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-white text-xs">{ann.title}</h4>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: COMPLAINTS ================= */}
      {activeTab === 'complaints' && (
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm">رسائل واستفسارات الطلاب:</h3>
          {data.complaints.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-xs text-slate-400">
              لا توجد رسائل واردة حتى الآن
            </div>
          ) : (
            <div className="space-y-3">
              {data.complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{c.studentName} ({c.grade})</span>
                    </span>
                    <span className="text-slate-400 font-mono">{c.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 font-semibold">
                    النوع: {c.category} · هاتف: {c.phone}
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Exam Grading & Approval */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">تصحيح واعتماد ورقة الامتحان</h3>
                <span className="text-xs text-amber-400">
                  الطالب: {gradingSub.studentName} · {gradingSub.examTitle}
                </span>
              </div>
              <button
                onClick={() => setGradingSub(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmGrading} className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الدرجة المحسوبة تلقائياً:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {gradingSub.score} من {gradingSub.totalMarks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">حالة المراقبة:</span>
                  <span
                    className={
                      gradingSub.cheatAlertsCount === 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'
                    }
                  >
                    {gradingSub.cheatAlertsCount === 0
                      ? 'التزام كامل'
                      : 'تم رصد خروج من الامتحان (قفل فوري)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الدرجة المعتمدة النهائية
                </label>
                <input
                  type="number"
                  min={0}
                  max={gradingSub.totalMarks}
                  required
                  value={gradedScore}
                  onChange={(e) => setGradedScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ملاحظات وتوجيهات المستر محمد علاء للطالب
                </label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="أكتب ملاحظاتك للطالب..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  اعتماد ونشر النتيجة للطالب الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Engineer Problem Solution Grading */}
      {gradingEngSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">تصحيح مسألة المهندسين ومنح النجوم</h3>
                <span className="text-xs text-amber-400">
                  الطالب: {gradingEngSub.studentName} · {gradingEngSub.problemTitle}
                </span>
              </div>
              <button
                onClick={() => setGradingEngSub(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEngGrading} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  النجوم الممنوحة للطالب ⭐ (تضاف مباشرة لرصيده نحو الـ 100 نجمة)
                </label>
                <select
                  value={engStarsAward}
                  onChange={(e) => setEngStarsAward(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                >
                  <option value={20}>+20 نجمة ⭐ (حل عبقري كامل وتفكير هندسي فذ)</option>
                  <option value={15}>+15 نجمة ⭐ (حل صحيح مع ملاحظة بسيطة في التبسيط)</option>
                  <option value={10}>+10 نجمة ⭐ (محاولة جيدة ولكن توجد أخطاء حسابية)</option>
                  <option value={5}>+5 نجوم ⭐ (تشجيع على المحاولة والتفكير)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ملاحظات وتقييم المستر محمد علاء لحل الطالب
                </label>
                <textarea
                  rows={3}
                  required
                  value={engFeedback}
                  onChange={(e) => setEngFeedback(e.target.value)}
                  placeholder="أكتب تعليقك وتوجيهك للطالب..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingEngSub(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30"
                >
                  اعتماد الحل ومنح النجوم فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Photo Preview Modal */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-pointer"
        >
          <div className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={selectedPhotoPreview}
              alt="Enlarged"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-700"
            />
            <span className="text-xs text-slate-400 mt-2">اضغط في أي مكان للإغلاق</span>
          </div>
        </div>
      )}
    </div>
  );
};
