import { Link, NavLink } from "react-router-dom";
import { logout } from "./logout";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navLinkClasses = "flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-amber-50 hover:text-blue-700 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md transform hover:scale-[1.02]";
  const activeLinkClasses = "bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg shadow-blue-500/25 border-blue-400 transform scale-[1.02]";

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle scroll for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen bg-gradient-to-b from-white via-blue-50 to-amber-50 shadow-2xl flex flex-col p-4 sticky top-0 border-r border-blue-200 transition-all duration-500 ease-in-out overflow-hidden group`}>
      
      {/* Header de la sidebar */}
      <div className="flex items-center mb-8 pb-6 border-b border-blue-200 relative">
        <div className="p-2">
          <img src="logo.png" alt="Logo" className="h-8 w-8" />
        </div>
        <div className={`${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300 ml-3`}>
          <h6 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-amber-500 bg-clip-text text-transparent">
            Nouaceur Wings<span className="text-amber-500">Tech</span>
          </h6>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-700 to-blue-400 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Main Navigation */}
        <div className={`${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300 mb-4`}>
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/50 rounded-lg">
            Navigation
          </p>
        </div>

        <NavLink 
          to="/studentlist" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                  <span className="text-lg">🎯</span>
                </div>
                <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
                  Entretien
                </span>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/students" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                  <span className="text-lg">👥</span>
                </div>
                <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
                  Gestion Étudiants
                </span>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/top" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                  <span className="text-lg">🏆</span>
                </div>
                <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
                  Top Étudiants
                </span>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/attende" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                  <span className="text-lg">⏳</span>
                </div>
                <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
                  Étudiants en Attente
                </span>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              )}
            </>
          )}
        </NavLink>

        {/* Quick Scroll Links */}
        <div className={`${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300 mt-6 mb-4`}>
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/50 rounded-lg">
            Navigation Rapide
          </p>
        </div>

        {/* Scroll Links */}
        <button
          onClick={() => scrollToSection('dashboard')}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md transform hover:scale-[1.02] ${
            activeSection === 'dashboard' 
              ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg shadow-blue-500/25 border-blue-400 transform scale-[1.02]' 
              : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-amber-50 hover:text-blue-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              activeSection === 'dashboard' ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <span className="text-lg">📊</span>
            </div>
            <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
              Tableau de Bord
            </span>
          </div>
          {activeSection === 'dashboard' && (
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
          )}
        </button>

        <button
          onClick={() => scrollToSection('statistics')}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md transform hover:scale-[1.02] ${
            activeSection === 'statistics' 
              ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg shadow-blue-500/25 border-blue-400 transform scale-[1.02]' 
              : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-amber-50 hover:text-blue-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              activeSection === 'statistics' ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <span className="text-lg">📈</span>
            </div>
            <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
              Statistiques
            </span>
          </div>
          {activeSection === 'statistics' && (
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
          )}
        </button>

        <button
          onClick={() => scrollToSection('reports')}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md transform hover:scale-[1.02] ${
            activeSection === 'reports' 
              ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg shadow-blue-500/25 border-blue-400 transform scale-[1.02]' 
              : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-amber-50 hover:text-blue-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              activeSection === 'reports' ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <span className="text-lg">📋</span>
            </div>
            <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
              Rapports
            </span>
          </div>
          {activeSection === 'reports' && (
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
          )}
        </button>

        {/* Additional Navigation Links */}
        <div className={`${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300 mt-6 mb-4`}>
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/50 rounded-lg">
            Gestion
          </p>
        </div>

        {[
          { to: "/personel", icon: "❓", label: "Questions Personnelles" },
          { to: "/technique", icon: "⚙️", label: "Questions Techniques" },
          { to: "/filiere", icon: "🎓", label: "Gestion de Filiere" },
          { to: "/section", icon: "📚", label: "Gestion de Section" },
          { to: "/EnrollStudent", icon: "➕", label: "Enroll Student" },
          { to: "/absence", icon: "📅", label: "Absence" },
          { to: "/document", icon: "📄", label: "Document" },
          { to: "/section/student", icon: "👨‍🎓", label: "Sections Students" },
          { to: "/absences/list", icon: "📝", label: "Liste Absence" }
        ].map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => 
              `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <span className={`font-medium ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bouton Logout */}
      <div className="mt-auto pt-6 border-t border-blue-200">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-3.5 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 font-semibold border border-red-300 hover:border-red-400 hover:shadow-lg hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/20 group"
        >
          <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className={`${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}>
            Déconnexion
          </span>
        </button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #f59e0b);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #d97706);
        }
      `}</style>
    </div>
  );
}