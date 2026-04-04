export default function SeverityBadge({ severity }) {
  const severityConfig = {
    Minimal: {
      bgColor: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/30',
    },
    Mild: {
      bgColor: 'bg-gradient-to-br from-amber-500/20 to-amber-500/10',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/30',
    },
    Moderate: {
      bgColor: 'bg-gradient-to-br from-orange-500/20 to-orange-500/10',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-500/30',
    },
    Severe: {
      bgColor: 'bg-gradient-to-br from-red-500/20 to-red-500/10',
      textColor: 'text-red-300',
      borderColor: 'border-red-500/30',
    },
  };

  const config = severityConfig[severity] || severityConfig.Minimal;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border inline-flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-semibold`}>
      <span className={config.textColor}>Severity: {severity}</span>
    </div>
  );
}
