import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getWhatsAppQuoteLink, WHATSAPP_DISPLAY, CONTACT_EMAIL } from '../constants';
import { useDialogA11y } from './useDialogA11y';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';
  const isDarkNav = isHomePage && !isScrolled;

  // Scroll listener for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const mobileMenuRef = useDialogA11y({
    open: isMobileMenuOpen,
    onClose: () => setIsMobileMenuOpen(false),
    lockScroll: false,
  });

  const navLinks = [
    { 
      name: 'Home',
      shortName: 'Home',
      path: '/', 
      icon: 'home',
      desc: 'Overview & Lagos permit hub'
    },
    { 
      name: 'Services', 
      shortName: 'Services',
      path: '/services', 
      icon: 'home_repair_service',
      desc: 'Architectural, structural & approvals'
    },
    { 
      name: 'Checklist & Simulator', 
      shortName: 'Checklist',
      path: '/checklist', 
      icon: 'calculate',
      desc: 'EPPES statutory fee & doc calculator',
      badge: 'Interactive'
    },
    { 
      name: 'Process', 
      shortName: 'Process',
      path: '/process', 
      icon: 'timeline',
      desc: '5-step LASPPPA approval workflow'
    },
    { 
      name: 'About', 
      shortName: 'About',
      path: '/about', 
      icon: 'verified_user',
      desc: 'Certified ARCON & COREN team'
    },
  ];

  return (
    <>
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
        className="skip-link bg-primary text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg"
      >
        Skip to main content
      </a>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHomePage
            ? isScrolled
              ? 'bg-accent-dark/95 backdrop-blur-xl border-b border-gray-800/80 shadow-lg py-2 sm:py-2.5'
              : 'bg-accent-dark/85 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-b border-white/10 sm:border-transparent py-2.5 sm:py-3.5'
            : isScrolled
              ? 'bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 shadow-md py-2 sm:py-2.5'
              : 'bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 py-2.5 sm:py-3'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-3 xl:gap-6 min-h-[44px] sm:min-h-[48px] w-full">
            
            {/* ================================================================= */}
            {/* 1. BRAND LOGO & STATUS BADGE (LEFT)                               */}
            {/* ================================================================= */}
            <Link 
              to="/" 
              className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl min-h-[44px]"
              aria-label="PermitFlow Lagos Home"
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-br from-teal-500 via-primary to-emerald-700 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 group-hover:shadow-primary/30 transition-all duration-200">
                  <span aria-hidden="true" className="material-icons-outlined text-lg sm:text-xl xl:text-2xl text-white select-none">apartment</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-xs">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></span>
                </div>
              </div>

              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className={`font-extrabold text-base sm:text-lg xl:text-2xl tracking-tight leading-none ${
                    isDarkNav || (isHomePage && isScrolled) 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Permit<span className={isHomePage ? 'text-teal-400' : 'text-teal-700 dark:text-teal-400'}>Flow</span>
                  </span>
                  <span className={`text-[11px] font-black uppercase px-1.5 py-0.5 rounded-md border hidden sm:inline-flex items-center tracking-wider leading-none ${
                    isHomePage
                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                      : 'bg-teal-700/10 text-teal-800 border-teal-700/30 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30'
                  }`}>
                    LAGOS
                  </span>
                </div>
                <span className={`text-[11px] font-medium tracking-wide leading-none mt-1 hidden 2xl:block ${
                  isDarkNav || (isHomePage && isScrolled) 
                    ? 'text-gray-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  LASPPPA &amp; LASBCA Permit Hub
                </span>
              </div>
            </Link>

            {/* ================================================================= */}
            {/* 2. DESKTOP CENTER NAVIGATION CAPSULE BAR (CENTER)                 */}
            {/* ================================================================= */}
            <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center">
              <div className={`flex items-center justify-center min-w-0 w-full p-0.5 xl:p-1 rounded-2xl border transition-all duration-200 ${
                isDarkNav || (isHomePage && isScrolled)
                  ? 'bg-white/[0.07] border-white/10 backdrop-blur-md shadow-inner'
                  : 'bg-gray-100/90 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 shadow-xs'
              }`}>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path || (link.path === '/checklist' && location.pathname === '/simulator');
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`h-10 px-1.5 lg:px-2 xl:px-3 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-1 xl:gap-1.5 whitespace-nowrap relative group shrink min-w-0 ${
                        isActive
                          ? isDarkNav || (isHomePage && isScrolled)
                            ? 'bg-white/20 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-gray-900 text-primary dark:text-teal-300 shadow-sm font-bold border border-gray-200/40 dark:border-gray-700/40'
                          : isDarkNav || (isHomePage && isScrolled)
                            ? 'text-gray-300 hover:text-white hover:bg-white/10'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <span aria-hidden="true" className={`material-icons-outlined text-base xl:text-lg leading-none transition-transform group-hover:scale-110 shrink-0 ${
                        isActive 
                          ? (isDarkNav || isHomePage ? 'text-teal-400' : 'text-primary dark:text-teal-400') 
                          : 'text-gray-600 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200'
                      }`}>
                        {link.icon}
                      </span>
                      
                      {/* Responsive link label (compact on lg, full on xl+) */}
                      <span className="hidden xl:inline leading-none min-w-0 truncate">{link.name}</span>
                      <span className="xl:hidden leading-none min-w-0 truncate">{link.shortName}</span>

                      {/* Interactive Badge (Simulator) */}
                      {link.badge && (
                        <span className="hidden 2xl:inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 leading-none">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* ================================================================= */}
            {/* 3. HEADER ACTIONS (RIGHT: HOTLINE + PRIMARY CTA + MOBILE TRIGGER) */}
            {/* ================================================================= */}
            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 shrink-0">
              
              {/* WhatsApp Fast-Track Hotline Button (Adaptive across MD, LG, XL, 2XL) */}
              <a
                href={getWhatsAppQuoteLink(undefined, undefined, "Hello PermitFlow Support! I need fast-track assistance with a Lagos building permit.")}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden md:inline-flex items-center justify-center gap-1.5 h-11 xl:h-10 px-2.5 xl:px-3.5 rounded-xl text-xs font-bold transition-all duration-200 border whitespace-nowrap shadow-xs shrink-0 ${
                  isDarkNav || (isHomePage && isScrolled)
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60'
                }`}
                title="Instant WhatsApp Hotline with Lagos Permit Officer"
                aria-label="Chat on WhatsApp with a Lagos permit officer"
              >
                <svg aria-hidden="true" focusable="false" className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
                </svg>
                <span className="hidden md:inline lg:hidden leading-none">Hotline</span>
              </a>

              {/* Contextual Action Button */}
              {location.pathname.startsWith('/onboarding') ? (
                <div className="flex items-center shrink-0">
                  <Link 
                    to="/" 
                    className={`h-11 lg:h-10 inline-flex items-center justify-center text-xs font-bold px-3 xl:px-3.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      isDarkNav 
                        ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Save &amp; Exit
                  </Link>
                </div>
              ) : (
                <Link 
                  id="nav-btn-get-started"
                  to="/onboarding" 
                  className="h-11 lg:h-10 inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-gradient-to-r from-primary to-teal-600 hover:from-primary-dark hover:to-teal-700 text-white px-2.5 sm:px-3.5 xl:px-4.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 group"
                >
                  <span className="hidden xs:inline leading-none">Start Permit</span>
                  <span className="xs:hidden leading-none">Start</span>
                  <span aria-hidden="true" className="material-icons-outlined text-sm group-hover:translate-x-0.5 transition-transform leading-none shrink-0">arrow_forward</span>
                </Link>
              )}

              {/* Mobile / Tablet Hamburger Menu Toggle Button */}
              <button
                id="btn-mobile-nav-toggle"
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden w-11 h-11 inline-flex items-center justify-center rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary shrink-0 ${
                  isDarkNav || (isHomePage && isScrolled)
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                <span aria-hidden="true" className="material-icons-outlined text-lg sm:text-xl block leading-none">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MOBILE & TABLET FULL-SCREEN NAVIGATION DRAWER                       */}
      {/* =================================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Menu Panel */}
          <div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            tabIndex={-1}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-[#0B1120] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-right"
          >
            
            {/* Top Drawer Header */}
            <div>
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-primary flex items-center justify-center text-white shadow-sm">
                    <span aria-hidden="true" className="material-icons-outlined text-xl">apartment</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white leading-none">
                      Permit<span className="text-teal-700 dark:text-teal-400">Flow</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Lagos Permit Portal</div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <span aria-hidden="true" className="material-icons-outlined text-xl block">close</span>
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="p-4 space-y-1.5">
                <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Navigation Menu
                </div>

                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path || (link.path === '/checklist' && location.pathname === '/simulator');
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 border border-primary/20 font-bold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        <span aria-hidden="true" className="material-icons-outlined text-lg">{link.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold tracking-tight">{link.name}</span>
                          {link.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-800 dark:text-teal-300">
                              {link.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 font-normal">
                          {link.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Menu Drawer CTAs */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-gray-900/40">
              <Link
                to="/onboarding"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-teal-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary/20"
              >
                <span aria-hidden="true" className="material-icons-outlined text-base">add_circle</span>
                <span>Start New Permit Application</span>
              </Link>

              <a
                href={getWhatsAppQuoteLink(undefined, undefined, "Hello PermitFlow! I would like to consult a Lagos permit liaison officer via WhatsApp.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                <svg aria-hidden="true" focusable="false" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
                </svg>
                <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
              </a>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
                  <span aria-hidden="true" className="material-icons-outlined text-xs text-primary">verified</span>
                  <span>Registered ARCON &amp; COREN Consultants</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-accent-dark border-t border-gray-800 py-16 text-gray-400 font-sans">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-primary rounded-xl flex items-center justify-center text-white shadow-sm">
              <span aria-hidden="true" className="material-icons-outlined text-xl">apartment</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Permit<span className="text-teal-400">Flow</span></span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Expert building permit consulting and architectural design services to bring your Lagos construction projects from concept to statutory approval seamlessly.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-teal-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All 20 Lagos LGAs &amp; 37 LCDAs</span>
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Platform Directory</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">Home</Link></li>
            <li><Link to="/services" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">Permit &amp; Drawing Services</Link></li>
            <li><Link to="/checklist" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors text-teal-300 font-medium">Checklist &amp; Simulator</Link></li>
            <li><Link to="/process" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">LASPPPA 5-Stage Process</Link></li>
            <li><Link to="/about" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">About Our Engineers</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Regulatory Approvals</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/services" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">LASPPPA Planning Permits</Link></li>
            <li><Link to="/services" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">ARCON Stamped Architectural Sets</Link></li>
            <li><Link to="/services" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">COREN Structural Engineering Calcs</Link></li>
            <li><Link to="/services" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">Geotechnical Soil Investigation</Link></li>
            <li><Link to="/services" className="inline-block min-w-11 py-3 hover:text-teal-300 transition-colors">Lagos Fire Service Clearances</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <a 
                href={getWhatsAppQuoteLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <span aria-hidden="true" className="material-icons-outlined text-emerald-400 text-base">chat</span>
                <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
              </a>
            </li>
            <li className="flex items-center gap-3 min-w-0">
              <span aria-hidden="true" className="material-icons-outlined text-teal-400 text-base shrink-0">email</span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-block py-3 hover:text-teal-300 transition-colors break-all min-w-0"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
        <p>© 2025 PermitFlow Lagos. Certified by ARCON, COREN, and TOPREC consultants.</p>
        <div className="flex gap-6">
          <Link to="/about" className="inline-block py-3.5 hover:text-white transition-colors">Compliance Guarantee</Link>
        </div>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col relative bg-[#FAFAFA] dark:bg-[#0B1120]">
    <Navbar />
    <main id="main-content" tabIndex={-1} className="flex-grow outline-none">{children}</main>
    <Footer />
    
    {/* Floating WhatsApp Button */}
    <a 
      href={getWhatsAppQuoteLink()}
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[60] bg-[#25D366] text-[#0B1120] p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      title="Chat with us on WhatsApp for an instant permit quote"
      aria-label="Chat with PermitFlow on WhatsApp"
    >
      <svg aria-hidden="true" focusable="false" className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.284l-.549 2.008 2.056-.539c.952.518 1.968.891 3.236.891 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.33 8.163c-.145.41-.735.753-1.014.808-.28.054-.52.074-.787.074-.267 0-.573-.013-1.027-.187-2.28-.865-3.706-3.136-3.82-3.284-.113-.147-.933-1.24-.933-2.366 0-1.127.587-1.68.793-1.907.207-.227.453-.284.6-.284.147 0 .294.002.42.008.133.007.313-.05.487.367.18.434.613 1.493.667 1.6.053.107.087.234.013.38-.073.147-.113.24-.227.374-.113.133-.24.294-.34.394-.113.113-.227.24-.093.467.133.227.593.98 1.273 1.587.873.78 1.607 1.027 1.833 1.14.227.113.36-.093.493-.24.133-.147.573-.667.726-.893.153-.227.307-.187.52-.107s1.353.64 1.587.753c.233.113.387.167.44.26s.053.647-.093 1.057zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 group-hover:ml-2.5 text-xs sm:text-sm font-bold whitespace-nowrap">Chat on WhatsApp for Quote</span>
    </a>
  </div>
);
