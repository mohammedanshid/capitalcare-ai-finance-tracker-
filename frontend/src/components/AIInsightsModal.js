import React, { useState } from 'react';
import { X, CaretDown, CaretUp, Brain, CheckCircle } from '@phosphor-icons/react';

export const AIInsightsModal = ({ isOpen, onClose, insights, loading }) => {
  const [showReasoning, setShowReasoning] = useState(false);

  if (!isOpen) return null;

  // Function to format AI insights into structured content
  const formatInsights = (text) => {
    if (!text) return [];
    
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentItems = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        if (currentItems.length > 0 && currentSection) {
          currentSection.items = currentItems;
          sections.push(currentSection);
          currentSection = null;
          currentItems = [];
        }
        return;
      }
      
      // Check if line is a section heading (starts with number like "1.", "2.", etc.)
      const sectionMatch = trimmedLine.match(/^(\d+)[.)]?\s*(.+)/);
      if (sectionMatch && trimmedLine.length < 100) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.items = currentItems;
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          title: sectionMatch[2],
          items: []
        };
        currentItems = [];
      }
      // Check if line is a bullet point
      else if (trimmedLine.match(/^[-•*]\s+(.+)/) || trimmedLine.match(/^\d+\)\s+(.+)/)) {
        const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)/) || trimmedLine.match(/^\d+\)\s+(.+)/);
        if (bulletMatch) {
          currentItems.push(bulletMatch[1]);
        }
      }
      // Regular text
      else if (currentSection) {
        currentItems.push(trimmedLine);
      }
      // Text before any section
      else {
        sections.push({ title: null, items: [trimmedLine] });
      }
    });
    
    // Add last section
    if (currentSection) {
      currentSection.items = currentItems;
      sections.push(currentSection);
    }
    
    return sections;
  };

  const formattedSections = insights ? formatInsights(insights.insights) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-testid="ai-insights-modal">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-2xl bg-white/90 border border-white/40 shadow-2xl rounded-2xl p-8"
        style={{
          backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/04c5176c-a459-4d76-8697-f64bc179b7af/images/9e56d13142a60bbde4d56358523733aab29046e516de2076f3787377277fe713.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#52525B] hover:text-[#09090B] transition-colors"
          data-testid="close-modal-button"
        >
          <X size={24} weight="bold" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#1D4ED8] rounded-lg">
            <Brain size={32} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#09090B] font-['Outfit']">
              AI Financial Insights
            </h2>
            <p className="text-sm text-[#52525B] font-['Manrope'] mt-1">Powered by OpenAI GPT-5.2</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#1D4ED8] border-r-transparent mb-4"></div>
            <p className="text-[#52525B] font-['Manrope']">Analyzing your finances...</p>
          </div>
        ) : insights ? (
          <div className="space-y-6">
            {/* Main Insights - Formatted */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#E4E4E7] rounded-xl p-6" data-testid="ai-insights-content">
              <h3 className="text-lg font-semibold text-[#09090B] font-['Outfit'] mb-6 flex items-center gap-2">
                <CheckCircle size={24} weight="fill" className="text-[#059669]" />
                Financial Analysis & Recommendations
              </h3>
              
              <div className="space-y-6">
                {formattedSections.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    {section.title && (
                      <h4 className="text-base font-semibold text-[#09090B] font-['Outfit'] flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#09090B] text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {section.title}
                      </h4>
                    )}
                    {section.items.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {section.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 text-[#52525B] font-['Manrope'] leading-relaxed">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A1A1AA] flex-shrink-0 mt-2"></span>
                            <p className="flex-1">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Reasoning (Collapsible) */}
            {insights.raw_reasoning && (
              <div className="bg-[#F4F5F7] border border-[#E4E4E7] rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#E4E4E7]/50 transition-colors"
                  data-testid="toggle-raw-reasoning-button"
                >
                  <span className="text-xs uppercase tracking-wider text-[#52525B] font-semibold font-['Manrope']">
                    View Raw AI Reasoning
                  </span>
                  {showReasoning ? <CaretUp size={20} /> : <CaretDown size={20} />}
                </button>
                {showReasoning && (
                  <div className="p-4 border-t border-[#E4E4E7]" data-testid="raw-reasoning-content">
                    <pre className="text-xs text-[#52525B] font-['JetBrains_Mono'] whitespace-pre-wrap overflow-x-auto">
                      {insights.raw_reasoning}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-[#A1A1AA] font-['Manrope'] text-center">
              Analysis generated on {new Date(insights.created_at).toLocaleString()}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
