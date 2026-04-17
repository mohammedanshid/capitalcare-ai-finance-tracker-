import React, { useState } from 'react';
import { X, CaretDown, CaretUp, Brain, CheckCircle } from '@phosphor-icons/react';

export const AIInsightsModal = ({ isOpen, onClose, insights, loading }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  if (!isOpen) return null;

  const formatInsights = (text) => {
    if (!text) return [];
    const sections = []; const lines = text.split('\n');
    let currentSection = null; let currentItems = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) { if (currentSection) { currentSection.items = currentItems; sections.push(currentSection); currentSection = null; currentItems = []; } return; }
      const sectionMatch = trimmed.match(/^(\d+)[.)]?\s*(.+)/);
      if (sectionMatch && trimmed.length < 100) {
        if (currentSection) { currentSection.items = currentItems; sections.push(currentSection); }
        currentSection = { title: sectionMatch[2], items: [] }; currentItems = [];
      } else if (trimmed.match(/^[-•*]\s+(.+)/)) {
        const m = trimmed.match(/^[-•*]\s+(.+)/); if (m) currentItems.push(m[1]);
      } else if (currentSection) { currentItems.push(trimmed); }
      else { sections.push({ title: null, items: [trimmed] }); }
    });
    if (currentSection) { currentSection.items = currentItems; sections.push(currentSection); }
    return sections;
  };

  const formattedSections = insights ? formatInsights(insights.insights) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" data-testid="ai-insights-modal">
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[var(--surface-0)] border border-[var(--border-default)] sm:rounded-2xl rounded-t-2xl shadow-[var(--shadow-lg)] p-5 sm:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all" data-testid="close-modal-button">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)] flex items-center justify-center">
            <Brain size={22} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">AI Financial Insights</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Powered by GPT-5.2</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-solid border-[var(--accent-blue)] border-r-transparent mb-4"></div>
            <p className="text-sm text-[var(--text-tertiary)]">Analyzing your finances...</p>
          </div>
        ) : insights ? (
          <div className="space-y-5">
            <div className="border border-[var(--border-default)] rounded-xl p-5" data-testid="ai-insights-content">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle size={18} weight="fill" className="text-[var(--income)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recommendations</h3>
              </div>
              <div className="space-y-5">
                {formattedSections.map((section, idx) => (
                  <div key={idx}>
                    {section.title && (
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--text-primary)] text-[var(--text-inverse)] text-[10px] font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{section.title}</h4>
                      </div>
                    )}
                    {section.items.length > 0 && (
                      <div className="ml-7 space-y-1.5">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] flex-shrink-0 mt-[7px]" />
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {insights.raw_reasoning && (
              <div className="border border-[var(--border-default)] rounded-xl overflow-hidden">
                <button onClick={() => setShowReasoning(!showReasoning)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-1)] transition-colors" data-testid="toggle-raw-reasoning-button">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Raw AI Reasoning</span>
                  {showReasoning ? <CaretUp size={16} /> : <CaretDown size={16} />}
                </button>
                {showReasoning && (
                  <div className="p-4 border-t border-[var(--border-default)] bg-[var(--surface-1)]" data-testid="raw-reasoning-content">
                    <pre className="text-xs text-[var(--text-tertiary)] whitespace-pre-wrap font-mono leading-relaxed">{insights.raw_reasoning}</pre>
                  </div>
                )}
              </div>
            )}
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">{new Date(insights.created_at).toLocaleString()}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
