import React, { useState, useRef } from 'react';
import { BoardCapture, GradeLevel } from '../types';
import { sound } from '../utils/audio';
import {
  Presentation,
  ZoomIn,
  Download,
  Calendar,
  Plus,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { BOARD_BANNER } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';

interface BoardSectionProps {
  boardCaptures: BoardCapture[];
  grade: GradeLevel;
  isTeacher: boolean;
  onAddBoard?: (board: Omit<BoardCapture, 'id'>) => void;
  onDeleteBoard?: (id: string) => void;
}

export const BoardSection: React.FC<BoardSectionProps> = ({
  boardCaptures,
  grade,
  isTeacher,
  onAddBoard,
  onDeleteBoard
}) => {
  const [selectedBoard, setSelectedBoard] = useState<BoardCapture | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [lectureDate, setLectureDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradeBoards = boardCaptures.filter((b) => b.grade === grade);

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
          console.error('Image compression error:', err);
        });
    }
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const finalImage = imageUrl || BOARD_BANNER;

    sound.playSuccess();
    onAddBoard?.({
      grade,
      title,
      unit: unit || 'محاضرات السنتر',
      lectureDate: lectureDate || new Date().toISOString().split('T')[0],
      imageUrl: finalImage,
      notes: notes || 'تدوين كامل لجميع معادلات ورسومات المحاضرة على السبورة.'
    });

    setTitle('');
    setUnit('');
    setLectureDate('');
    setImageUrl('');
    setImageFileName('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Presentation className="w-6 h-6 text-cyan-400" />
            <span>قسم تصوير السبورة (شرح المحاضرات)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            لقطات فائقة الدقة لسبورة المستر محمد علاء في الحصص لشرح القوانين والرسومات الهندسية
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => {
              sound.playClick();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
          >
            <Camera className="w-4 h-4" />
            <span>رفع تصوير سبورة من جهازك</span>
          </button>
        )}
      </div>

      {/* Grid of Board Captures */}
      {gradeBoards.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <Presentation className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">لا توجد صور سبورة مرفوعة لهذا الصف حالياً</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gradeBoards.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedBoard(b);
                  }}
                  className="relative h-52 bg-slate-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-white">
                    <span className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/60 font-semibold text-[11px] truncate max-w-[200px]">
                      {b.unit}
                    </span>
                    <span className="flex items-center gap-1 bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-500/30 text-[10px] font-bold">
                      <ZoomIn className="w-3 h-3" />
                      <span>تكبير</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>تاريخ المحاضرة: {b.lectureDate}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {b.notes}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBoard(b);
                  }}
                  className="flex-1 py-2 px-3 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>عرض السبورة بدقة عالية</span>
                </button>

                <a
                  href={b.imageUrl}
                  download={b.title}
                  onClick={() => sound.playSuccess()}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all"
                  title="تنزيل صورة السبورة"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                </a>

                {isTeacher && onDeleteBoard && (
                  <button
                    onClick={() => {
                      sound.playWarning();
                      onDeleteBoard(b.id);
                    }}
                    className="p-2 text-rose-400 hover:bg-rose-950/60 rounded-xl border border-rose-500/30 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox High-Resolution Modal */}
      {selectedBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{selectedBoard.title}</h3>
                <span className="text-xs text-cyan-400">
                  {selectedBoard.unit} · {selectedBoard.lectureDate}
                </span>
              </div>
              <button
                onClick={() => setSelectedBoard(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-950 flex items-center justify-center">
              <img
                src={selectedBoard.imageUrl}
                alt={selectedBoard.title}
                className="max-h-[65vh] object-contain rounded-xl border border-slate-800 shadow-xl"
              />
            </div>

            <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                {selectedBoard.notes}
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={selectedBoard.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={selectedBoard.title}
                  className="py-2.5 px-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل السبورة بدقة HD</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Add Board Modal (Direct Device Upload) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">رفع تصوير سبورة من جهازك</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              {/* Native Device File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اختر صورة السبورة من جهازك (أو التقطها بالكاميرا)
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
                      <span className="text-[10px] text-slate-400 mt-0.5">يدعم JPG, PNG, WEBP (من الاستوديو أو الكاميرا)</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المحاضرة والسبورة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: سبورة شرح الفصل الأول: كيرشوف والعقد"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوحدة / السنتر</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="سنتر الفدائيين"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ المحاضرة</label>
                  <input
                    type="date"
                    value={lectureDate}
                    onChange={(e) => setLectureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات وشرح ما كُتب على السبورة</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أكتب ملخصاً للنقاط والقوانين المدونة على السبورة..."
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
                  <Upload className="w-4 h-4" />
                  <span>حفظ ونشر تصوير السبورة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
