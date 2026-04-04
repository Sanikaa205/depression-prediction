export default function RiskMeter({ riskScore, confidenceScore }) {
  const getRiskColor = (score) => {
    if (score < 30) return 'from-emerald-500 to-emerald-600';
    if (score < 60) return 'from-amber-500 to-amber-600';
    if (score < 80) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Risk Score Progress Bar */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <label className="text-base font-semibold text-slate-200">Risk Score</label>
          <span className="text-2xl font-bold text-slate-100">{riskScore.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-lg border border-slate-600/50">
          <div
            className={`bg-gradient-to-r ${getRiskColor(riskScore)} h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-current`}
            style={{ width: `${riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Confidence Score Progress Bar */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <label className="text-base font-semibold text-slate-200">Confidence Score</label>
          <span className="text-2xl font-bold text-slate-100">{confidenceScore.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-lg border border-slate-600/50">
          <div
            className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-violet-500/50"
            style={{ width: `${confidenceScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
