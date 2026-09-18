const fs = require('fs');
const content = fs.readFileSync('src/components/TokenPredictionLoop.tsx', 'utf8');

const target = `  // Helper to render recent context context
  const renderContext = (includeCurrentStep: boolean) => {
            animate={{ top: 24 }}`;

const replacement = `  // Helper to render recent context context
  const renderContext = (includeCurrentStep: boolean) => {
    const recent = visualizedSteps.slice(-5);
    const count = (promptTokens || 0) + visualizedSteps.length - recent.length;
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono bg-black/20 p-3 rounded border border-border/30">
        {count > 0 && (
          <span className="text-text-muted/60 bg-black/20 px-2 py-0.5 rounded border border-border/20">
            +{count} tokens
          </span>
        )}
        {recent.map((s, i) => (
          <span key={i} className="text-text-main bg-black/40 px-1.5 py-0.5 rounded border border-border/30">
            {s.tokenText.replace(/\\n/g, '↵') || '␣'}
          </span>
        ))}
        {includeCurrentStep && step && (
          <span className="text-primary bg-primary/20 px-1.5 py-0.5 rounded border border-primary/40 animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.3)]">
            {step.tokenText.replace(/\\n/g, '↵') || '␣'}
          </span>
        )}
      </div>
    );
  };

  const Connector = ({ active, handoff = false }: { active: boolean, handoff?: boolean }) => (
    <div className="flex justify-center py-2 relative">
      <div className={\`w-0.5 h-6 transition-colors duration-500 relative overflow-hidden \${active ? 'bg-primary/20' : 'bg-border/30'}\`}>
        <div className={\`absolute top-0 left-0 w-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.5)] transition-all duration-300 \${active ? 'h-full' : 'h-0'}\`} />
        {handoff && (
          <motion.div 
            initial={{ top: -10 }}
            animate={{ top: 24 }}`;

const newContent = content.replace(target, replacement);
fs.writeFileSync('src/components/TokenPredictionLoop.tsx', newContent);
console.log("Patched!");
