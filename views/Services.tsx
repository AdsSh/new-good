import React from 'react';
import { Link } from 'react-router-dom';
import { getWhatsAppQuoteLink } from '../constants';

interface ServiceItem {
  name: string;
  price: string;
  desc: string;
  tag: string;
}

interface ServiceCategory {
  title: string;
  icon: string;
  services: ServiceItem[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: 'Core Approvals & Drawings',
    icon: 'gavel',
    services: [
      { name: 'Planning Permit Processing', price: '₦500,000+', desc: 'Application vetting & eprop upload, Site inspection coordination, Follow-up with LASPPA officials. (Excludes official statutory fees)', tag: 'Required for all new constructions' },
      { name: 'Structural Drawings', price: '₦450,000+', desc: 'Engineer-stamped foundation schedules and beam/column reinforcements.', tag: 'LASBCA certification required' },
      { name: 'M&E Drawings', price: '₦250,000+', desc: 'Full Mechanical & Electrical plans compliant with Lagos building codes for multi-family or commercial layouts.', tag: 'Multi-family & industrial buildings' },
      { name: 'Architectural Drawings', price: '₦400,000+', desc: 'Detailed floor plans, elevations, and site layouts designed to meet LASPPRA validation standards.', tag: 'Foundation of permit application' },
    ]
  },
  {
    title: 'Site Reports & Land Surveys',
    icon: 'map',
    services: [
      { name: 'Soil Test Report', price: '₦450,000+', desc: 'Field drilling, sampling, lab analysis, and a professional geotechnical report (2-borehole).', tag: 'Above 2 floors / Lekki terrain' },
      { name: 'Survey Plan', price: '₦425,000 - ₦1,575,000', desc: 'Beacon setting, registered surveyor seal, and mandatory Red Copy lodgment.', tag: 'All land transactions' },
      { name: 'PPTR / LUPAR', price: '₦450,000 - ₦1,200,000', desc: 'Assesses environmental, traffic, and neighborhood compatibility for commercial/multi-unit projects.', tag: 'Commercial & multi-unit projects' },
    ]
  },
  {
    title: 'Statutory Clearances',
    icon: 'shield',
    services: [
      { name: 'Clearance Letters', price: '₦250,000+', desc: 'Securing specialized agency approvals: Fire Service, Drainage, and LASTMA traffic clearance.', tag: 'Specialized buildings' },
    ]
  }
];

export const Services: React.FC = () => {
  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-gray-50 dark:bg-[#0B1120] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="relative rounded-3xl overflow-hidden mb-10 sm:mb-12 shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" 
              alt="Lagos architectural development" 
              className="w-full h-64 sm:h-80 md:h-96 object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex items-end justify-center p-6 sm:p-10">
              <div className="text-white max-w-2xl text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Lagos EPPES &amp; LASPPPA Vetting Compliant
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
            Complete Building Permit Services – All in One Hub
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We handle every document: LASPPPA approvals, structural drawings, soil tests, clearance letters &amp; more. No more juggling multiple consultants.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center">
            <Link to="/onboarding" className="bg-primary hover:bg-primary-dark text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all inline-flex items-center gap-2">
              <span>Start Application</span>
              <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
            <a
              href={getWhatsAppQuoteLink(undefined, undefined, "Hello PermitFlow! I would like to get an instant quote and consultation for building permit services in Lagos.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <svg aria-hidden="true" focusable="false" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              to="/checklist"
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <span aria-hidden="true" className="material-icons-outlined text-primary text-base">checklist</span>
              <span>Checklist &amp; Simulator</span>
            </Link>
          </div>
        </div>

        {/* Feature Banner: Go to Simulator */}
        <div className="mb-16 sm:mb-20 bg-gradient-to-r from-teal-900 to-primary text-white rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <span aria-hidden="true" className="material-icons-outlined text-2xl text-teal-300">timeline</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Want to check your document readiness &amp; calculate turnaround?</h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Use our standalone Checklist &amp; Timeline Simulator to see exact signed drawing mandates, 3D floor rules, and tax clearance requirements.
              </p>
            </div>
          </div>
          <Link
            to="/checklist"
            className="whitespace-nowrap bg-white text-teal-900 hover:bg-teal-50 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span>Open Simulator</span>
            <span aria-hidden="true" className="material-icons-outlined text-base">arrow_forward</span>
          </Link>
        </div>
        
        {/* Individual Service Offerings & Baselines */}
        <div>
          <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">Individual Service Breakdown</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-4">Baseline Market Rates &amp; Individual Deliverables</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2">Transparent cost baselines regulated by professional bodies and Lagos physical planning standards.</p>
          </div>

          {SERVICE_CATEGORIES.map((category) => (
            <div key={category.title} className="mb-14 sm:mb-20">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span aria-hidden="true" className="material-icons-outlined text-2xl">{category.icon}</span>
                </span>
                <span>{category.title}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {category.services.map((service) => (
                  <div key={service.name} className="bg-white dark:bg-[#161F30] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all h-full">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-md inline-block mb-3">
                        {service.tag}
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h4>
                      <p className="text-lg sm:text-xl font-extrabold text-primary mb-3">{service.price}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{service.desc}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3">
                      <a
                        href={getWhatsAppQuoteLink(service.name, service.price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 sm:py-2 rounded-xl font-bold text-xs shadow-sm transition-all min-h-11 sm:min-h-10"
                      >
                        <svg aria-hidden="true" focusable="false" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
                        </svg>
                        <span>WhatsApp Quote</span>
                      </a>
                      <Link
                        to="/onboarding"
                        className="text-primary hover:text-primary-dark text-xs font-bold inline-flex items-center gap-1 py-2.5 sm:py-2 min-h-11 sm:min-h-10"
                        title="Add to project roadmap"
                      >
                        <span>Plan project</span>
                        <span aria-hidden="true" className="material-icons-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
