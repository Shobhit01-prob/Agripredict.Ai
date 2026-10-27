import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ExternalLink, ShieldCheck, Database, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200/90 bg-warm-white text-stone-700 transition-colors dark:border-stone-800 dark:bg-walnut-dark dark:text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Brand & Overview */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-warm-white shadow-xs">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold text-walnut dark:text-cream">
                AgriPredict <span className="text-sage">AI</span>
              </span>
            </Link>
            <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Machine learning for sustainable agricultural decision making. Yield forecasting, 
              farm input optimization, and historical climate analytics grounded in official 
              FAOSTAT records and NASA POWER agroclimatology.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <ShieldCheck className="h-4 w-4 text-sage" />
              <span>Grounded in verified scientific records. Zero invented statistics.</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-walnut dark:text-cream">
              Platform
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-sm">
              <li>
                <Link to="/predict" className="hover:text-sage transition-colors">Predict yield</Link>
              </li>
              <li>
                <Link to="/optimize" className="hover:text-sage transition-colors">Scenario optimizer</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-sage transition-colors">Macro analytics</Link>
              </li>
              <li>
                <Link to="/crops" className="hover:text-sage transition-colors">Crop explorer</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-sage transition-colors">Saved history</Link>
              </li>
            </ul>
          </div>

          {/* Data & Science */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-walnut dark:text-cream">
              Data and science
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-sm">
              <li>
                <Link to="/data-model" className="hover:text-sage transition-colors">Data and model center</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sage transition-colors">Methodology and limits</Link>
              </li>
              <li>
                <a 
                  href="/docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-sage transition-colors"
                >
                  <span>OpenAPI specification</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Data Attributions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-walnut dark:text-cream">
              Attribution
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs text-stone-500 dark:text-stone-400">
              <li>
                <span className="font-medium text-stone-700 dark:text-stone-300">FAOSTAT QCL</span>
                <p className="mt-0.5">UN Food & Agriculture Organization Open Data (CC-BY-4.0)</p>
              </li>
              <li>
                <span className="font-medium text-stone-700 dark:text-stone-300">NASA POWER</span>
                <p className="mt-0.5">Prediction Of Worldwide Energy Resources (CC0)</p>
              </li>
              <li>
                <span className="font-medium text-stone-700 dark:text-stone-300">ISRIC SoilGrids</span>
                <p className="mt-0.5">Global automated soil information</p>
              </li>
            </ul>
          </div>

        </div>

        {/* Responsible Use Banner & Copyright */}
        <div className="mt-10 border-t border-stone-200 pt-6 dark:border-stone-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-stone-500 dark:text-stone-400">
            <p className="max-w-2xl leading-relaxed">
              <span className="font-semibold text-walnut dark:text-cream">Responsible-use note: </span>
              Yield forecasts and optimization scenarios are mathematical model estimates based on 
              historical statistical datasets. They are decision-support tools and should never substitute 
              certified on-site soil testing, local agronomic extension guidelines, or micro-climate advisories.
            </p>
            <p className="shrink-0">
              © {new Date().getFullYear()} AgriPredict AI. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
