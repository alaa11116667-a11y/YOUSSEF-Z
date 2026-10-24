import React, { useState } from 'react';
import { CurrentUser, GradeLevel, RegisteredStudent } from '../types';
import { sound } from '../utils/audio';
import {
  Shield,
  KeyRound,
  User,
  Lock,
  ArrowLeft,
  GraduationCap,
  AlertTriangle,
  Phone,
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { HERO_BANNER } from '../data/initialData';

interface LoginPageProps {
  onLogin: (user: CurrentUser) => void;
  onRegisterStudent: (student: RegisteredStudent) => void;
  onOpenComplaints: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onRegisterStudent,
  onOpenComplaints
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'teacher'>('register');

  // Student registration form state
  const [fullName, setFullName] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [governorate, setGovernorate] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');

  // Returning student quick login state
  const [loginName, setLoginName] = useState<string>('');
  const [loginPasscode, setLoginPasscode] = useState<string>('');

  // Teacher form state
  const [teacherUsername, setTeacherUsername] = useState<string>('');
  const [teacherPassword, setTeacherPassword] = useState<string>('');

  // Error & Status
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const getGradeFromPasscode = (code: string): GradeLevel | null => {
    const trimmed = code.trim();
    if (trimmed === '110000') return 'grade1';
    if (trimmed === '222000') return 'grade2';
    if (trimmed === '333300') return 'grade3';
    return null;
  };

  // Student Registration handler
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      sound.playWarning();
      setErrorMessage('يرجى كتابة اسم الطالب ثنائياً أو ثلاثياً على الأقل.');
      return;
    }

    if (!studentPhone.trim() || studentPhone.trim().length < 10) {
      sound.playWarning();
      setErrorMessage('يرجى إدخال رقم هاتف الطالب الصحيح (11 رقماً).');
      return;
    }

    const targetGrade = getGradeFromPasscode(passcode);
    if (!targetGrade) {
      sound.playWarning();
      setErrorMessage('شفرة الدخول الخاصة بالصف الدراسي غير صحيحة! يرجى مراجعة الباشمهندس محمد علاء للحصول على كود صفك.');
      return;
    }

    sound.playSuccess();
    const studentId = `student-${Date.now()}`;
    const newStudent: RegisteredStudent = {
      id: studentId,
      name: fullName.trim(),
      phone: studentPhone.trim(),
      parentPhone: parentPhone.trim() || 'غير مسجل',
      grade: targetGrade,
      governorate: governorate.trim() || 'عام',
      registeredAt: new Date().toLocaleDateString('ar-EG'),
      stars: 10, // Initial welcome bonus stars!
      completedExamsCount: 0,
      solvedProblemsCount: 0
    };

    onRegisterStudent(newStudent);
    onLogin({
      id: studentId,
      name: newStudent.name,
      phone: newStudent.phone,
      parentPhone: newStudent.parentPhone,
      grade: targetGrade,
      role: 'student',
      stars: 10
    });
  };

  // Returning Student Quick Login
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginName.trim()) {
      sound.playWarning();
      setErrorMessage('يرجى كتابة اسم الطالب.');
      return;
    }

    const targetGrade = getGradeFromPasscode(loginPasscode);
    if (!targetGrade) {
      sound.playWarning();
      setErrorMessage('شفرة الدخول غير صحيحة! تأكد من كود صفك الدراسي.');
      return;
    }

    sound.playSuccess();
    onLogin({
      name: loginName.trim(),
      grade: targetGrade,
      role: 'student',
      stars: 10
    });
  };

  // Teacher Login
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const u = teacherUsername.trim();
    const p = teacherPassword.trim();

    if (u === 'moking' && p === '12312300') {
      sound.playSuccess();
      onLogin({
        name: 'المهندس محمد علاء',
        role: 'teacher'
      });
    } else {
      sound.playWarning();
      setErrorMessage('بيانات دخول المعلم غير صحيحة! يرجى التأكد من اسم المستخدم وكلمة السر.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080d19] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background with physics elements */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img
          src={HERO_BANNER}
          alt="Physics Banner"
          className="w-full h-full object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080d19] via-[#080d19]/80 to-[#080d19]" />
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
            ف
          </div>
          <div>
            <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">
              الفدائيين في الفيزياء
            </div>
            <div className="text-[11px] sm:text-xs text-cyan-400 font-semibold">
              تحت إشراف: المهندس محمد علاء
            </div>
          </div>
        </div>

        <button
          onClick={onOpenComplaints}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all"
        >
          المطور والدعم الفني
        </button>
      </header>

      {/* Main Login / Registration Deck */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
          {/* Welcome Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>تسجيل مرة واحدة فقط ويبقى الحساب مفعلاً بجهازك ⚡</span>
            </div>
            <h2 className="text-2xl font-black text-white">بوابة الفدائيين في الفيزياء</h2>
            <p className="text-xs text-slate-400 mt-1">
              سجل بياناتك وسيصل اسمك فوراً للمستر محمد علاء للاعتماد
            </p>
          </div>

          {/* Mode Switcher (Register vs Quick Login vs Teacher) */}
          <div className="grid grid-cols-3 p-1 bg-slate-800/80 rounded-2xl mb-6 border border-slate-700/50 text-xs">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('register');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>تسجيل طالب جديد</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('login');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>دخول مباشر</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('teacher');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'teacher'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>لوحة المستر</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. NEW STUDENT FULL REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleStudentRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم الطالب ثلاثياً أو رباعياً <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: يوسف أحمد محمد علي"
                    className="w-full pr-10 pl-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف الطالب (واتساب) <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full pr-10 pl-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف ولي الأمر
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pr-10 pl-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  المحافظة / السنتر أو المدرسة
                </label>
                <div className="relative">
                  <Building className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    placeholder="مثال: القاهرة - سنتر الفدائيين"
                    className="w-full pr-10 pl-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>شفرة الصف الدراسي المعتمدة <span className="text-cyan-400">*</span></span>
                  <span className="text-cyan-400 text-[10px]">كود سري محمي</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="أدخل شفرة صفك الدراسي..."
                    className="w-full pr-10 pl-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * الشفرة مخصصة لطلاب المهندس محمد علاء لتحديد صفك الدراسي بدقة.
                </p>
              </div>

              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  هدية التسجيل: ستحصل على <b className="text-amber-400">10 نجوم ترحيبية ⭐</b> فور التسجيل لبدء رحلة التكريم!
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>تسجيل حساب الطالب والدخول للمنصة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. QUICK LOGIN FORM (If already registered) */}
          {activeTab === 'login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الطالب</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="اكتب اسمك المسجل به..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">شفرة الدخول</label>
                <div className="relative">
                  <KeyRound className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    placeholder="أدخل شفرة صفك الدراسي..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>تسجيل الدخول</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. TEACHER MASTER LOGIN */}
          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                تسجيل دخول مخصص للمعلم فقط لإدارة الامتحانات والواجبات والمذكرات لجميع الصفوف الدراسية.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    placeholder="اسم المستخدم..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="كلمة المرور السرية..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>دخول لوحة تحكم المستر</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer Mini Credit */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/60">
        منصة الفدائيين في الفيزياء · المهندس محمد علاء · تطوير م. علاء جهاد (01021462904)
      </footer>
    </div>
  );
};
