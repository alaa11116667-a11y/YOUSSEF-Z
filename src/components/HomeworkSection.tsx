import React, { useState, useRef } from 'react';
import { Homework, GradeLevel } from '../types';
import { sound } from '../utils/audio';
import {
  Image,
  Download,
  Eye,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  UploadCloud,
  X,
  FileCheck,
  ZoomIn,
  Upload,
  Sparkles
} from 'lucide-react';
import { BOARD_BANNER } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';

interface HomeworkSectionProps {
  homeworks: Homework[];
  grade: GradeLevel;
  isTeacher: boolean;
  onAddHomework?: (hw: Omit<Homework, 'id' | 'createdAt'>) => void;
  onDeleteHomework?: (id: string) => void;
}

export const HomeworkSection: React.FC<HomeworkSectionProps> = ({
  homeworks,
  grade,
  isTeacher,
  onAddHomework,
  onDeleteHomework
}) => {
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submittedSolutions, setSubmittedSolutions] = useState<Record<string, boolean>>({});
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // New HW state for teacher
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradeHws = homeworks.filter((h) => h.grade === grade);

  const handleStudentSubmitSolution = (hwId: string) => {
    sound.playSuccess();
    setSubmittedSolutions((prev) => ({ ...prev, [hwId]: true }));
    setSubmissionFeedback('تم إرسال حل الواجب بنجاح إلى المستر محمد علاء للمراجعة والتقييم!');
    setTimeout(() => setSubmissionFeedback(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      compressImageFile(file)
        .then((compressed) => {
          setImageUrl(compressed);
          sound.playSuccess();
        })
        .catch((err) => {
          console.error('Homework image compression error:', err);
        });
    }
  };

  const handleCreateHw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const finalImage = imageUrl || BOARD_BANNER;

    sound.playSuccess();
    onAddHomework?.({
      grade,
      title,
      chapter: chapter || 'الوحدة الحالية',
      description,
      dueDate: dueDate || 'قبل الحصة القادمة',
      imageUrl: finalImage
    });

    setTitle('');
    setChapter('');
    setDescription('');
    setDueDate('');
    setImageUrl('');
    setImageFileName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-cyan-400" />
            <span>قسم شيتات وصور الواجب</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            صور الواجبات الأسبوعية المعتمدة من المستر محمد علاء · حل وأرسل إجاباتك لمراجعتها
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => {
              sound.playClick();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>رفع شيت واجب من جهازك</span>
          </button>
        )}
      </div>

      {/* Submission Alert */}
      {submissionFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submissionFeedback}</span>
        </div>
      )}

      {/* Homework Cards Grid */}
      {gradeHws.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <Image className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">لا توجد واجبات مضافة لهذا الصف حالياً</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isTeacher ? 'اضغط على زر رفع شيت واجب بالأعلى لاختيار صورة من جهازك' : 'سيقوم المستر محمد علاء بإضافة شيتات الواجب قريباً'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gradeHws.map((hw) => {
            const isDone = submittedSolutions[hw.id];

            return (
              <div
                key={hw.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Thumbnail with zoom trigger */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setSelectedHw(hw);
                    }}
                    className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={hw.imageUrl}
                      alt={hw.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-white">
                      <span className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/60 font-semibold text-[11px] truncate max-w-[200px]">
                        {hw.chapter}
                      </span>
                      <span className="flex items-center gap-1 bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-500/30 text-[10px] font-bold">
                        <ZoomIn className="w-3 h-3" />
                        <span>تكبير الصورة</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {hw.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>موعد التسليم: {hw.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedHw(hw);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>عرض الشيت</span>
                  </button>

                  {!isTeacher && (
                    <button
                      onClick={() => handleStudentSubmitSolution(hw.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم التسليم</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>تسليم الحل</span>
                        </>
                      )}
                    </button>
                  )}

                  {isTeacher && onDeleteHomework && (
                    <button
                      onClick={() => {
                        sound.playWarning();
                        onDeleteHomework(hw.id);
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-950/60 rounded-xl border border-rose-500/30 transition-all"
                      title="حذف الواجب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Fullscreen Image View & Solution Upload */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{selectedHw.title}</h3>
                <span className="text-xs text-cyan-400">{selectedHw.chapter} · موعد التسليم: {selectedHw.dueDate}</span>
              </div>
              <button
                onClick={() => setSelectedHw(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image View */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 flex items-center justify-center">
              <img
                src={selectedHw.imageUrl}
                alt={selectedHw.title}
                className="max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-lg"
              />
            </div>

            {/* Description & Action Footer */}
            <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 flex-1 leading-relaxed">
                {selectedHw.description}
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={selectedHw.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={selectedHw.title}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الصورة</span>
                </a>

                {!isTeacher && (
                  <button
                    onClick={() => {
                      handleStudentSubmitSolution(selectedHw.id);
                      setSelectedHw(null);
                    }}
                    className="py-2 px-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>تأكيد رفع وتسليم الواجب</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Add Homework Modal (Direct File Upload from Device) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">رفع صورة شيت واجب من جهازك</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHw} className="space-y-4">
              {/* Native Device File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اختر صورة الشيت من جهازك (كمبيوتر / هاتف / تابلت)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    imageUrl
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-cyan-500/40 hover:border-cyan-400 bg-slate-800/60 hover:bg-slate-800'
                  }`}
                >
                  {imageUrl ? (
                    <div className="space-y-2 w-full">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-28 mx-auto object-contain rounded-xl border border-slate-700"
                      />
                      <div className="text-xs text-emerald-300 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>تم اختيار الصورة: {imageFileName || 'صورة من الجهاز'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">اضغط لتغيير الصورة</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-white">اضغط لاختيار صورة من جهازك</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">يدعم JPG, PNG, WEBP (التقاط كاميرا أو من المعرض)</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الشيت</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شيت واجب مسائل كيرشوف وقانون أوم"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الفصل / الباب</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="الفصل الأول"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">موعد التسليم</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="السبت القادم"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تعليمات وملاحظات الواجب</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أكتب توجيهاتك للطلاب حول حل المسائل..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>حفظ ونشر الشيت للطلاب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
