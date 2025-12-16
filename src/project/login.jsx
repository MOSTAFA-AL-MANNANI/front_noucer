import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faArrowRight, 
  faSignInAlt, 
  faQuestionCircle,
  faSpinner,
  faShieldAlt,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fonction d'alerte avec SweetAlert2
  const showAlert = (message, type = "error") => {
    Swal.fire({
      title: type === "error" ? "Erreur" : 
             type === "success" ? "Succès" : 
             "Information",
      text: message,
      icon: type,
      timer: 4000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!email || !password) {
      showAlert("Veuillez remplir tous les champs", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });
      
      localStorage.setItem("token", res.data.token);
      
      // Message de bienvenue avec SweetAlert2
      await Swal.fire({
        title: "Connexion réussie !",
        text: `Bienvenue ${email}`,
        icon: "success",
        confirmButtonText: "Accéder au tableau de bord",
        confirmButtonColor: "#10B981",
        timer: 3000,
        showConfirmButton: true
      });
      
      navigate("/studentlist");
      
    } catch (err) {
      console.error("Erreur de connexion:", err);
      
      let errorMessage = "Email ou mot de passe incorrect. Veuillez réessayer.";
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Identifiants incorrects. Vérifiez votre email et mot de passe.";
            break;
          case 422:
            errorMessage = "Données de connexion invalides. Vérifiez le format de vos informations.";
            break;
          case 500:
            errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
            break;
          case 404:
            errorMessage = "Service de connexion indisponible. Contactez l'administrateur.";
            break;
          default:
            errorMessage = "Erreur de connexion. Veuillez réessayer.";
        }
      } else if (err.request) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: "Mot de passe oublié ?",
      text: "Veuillez contacter l'administrateur pour réinitialiser votre mot de passe.",
      icon: "info",
      confirmButtonText: "Compris",
      confirmButtonColor: "#3B82F6"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full translate-x-1/2 translate-y-1/2 opacity-20 blur-xl"></div>
      
      <div className="w-full max-w-md z-10">
        {/* Carte principale avec effet de profondeur */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500 hover:shadow-3xl border border-white/20">
          {/* Header avec dégradé amélioré */}
          <div className="bg-gradient-to-br from-amber-400 via-blue-400 to-blue-800 text-white p-8 text-center relative overflow-hidden">
            {/* Effet de brillance */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="mx-auto bg-white/10 rounded-2xl h-20 w-20 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                <div className="bg-gradient-to-br from-amber-400 to-amber-300 rounded-xl p-2 shadow-lg">
                  <FontAwesomeIcon icon={faGraduationCap} className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <div className="rounded-full p-2 mr-3">
                  <img src="logo.png" alt="Logo" className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">
                  Nouaceur Wings<span className="text-amber-400 drop-shadow-sm">Tech</span>
                </h1>
              </div>
              
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                Connexion
              </h2>
              <p className="text-blue-200/90 font-medium">Accédez à votre tableau de bord</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-8 bg-gradient-to-b from-white to-blue-50/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champ Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 mr-2 text-blue-600" />
                  Adresse Email
                </label>
                <div className="relative rounded-lg shadow-sm transition-all duration-300 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                  <FontAwesomeIcon icon={faLock} className="h-4 w-4 mr-2 text-blue-600" />
                  Mot de passe
                </label>
                <div className="relative rounded-lg shadow-sm transition-all duration-300 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600 transition-colors duration-200"
                  >
                    <FontAwesomeIcon 
                      icon={showPassword ? faEyeSlash : faEye} 
                      className="h-5 w-5" 
                    />
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3 h-5 w-5 text-white" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                    <span>Se connecter</span>
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Lien d'aide */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200/50">
              <button 
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 inline-flex items-center"
              >
                <FontAwesomeIcon icon={faQuestionCircle} className="h-4 w-4 mr-2" />
                Mot de passe oublié ?
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 font-medium">
            © {new Date().getFullYear()} Nouaceur Wings
            <span className="text-amber-500">Tech</span>. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}