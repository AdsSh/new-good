import React from 'react';
import { ABOUT_DATA } from '../constants';

export const About: React.FC = () => (
  <div className="pt-24 sm:pt-28 pb-24 bg-gray-50 dark:bg-[#0B1120] min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16 sm:mb-20">
        <div className="relative rounded-3xl overflow-hidden mb-10 sm:mb-12 shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200" 
            alt="Lagos urban planning and architectural development" 
            className="w-full h-64 sm:h-80 md:h-96 object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex items-end justify-center p-6 sm:p-10">
            <div className="text-white max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                ARCON &amp; COREN Certified
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
          Your Trusted Partner for Lagos Building Approvals
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          We simplify the LASPPPA, LASBCA, and Lagos Lands Bureau permit workflows with certified architectural and engineering expertise.
        </p>
      </div>

      {/* Mission & Vision Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
        <div className="bg-white dark:bg-[#161F30] p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-6">
              <span aria-hidden="true" className="material-icons-outlined text-2xl">flag</span>
            </div>
            <h2 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{ABOUT_DATA.mission}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#161F30] p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
              <span aria-hidden="true" className="material-icons-outlined text-2xl">visibility</span>
            </div>
            <h2 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{ABOUT_DATA.vision}</p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-16 sm:mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Our Core Values</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">The guiding principles behind every building permit and architectural filing we manage.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {ABOUT_DATA.values.map(v => (
            <div key={v.title} className="bg-white dark:bg-[#161F30] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm text-center flex flex-col items-center justify-start h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <span aria-hidden="true" className="material-icons-outlined text-3xl">{v.icon}</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-3">{v.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Lagos Permit Hub */}
      <div className="mb-16 sm:mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Why Lagos Builders Choose Us</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Comprehensive statutory coordination from initial survey to final certificate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {ABOUT_DATA.features.map(f => (
            <div key={f.title} className="bg-white dark:bg-[#161F30] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-start h-full">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <span aria-hidden="true" className="material-icons-outlined text-xl">check_circle</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* How We Work */}
      <div className="mb-12">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">How We Work</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">A straightforward process from first contact to permit in hand.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { step: '01', icon: 'chat', title: 'Initial Consultation', desc: 'Share your project details via WhatsApp or our onboarding form. We review your requirements at no cost.' },
            { step: '02', icon: 'assignment', title: 'Document Assessment', desc: 'We audit your existing documents against LASPPPA requirements and identify what is missing or needs correction.' },
            { step: '03', icon: 'engineering', title: 'Preparation & Submission', desc: 'Our registered architects and engineers prepare, seal, and submit your complete dossier through the EPPES portal.' },
            { step: '04', icon: 'verified', title: 'Follow-Up & Handover', desc: 'We track your application through every stage and deliver your approved permit directly to you.' },
          ].map((item) => (
            <div key={item.step} className="bg-white dark:bg-[#161F30] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-start h-full">
              <div className="text-3xl font-black text-primary/20 mb-3">{item.step}</div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <span aria-hidden="true" className="material-icons-outlined text-xl">{item.icon}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
