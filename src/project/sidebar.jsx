import { Link, NavLink } from "react-router-dom";
import { logout } from "./logout";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faTrophy,
  faClock,
  faQuestionCircle,
  faCog,
  faGraduationCap,
  faBook,
  faUserPlus,
  faCalendarAlt,
  faFileAlt,
  faUserGraduate,
  faClipboardList,
  faFileExcel,
  faSignOutAlt,
  faHome,
  faCogs,
  faListAlt,
  faUserClock,
  faChartBar,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("");

  const navLinkClasses = "flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-amber-50 hover:text-blue-700 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md transform hover:scale-[1.02]";
  const activeLinkClasses = "bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg shadow-blue-500/25 border-blue-400 transform scale-[1.02]";

  // Fonction de déconnexion avec SweetAlert2
  const handleLogout = () => {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler',
      background: '#ffffff',
      color: '#333333'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          title: 'Déconnecté !',
          text: 'Vous avez été déconnecté avec succès',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

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
    <div className="w-72 h-screen bg-gradient-to-b from-white via-blue-50 to-amber-50 shadow-2xl flex flex-col p-4 sticky top-0 border-r border-blue-200 transition-all duration-500 ease-in-out overflow-hidden">
      
      {/* Header de la sidebar */}
      <div className="flex items-center mb-8 pb-6 border-b border-blue-200 relative">
        <div className="p-2">
          <img src="logo.png" alt="Logo" className="h-8 w-8" />
        </div>
        <div className="transition-all duration-300 ml-3">
          <h6 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-amber-500 bg-clip-text text-transparent">
            Nouaceur Wings<span className="text-amber-500">Tech</span>
          </h6>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Main Navigation */}
        <div className="transition-all duration-300 mb-4">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/50 rounded-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faHome} className="text-gray-400" />
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
                  <FontAwesomeIcon 
                    icon={faClipboardList} 
                    className={`text-lg ${isActive ? 'text-white' : 'text-blue-600'}`} 
                  />
                </div>
                <span className="font-medium transition-all duration-300">
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
                  <FontAwesomeIcon 
                    icon={faUsers} 
                    className={`text-lg ${isActive ? 'text-white' : 'text-blue-600'}`} 
                  />
                </div>
                <span className="font-medium transition-all duration-300">
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
                  <FontAwesomeIcon 
                    icon={faTrophy} 
                    className={`text-lg ${isActive ? 'text-white' : 'text-blue-600'}`} 
                  />
                </div>
                <span className="font-medium transition-all duration-300">
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
                  <FontAwesomeIcon 
                    icon={faUserClock} 
                    className={`text-lg ${isActive ? 'text-white' : 'text-blue-600'}`} 
                  />
                </div>
                <span className="font-medium transition-all duration-300">
                  Étudiants en Attente
                </span>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              )}
            </>
          )}
        </NavLink>

        {/* Additional Navigation Links */}
        <div className="transition-all duration-300 mt-6 mb-4">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/50 rounded-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faCogs} className="text-gray-400" />
            Gestion
          </p>
        </div>

        {[
          { to: "/personel", icon: faQuestionCircle, label: "Questions Personnelles" },
          { to: "/technique", icon: faCog, label: "Questions Techniques" },
          { to: "/filiere", icon: faGraduationCap, label: "Gestion de Filière" },
          { to: "/section", icon: faBook, label: "Gestion de Section" },
          { to: "/EnrollStudent", icon: faUserPlus, label: "Inscrire Étudiant" },
          { to: "/absence", icon: faCalendarAlt, label: "Absences" },
          { to: "/document", icon: faFileAlt, label: "Documents" },
          { to: "/section/student", icon: faUserGraduate, label: "Étudiants par Section" },
          { to: "/absences/list", icon: faListAlt, label: "Liste des Absences" },
          { to: "/student/execl", icon: faFileExcel, label: "Import Excel" }
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
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className={`text-lg ${isActive ? 'text-white' : 'text-blue-600'}`} 
                    />
                  </div>
                  <span className="font-medium transition-all duration-300">
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
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3.5 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 font-semibold border border-red-300 hover:border-red-400 hover:shadow-lg hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/20 group"
        >
          <FontAwesomeIcon 
            icon={faSignOutAlt} 
            className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:translate-x-1" 
          />
          <span className="transition-all duration-300">
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