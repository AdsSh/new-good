
import React from 'react';
import { Link } from 'react-router-dom';
import { PHASES } from '../constants';

export const Process: React.FC = () => {
  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-gray-50 dark:bg-[#0B1120] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-extrabold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            LASPPPA 5-Stage Approval Roadmap
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
            Your Step-by-Step EPPES Journey Map
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            A professional statutory timeline aligned with Lagos State physical planning laws and LASBCA building control frameworks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/checklist"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <span aria-hidden="true" className="material-icons-outlined text-lg">checklist</span>
              <span>Open Document Checklist &amp; Simulator</span>
            </Link>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <span>Start Application</span>
              <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Process Timeline Steps */}
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          {PHASES.map((phase, idx) => (
            <div key={phase.id} className="relative flex flex-col md:flex-row gap-6 sm:gap-8 group">
              {idx < PHASES.length - 1 && (
                <div className="absolute left-[2.25rem] top-20 bottom-[-3rem] w-0.5 bg-gray-200 dark:bg-gray-800 hidden md:block z-0"></div>
              )}
              
              {/* Step Counter Badge */}
              <div className="md:w-24 flex md:flex-col items-center gap-4 relative z-10 shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white dark:bg-[#161F30] border-2 border-primary/20 group-hover:border-primary text-primary flex items-center justify-center shadow-md font-extrabold text-xl sm:text-2xl transition-all">
                  0{phase.id}
                </div>
              </div>

              {/* Step Content Card */}
              <div className="flex-1 bg-white dark:bg-[#161F30] p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-800 group-hover:border-primary/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{phase.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base leading-relaxed">{phase.description}</p>
                  </div>
                  <span className="self-start text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                    {phase.duration}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                  {phase.tasks.map((task, i) => (
                    <div key={`task-${phase.id}-${i}`} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span aria-hidden="true" className="material-icons-outlined text-emerald-700 text-base mt-0.5 shrink-0">check_circle</span>
                      <span className="leading-snug">{task}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                  <Link
                    to="/checklist"
                    className="text-primary hover:text-primary-dark font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 group/link py-3 -my-3"
                  >
                    <span>Check required documents for Phase 0{phase.id}</span>
                    <span aria-hidden="true" className="material-icons-outlined text-sm group-hover/link:translate-x-0.5 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
