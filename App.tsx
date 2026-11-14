import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './views/Landing';
import { Process } from './views/Process';
import { Services } from './views/Services';
import { About } from './views/About';
import { NotFound } from './views/NotFound';

const Onboarding = lazy(() => import('./views/Onboarding').then((m) => ({ default: m.Onboarding })));
const ChecklistSimulator = lazy(() =>
  import('./views/ChecklistSimulator').then((m) => ({ default: m.ChecklistSimulator })),
);
const RouteLoading: React.FC = () => (
  <div role="status" className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-primary animate-pulse" />
      <span className="text-xs font-bold text-gray-500 tracking-wide">Loading…</span>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/process" element={<Process />} />
              <Route path="/services" element={<Services />} />
              <Route path="/checklist" element={<ChecklistSimulator />} />
              <Route path="/simulator" element={<ChecklistSimulator />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
};

export default App;