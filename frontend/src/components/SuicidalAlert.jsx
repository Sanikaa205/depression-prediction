export default function SuicidalAlert({ show }) {
  if (!show) return null;

  return (
    <div className="border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-8 shadow-xl animate-pulse">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
          <span className="text-2xl font-bold text-red-400">!</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-red-300 mb-3">
            Suicidal Language Detected
          </h3>
          <p className="text-red-200 leading-relaxed mb-6">
            We detected language that may indicate suicidal thoughts. Please reach out to a mental health professional or crisis helpline immediately.
          </p>
          <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-300 mb-2">Crisis Helplines:</p>
            <p className="text-red-200 font-mono text-base leading-relaxed">
              iCall India: <span className="font-bold">9152987821</span> | Vandrevala
              Foundation: <span className="font-bold">1860-2662-345</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
