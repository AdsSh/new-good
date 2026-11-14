
import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl sm:text-9xl font-extrabold text-primary/20 dark:text-primary/10 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2"
          >
            <span aria-hidden="true" className="material-icons-outlined text-sm">home</span>
            Back to Home
          </Link>
          <Link
            to="/onboarding"
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all inline-flex items-center justify-center gap-2"
          >
            <span aria-hidden="true" className="material-icons-outlined text-sm">assignment</span>
            Start an Application
          </Link>
        </div>
      </div>
    </div>
  );
};
