import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, Minimize2, Maximize2, History, Zap, RotateCcw } from 'lucide-react';

interface CasioCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbeddedInExam?: boolean;
}

export const CasioCalculator: React.FC<CasioCalculatorProps> = ({
  isOpen,
  onClose,
  isEmbeddedInExam = false
}) => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [isRad, setIsRad] = useState<boolean>(false); // DEG by default in physics
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showConstants, setShowConstants] = useState<boolean>(false);
  const [lastAns, setLastAns] = useState<string>('0');
  const [isShift, setIsShift] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKey = (char: string) => {
    sound.playKeypad(1400);
    setExpression((prev) => prev + char);
  };

  const handleClear = () => {
    sound.playKeypad(900);
    setExpression('');
    setResult('0');
  };

  const handleDelete = () => {
    sound.playKeypad(1100);
    setExpression((prev) => prev.slice(0, -1));
  };

  const evaluateExpression = () => {
    sound.playKeypad(1800);
    if (!expression.trim()) return;

    try {
      // Prepare expression for JS evaluation safely
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `${Math.PI}`)
        .replace(/Ans/g, `(${lastAns})`)
        .replace(/e\^/g, 'Math.exp')
        .replace(/²/g, '**2')
        .replace(/³/g, '**3');

      // Replace sin, cos, tan respecting DEG/RAD mode
      if (!isRad) {
        // DEG mode: convert inside arg (x * Math.PI / 180)
        sanitized = sanitized.replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
        sanitized = sanitized.replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
        sanitized = sanitized.replace(/tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
        sanitized = sanitized.replace(/sin⁻¹\(([^)]+)\)/g, '(Math.asin($1) * 180 / Math.PI)');
        sanitized = sanitized.replace(/cos⁻¹\(([^)]+)\)/g, '(Math.acos($1) * 180 / Math.PI)');
        sanitized = sanitized.replace(/tan⁻¹\(([^)]+)\)/g, '(Math.atan($1) * 180 / Math.PI)');
      } else {
        sanitized = sanitized.replace(/sin\(/g, 'Math.sin(');
        sanitized = sanitized.replace(/cos\(/g, 'Math.cos(');
        sanitized = sanitized.replace(/tan\(/g, 'Math.tan(');
        sanitized = sanitized.replace(/sin⁻¹\(/g, 'Math.asin(');
        sanitized = sanitized.replace(/cos⁻¹\(/g, 'Math.acos(');
        sanitized = sanitized.replace(/tan⁻¹\(/g, 'Math.atan(');
      }

      // Roots and powers
      sanitized = sanitized.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
      sanitized = sanitized.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
      sanitized = sanitized.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
      sanitized = sanitized.replace(/\^/g, '**');

      // Scientific notation e.g. 3×10^8
      sanitized = sanitized.replace(/×10\^/g, '*10**');

      // Evaluate safely
      const fn = new Function(`return (${sanitized})`);
      const val = fn();

      if (typeof val === 'number' && !isNaN(val)) {
        // Format nicely
        let formatted = '';
        if (Math.abs(val) > 1e10 || (Math.abs(val) < 1e-4 && val !== 0)) {
          formatted = val.toExponential(6);
        } else {
          formatted = parseFloat(val.toFixed(8)).toString();
        }
        setResult(formatted);
        setLastAns(formatted);
        setHistory((prev) => [{ expr: expression, res: formatted }, ...prev.slice(0, 19)]);
      } else {
        setResult('Syntax ERROR');
      }
    } catch (e) {
      setResult('Math ERROR');
    }
  };

  const insertConstant = (name: string, value: string) => {
    sound.playKeypad(1600);
    setExpression((prev) => prev + value);
    setShowConstants(false);
  };

  const physicsConstants = [
    { label: 'c (سرعة الضوء)', val: '3e8', unit: 'm/s' },
    { label: 'h (ثابت بلانك)', val: '6.626e-34', unit: 'J·s' },
    { label: 'e (شحنة الإلكترون)', val: '1.602e-19', unit: 'C' },
    { label: 'mₑ (كتلة الإلكترون)', val: '9.109e-31', unit: 'kg' },
    { label: 'g (عجلة الجاذبية)', val: '9.8', unit: 'm/s²' },
    { label: 'G (ثابت الجذب العام)', val: '6.674e-11', unit: 'N·m²/kg²' },
    { label: 'ε₀ (سماحية الفراغ)', val: '8.854e-12', unit: 'F/m' },
    { label: 'μ₀ (نفاذية الفراغ)', val: '1.257e-6', unit: 'T·m/A' },
  ];

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isEmbeddedInExam
          ? 'bottom-4 left-4 max-w-sm w-full'
          : 'inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm'
      }`}
      dir="ltr"
    >
      <div className="relative w-full max-w-[390px] bg-[#1a1f2c] border border-cyan-500/40 rounded-2xl shadow-2xl p-4 text-slate-200 select-none">
        {/* Top Header of Casio FX-991EX */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              CASIO
            </span>
            <span className="text-xs font-semibold text-slate-300 tracking-tight font-mono">
              fx-991EX CLASSWIZ
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConstants(!showConstants)}
              className="px-2 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded border border-amber-500/30 flex items-center gap-1 transition-colors"
              title="ثوابت الفيزياء"
            >
              <Zap className="w-3 h-3" />
              <span>CONST</span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 text-slate-400 hover:text-slate-100 rounded transition-colors"
              title="سجل الحسابات"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Constants Drawer */}
        {showConstants && (
          <div className="mb-3 p-2.5 bg-slate-900/90 rounded-xl border border-amber-500/30 text-xs">
            <div className="text-[11px] font-bold text-amber-400 mb-2 flex items-center justify-between">
              <span>ثوابت فيزيائية جاهزة (اضغط للإدراج)</span>
              <button
                onClick={() => setShowConstants(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {physicsConstants.map((c, i) => (
                <button
                  key={i}
                  onClick={() => insertConstant(c.label, c.val)}
                  className="flex flex-col text-left p-1.5 bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700/60 rounded text-[11px] transition-colors"
                >
                  <span className="font-semibold text-cyan-300">{c.label}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{c.val}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Drawer */}
        {showHistory && (
          <div className="mb-3 p-2.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 text-xs max-h-40 overflow-y-auto">
            <div className="text-[11px] font-bold text-cyan-400 mb-1.5 flex items-center justify-between">
              <span>سجل الحسابات السابقة</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2 text-center">لا توجد عمليات سابقة</p>
            ) : (
              <div className="space-y-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setExpression(item.res);
                      setShowHistory(false);
                    }}
                    className="p-1.5 bg-slate-800/70 hover:bg-slate-800 rounded cursor-pointer border border-slate-700/40 flex justify-between font-mono text-[11px]"
                  >
                    <span className="text-slate-400 truncate max-w-[170px]">{item.expr}</span>
                    <span className="text-cyan-300 font-bold">= {item.res}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Natural LCD Display */}
        <div className="bg-[#a8ba9a] text-[#121f0b] rounded-xl p-3 border-2 border-[#819671] shadow-inner mb-3">
          {/* Status Indicators */}
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#819671]/40 pb-1 mb-1 font-bold">
            <div className="flex gap-2">
              <span className={isShift ? 'text-black bg-amber-300 px-1 rounded' : 'text-[#819671]'}>
                S
              </span>
              <button
                onClick={() => setIsRad(!isRad)}
                className="hover:underline font-bold text-[#121f0b]"
                title="اضغط للتبديل بين الدرجات والراديان"
              >
                {isRad ? 'RAD' : 'DEG'}
              </button>
              <span className="text-[#819671]">MATH</span>
            </div>
            <span className="text-[#819671] text-[9px]">NATURAL-V.P.A.M.</span>
          </div>

          {/* Top Expression Line */}
          <div className="h-6 font-mono text-xs overflow-x-auto whitespace-nowrap text-right text-slate-800 select-all">
            {expression || ' '}
          </div>

          {/* Bottom Result Line */}
          <div className="h-8 font-mono text-xl font-bold overflow-x-auto whitespace-nowrap text-right text-black select-all">
            {result}
          </div>
        </div>

        {/* Function keys row (Top control) */}
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          <button
            onClick={() => setIsShift(!isShift)}
            className={`py-1.5 text-xs font-bold rounded transition-colors ${
              isShift
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-700 hover:bg-slate-600 text-amber-400'
            }`}
          >
            SHIFT
          </button>
          <button
            onClick={() => setIsRad(!isRad)}
            className="py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          >
            {isRad ? 'DEG' : 'RAD'}
          </button>
          <button
            onClick={() => handleKey('(')}
            className="py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          >
            (
          </button>
          <button
            onClick={() => handleKey(')')}
            className="py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          >
            )
          </button>
          <button
            onClick={() => handleKey('π')}
            className="py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded transition-colors"
          >
            π
          </button>
        </div>

        {/* Scientific Trigonometry & Powers */}
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          <button
            onClick={() => handleKey(isShift ? 'sin⁻¹(' : 'sin(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            {isShift ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            onClick={() => handleKey(isShift ? 'cos⁻¹(' : 'cos(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            {isShift ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            onClick={() => handleKey(isShift ? 'tan⁻¹(' : 'tan(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            {isShift ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            onClick={() => handleKey('√(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            √
          </button>
          <button
            onClick={() => handleKey('²')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            x²
          </button>
        </div>

        {/* Advanced Log & Power */}
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          <button
            onClick={() => handleKey('log(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            log
          </button>
          <button
            onClick={() => handleKey('ln(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            ln
          </button>
          <button
            onClick={() => handleKey('^')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            xʸ
          </button>
          <button
            onClick={() => handleKey('×10^')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-amber-300 rounded font-mono font-medium transition-colors"
          >
            ×10ˣ
          </button>
          <button
            onClick={() => handleKey('e^(')}
            className="py-1.5 text-xs bg-[#242b3d] hover:bg-slate-700 text-slate-200 rounded font-mono font-medium transition-colors"
          >
            eˣ
          </button>
        </div>

        {/* Primary Number Pad & Operations */}
        <div className="grid grid-cols-5 gap-1.5">
          {/* Row 1 */}
          <button
            onClick={() => handleKey('7')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            7
          </button>
          <button
            onClick={() => handleKey('8')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            8
          </button>
          <button
            onClick={() => handleKey('9')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            9
          </button>
          <button
            onClick={handleDelete}
            className="py-2.5 text-xs font-bold bg-amber-700/80 hover:bg-amber-600 rounded text-white"
          >
            DEL
          </button>
          <button
            onClick={handleClear}
            className="py-2.5 text-xs font-bold bg-rose-700 hover:bg-rose-600 rounded text-white"
          >
            AC
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleKey('4')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            4
          </button>
          <button
            onClick={() => handleKey('5')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            5
          </button>
          <button
            onClick={() => handleKey('6')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            6
          </button>
          <button
            onClick={() => handleKey('×')}
            className="py-2.5 text-sm font-bold bg-slate-700 hover:bg-slate-600 rounded text-cyan-300 font-mono"
          >
            ×
          </button>
          <button
            onClick={() => handleKey('÷')}
            className="py-2.5 text-sm font-bold bg-slate-700 hover:bg-slate-600 rounded text-cyan-300 font-mono"
          >
            ÷
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleKey('1')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            1
          </button>
          <button
            onClick={() => handleKey('2')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            2
          </button>
          <button
            onClick={() => handleKey('3')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            3
          </button>
          <button
            onClick={() => handleKey('+')}
            className="py-2.5 text-sm font-bold bg-slate-700 hover:bg-slate-600 rounded text-cyan-300 font-mono"
          >
            +
          </button>
          <button
            onClick={() => handleKey('-')}
            className="py-2.5 text-sm font-bold bg-slate-700 hover:bg-slate-600 rounded text-cyan-300 font-mono"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleKey('0')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            0
          </button>
          <button
            onClick={() => handleKey('.')}
            className="py-2.5 text-sm font-bold bg-[#2d3748] hover:bg-slate-600 rounded text-white font-mono"
          >
            .
          </button>
          <button
            onClick={() => handleKey('Ans')}
            className="py-2.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
          >
            Ans
          </button>
          <button
            onClick={evaluateExpression}
            className="col-span-2 py-2.5 text-base font-bold bg-cyan-600 hover:bg-cyan-500 rounded text-white shadow-lg shadow-cyan-600/30 transition-all font-mono"
          >
            =
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2 text-[10px] text-slate-400 text-center border-t border-slate-800">
          منصة الفدائيين في الفيزياء · المهندس محمد علاء
        </div>
      </div>
    </div>
  );
};
