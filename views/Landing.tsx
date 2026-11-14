
import heroBg from '@/src/assets/images/hero_bg_1786853084476.jpg';
import solutionsImg from '@/src/assets/images/solutions_img_1786853096959.jpg';
import React from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-28 sm:pt-32 pb-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="absolute inset-0 bg-accent-dark/75 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
             <span className="text-white text-xs font-bold uppercase tracking-widest">Exclusively Serving Lagos State</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 sm:mb-8 leading-tight tracking-tight">
            Lagos Building Permit <br/><span className="text-teal-300">Fast-Track Service</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Stop worrying about LASPPPA &amp; LASBCA bureaucracy. We fast-track building permit approvals so you start construction on time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center">
            <Link to="/onboarding" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2">
              <span>Start Your Project</span>
              <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
            <Link to="/checklist" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2">
              <span aria-hidden="true" className="material-icons-outlined text-primary text-xl">checklist</span>
              <span>Checklist &amp; Simulator</span>
            </Link>
            <Link to="/services" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold transition-all backdrop-blur-sm inline-flex items-center justify-center">
              <span>Explore Services</span>
            </Link>
          </div>
          
          <div className="mt-14 sm:mt-18 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 border-t border-white/20 pt-8 sm:pt-10 text-white">
            <div className="text-center"><div className="text-lg sm:text-xl font-extrabold">LASPPPA Expertise</div><div className="text-[11px] sm:text-xs opacity-80 mt-1">Deep knowledge of Lagos permit workflows</div></div>
            <div className="text-center"><div className="text-lg sm:text-xl font-extrabold">EPPES Portal Ready</div><div className="text-[11px] sm:text-xs opacity-80 mt-1">Digital submission and tracking</div></div>
            <div className="text-center"><div className="text-lg sm:text-xl font-extrabold">End-to-End Service</div><div className="text-[11px] sm:text-xs opacity-80 mt-1">From drawings to final approval</div></div>
            <div className="text-center"><div className="text-lg sm:text-xl font-extrabold">WhatsApp Support</div><div className="text-[11px] sm:text-xs opacity-80 mt-1">Direct access to consultants</div></div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 sm:py-24 bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight">Navigating Lagos Regulations</h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              From Ikoyi to Ikeja, we understand the specific zoning laws and requirements for every district in Lagos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: 'description', title: 'Plan Approval', desc: 'Complete processing of building plan approvals with the Lagos State Physical Planning Permit Authority (LASPPPA).' },
              { icon: 'architecture', title: 'Architectural Design', desc: 'Modern, functional designs tailored to Lagos\'s unique landscape and compliant with state building codes.' },
              { icon: 'verified_user', title: 'Title Regularization', desc: 'Assistance with Certificate of Occupancy (C of O), Governor\'s Consent, and land title perfection.' },
              { icon: 'gavel', title: 'Amnesty Processing', desc: 'Regularizing existing buildings without permits and navigating Lagos State building amnesty programs.' },
            ].map((item, i) => (
              <div key={`solution-${i}`} className="bg-white dark:bg-[#161F30] p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 group hover:border-primary/40 transition-all flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                    <span aria-hidden="true" className="material-icons-outlined text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-24 overflow-hidden bg-gray-50 dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 sm:mb-8 tracking-tight">Why Lagos Builders Choose Us</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed">
                Navigating the government offices at Alausa can be overwhelming. We have the established relationships and local expertise to expedite your approvals legally and efficiently.
              </p>
              <div className="space-y-6 sm:space-y-8">
                {[
                  { icon: 'verified', title: 'Local Agency Expertise', text: 'Deep understanding of workflows at Alausa and district planning offices.' },
                  { icon: 'schedule', title: 'Avoid Delays', text: 'We ensure all documentation (Tax, Title, Drawings) is 100% accurate before submission.' },
                  { icon: 'shield', title: 'Prevent Demolition', text: 'Ensuring full compliance to protect your investment from sealing or demolition orders.' },
                ].map((item, i) => (
                  <div key={`feature-${i}`} className="flex gap-4 sm:gap-6 items-start">
                    <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-sm">
                      <span aria-hidden="true" className="material-icons-outlined text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative w-full">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
              <img 
                src={solutionsImg} 
                loading="lazy"
                decoding="async"
                className="relative rounded-3xl shadow-xl w-full h-[400px] sm:h-[500px] md:h-[550px] object-cover ring-1 ring-black/5" 
                alt="Lagos Construction Site"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">Building in Lagos? Get It Approved.</h2>
          <p className="text-base sm:text-xl text-white/90 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            Don't risk demolition or costly delays. Let our experts handle your permit while you focus on the project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/onboarding" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 text-base sm:text-lg px-10 py-4 rounded-xl font-bold transition-all shadow-2xl inline-flex items-center justify-center gap-2">
              <span>Start Application</span>
              <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
            <Link to="/services" className="w-full sm:w-auto bg-primary-dark border border-white/20 text-white hover:bg-opacity-80 text-base sm:text-lg px-10 py-4 rounded-xl font-bold transition-all inline-flex items-center justify-center">
              <span>View All Services</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
