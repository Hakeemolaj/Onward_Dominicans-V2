
import React, { useState } from 'react';
import { NavLink as NavLinkType } from '../types';
import { SectionId } from '../constants'; // APP_NAME_PART1, APP_NAME_PART2 removed as not used

interface NavBarProps {
  navLinks: NavLinkType[];
  onNavLinkClick: (sectionId: SectionId) => void;
  activeSection: SectionId;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ navLinks, onNavLinkClick, activeSection, searchTerm, onSearchChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (sectionId: SectionId) => {
    onNavLinkClick(sectionId);
    setMobileMenuOpen(false); 
  };

  return (
    <nav className="bg-slate-800 dark:bg-slate-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-yellow-400 focus:outline-none p-2"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex flex-grow items-center justify-center space-x-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50
                  ${activeSection === link.id 
                    ? 'text-yellow-400 dark:text-yellow-300' 
                    : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-yellow-400 hover:bg-slate-700 dark:hover:bg-slate-700'
                  }
                `}
                aria-current={activeSection === link.id ? 'page' : undefined}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-yellow-400 dark:bg-yellow-300 rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>
           
           {/* Search Input on Desktop */}
           <div className="hidden md:flex items-center">
             <input 
                type="search" 
                placeholder="Search articles..." 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-slate-700 dark:bg-slate-600 text-white dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500 px-3 py-1.5 rounded-md focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 focus:outline-none" 
                aria-label="Search articles"
              />
           </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden`}>
        <div className="bg-slate-800 dark:bg-slate-900 border-t border-slate-700 dark:border-slate-700 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {/* Search Input in Mobile Menu */}
          <div className="px-1 py-2">
            <input 
              type="search" 
              placeholder="Search articles..." 
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              className="w-full bg-slate-700 dark:bg-slate-600 text-white dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded-md focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 focus:outline-none"
              aria-label="Search articles"
            />
          </div>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-150
                ${activeSection === link.id 
                  ? 'bg-yellow-500 dark:bg-yellow-400 text-slate-900 dark:text-slate-900' 
                  : 'text-gray-300 dark:text-gray-400 hover:bg-slate-700 dark:hover:bg-slate-700 hover:text-white dark:hover:text-yellow-400'
                }
              `}
              aria-current={activeSection === link.id ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;