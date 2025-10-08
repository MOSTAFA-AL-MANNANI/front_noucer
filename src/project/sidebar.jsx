import { Link, NavLink } from "react-router-dom";
import { logout } from "./logout";

export default function Sidebar() {
  const navLinkClasses = "flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-100";
  const activeLinkClasses = "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200 border-blue-300";

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-white to-blue-50 shadow-xl flex flex-col p-6 sticky top-0 border-r border-blue-100">
      {/* Header de la sidebar */}
      <div className="flex items-center mb-10 pb-6 border-b border-blue-200">
        <div className="p-3">
          <img src="logo.png" alt="Logo" className="h-10 w-10 " />
        </div>
        <h6 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-amber-400 bg-clip-text text-transparent">
          Nouaceur Wings<span className="text-amber-400">Tech</span>
        </h6>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavLink 
          to="/studentlist" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Entretien</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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
              <span className="font-medium">Gestion Étudiants</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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
              <span className="font-medium">Top Étudiants</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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
              <span className="font-medium">Étudiants en Attente</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/personel" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Questions Personnelles</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/technique" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Questions Techniques</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink 
          to="/filiere" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Gestion de Filiere</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink 
          to="/section" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Gestion de Section</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

          <NavLink 
          to="/EnrollStudent" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">EnrollStudent</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink 
          to="/absence" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Abscense</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

                <NavLink 
          to="/document" 
          className={({ isActive }) => 
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="font-medium">Document</span>
              {isActive && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

      </nav>

      {/* Bouton Logout */}
      <div className="mt-auto pt-6 border-t border-blue-200">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-3.5 text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all duration-300 font-semibold border border-red-100 hover:border-red-200 hover:shadow-lg hover:scale-[1.02] active:scale-95"
        >
          <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Déconnexion
        </button>
      </div>
    </div>
  );
}