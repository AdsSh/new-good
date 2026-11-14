
import React from 'react';

const PROJECTS = [
  {
    title: 'Skyline Heights Luxury Condos',
    location: 'San Francisco, CA',
    desc: 'Full permit expediting for a 12-story luxury condominium complex. Navigated complex zoning variances and impact reports.',
    tag: 'Residential',
    type: 'New Construction',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'TechHub Innovation Center',
    location: 'Austin, TX',
    desc: 'Comprehensive code compliance review and permit management for a 50,000 sq ft high-tech office renovation.',
    tag: 'Commercial',
    type: 'Renovation',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Urban Fork Bistro',
    location: 'New York, NY',
    desc: 'Change of use permit acquisition for a historic retail space converting to a full-service restaurant.',
    tag: 'Hospitality',
    type: 'Change of Use',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
  }
];

export const Portfolio: React.FC = () => (
  <div className="pt-32 pb-24">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Our Work Speaks for Itself</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">Explore our portfolio of successful projects, from residential renovations to large-scale commercial developments.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {PROJECTS.map((proj, i) => (
          <div key={i} className="group bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            <div className="relative h-64 overflow-hidden">
              <img src={proj.img} alt={proj.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{proj.tag}</div>
            </div>
            <div className="p-10 flex-1 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{proj.title}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-2"><span className="material-icons-outlined text-sm">location_on</span> {proj.location}</p>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed flex-1">{proj.desc}</p>
              <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">{proj.type}</span>
                <a href="#" className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">Case Study <span className="material-icons-outlined text-sm">arrow_forward</span></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
