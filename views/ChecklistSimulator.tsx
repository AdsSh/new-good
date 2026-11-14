import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentChecklistCalculator } from '../components/DocumentChecklistCalculator';
import { getWhatsAppQuoteLink } from '../constants';

export const ChecklistSimulator: React.FC = () => {
  return (
    <div className="pt-28 pb-24 bg-gray-50 dark:bg-[#0B1120] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-extrabold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Lagos EPPES &amp; LASPPPA Compliance Hub
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Document Checklist &amp; Timeline Simulator
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Verify every mandatory signed drawing, 3D model, geotechnical test, and corporate/individual tax clearance required by Lagos State before lodgment.
          </p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/onboarding"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Generate Personalized Roadmap</span>
              <span aria-hidden="true" className="material-icons-outlined text-base">arrow_forward</span>
            </Link>
            <a
              href={getWhatsAppQuoteLink(undefined, undefined, "I would like to get a quote and professional review of my permit documents on WhatsApp.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <svg aria-hidden="true" focusable="false" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
              </svg>
              <span>Get Quote on WhatsApp</span>
            </a>
            <Link
              to="/services"
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all inline-flex items-center gap-2"
            >
              <span aria-hidden="true" className="material-icons-outlined text-primary text-base">design_services</span>
              <span>View Service Packages</span>
            </Link>
          </div>
        </div>

        {/* The Interactive Document Checklist & Timeline Simulator Engine */}
        <DocumentChecklistCalculator />

        {/* Informational Guidance Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#161F30] p-7 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-5">
              <span aria-hidden="true" className="material-icons-outlined text-2xl">verified</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Statutory Stamping Protocol
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Every submitted set must bear valid professional registration seals: ARCON for architectural sets, COREN for structural/MEP, and TOPREC for town planning impact statements.
            </p>
          </div>

          <div className="bg-white dark:bg-[#161F30] p-7 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
              <span aria-hidden="true" className="material-icons-outlined text-2xl">view_in_ar</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Multi-Storey 3D BIM Requirement
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Buildings exceeding 3 floors (&gt;3 floors) must provide coordinated 3D structural, mechanical, and electrical digital representations in addition to standard 2D blueprints.
            </p>
          </div>

          <div className="bg-white dark:bg-[#161F30] p-7 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
              <span aria-hidden="true" className="material-icons-outlined text-2xl">speed</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Fast-Track EPPES Processing
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Submitting pre-vetted, complete documentation packages eliminates up to 40+ days of District review query loops and revenue screening stalls.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Need expert help preparing missing documents?</h3>
            <p className="text-teal-100 mt-2 text-sm sm:text-base max-w-xl">
              Our registered architects, COREN engineers, and town planners can draft, seal, and submit your full dossier on the Lagos EPPES portal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={getWhatsAppQuoteLink(undefined, undefined, "Hello PermitFlow team! I need help preparing missing supporting documents for my building permit in Lagos.")}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white px-7 py-4 rounded-xl font-extrabold text-sm shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg aria-hidden="true" focusable="false" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
              </svg>
              <span>Get Quote on WhatsApp</span>
            </a>
            <Link
              to="/onboarding"
              className="whitespace-nowrap bg-white text-primary hover:bg-gray-100 px-7 py-4 rounded-xl font-extrabold text-sm shadow-lg transition-all"
            >
              Start Assessment →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
