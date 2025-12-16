import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faSpinner,
  faTimes,
  faSearch,
  faFilter,
  faUsers,
  faCalendarAlt,
  faChartBar,
  faUniversity,
  faChalkboardTeacher,
  faIdCard,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faList,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

export default function SectionCRUD() {
  const [sections, setSections] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [filiereId, setFiliereId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction pour afficher les alertes SweetAlert2
  const showAlert = (title, text, type = "success") => {
    Swal.fire({
      title,
      text,
      icon: type,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  };

  // Récupérer toutes les sections
  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sections");
      setSections(res.data.data || res.data);
      
      Swal.fire({
        title: 'Chargement réussi',
        text: `${res.data.data?.length || res.data.length} section(s) chargée(s)`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (err) {
      console.error("Erreur lors du chargement des sections:", err);
      showAlert("Erreur", "Erreur lors du chargement des sections", "error");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer toutes les filières pour le select
  const fetchFilieres = async () => {
    try {
      const res = await api.get("/filieres");
      setFilieres(res.data.data || res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des filières:", err);
      showAlert("Erreur", "Erreur lors du chargement des filières", "error");
    }
  };

  useEffect(() => {
    fetchSections();
    fetchFilieres();
  }, []);

  // Ajouter ou modifier une section
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!filiereId || !name || !startDate) {
      showAlert("Champs requis", "Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    setLoading(true);
    const data = { 
      filiere_id: filiereId, 
      name, 
      capacity, 
      start_date: startDate, 
      end_date: endDate, 
      status 
    };
    
    try {
      if (editId) {
        await api.put(`/sections/${editId}`, data);
        
        Swal.fire({
          title: 'Modification réussie !',
          text: `La section "${name}" a été modifiée avec succès`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        
        setEditId(null);
      } else {
        await api.post("/sections", data);
        
        Swal.fire({
          title: 'Création réussie !',
          text: `La section "${name}" a été créée avec succès`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      }
      resetForm();
      fetchSections();
    } catch (err) {
      console.error("Erreur lors de l'opération:", err);
      showAlert("Erreur", "Erreur lors de l'opération sur la section", "error");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFiliereId("");
    setName("");
    setCapacity(30);
    setStartDate("");
    setEndDate("");
    setStatus("scheduled");
  };

  // Annuler l'édition
  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Annuler la modification',
      text: 'Voulez-vous vraiment annuler les modifications ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Continuer'
    });

    if (result.isConfirmed) {
      setEditId(null);
      resetForm();
      
      Swal.fire({
        title: 'Modification annulée',
        text: 'Les modifications ont été annulées',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    }
  };

  // Préparer la modification
  const handleEdit = (section) => {
    setFiliereId(section.filiere_id);
    setName(section.name);
    setCapacity(section.capacity);
    setStartDate(section.start_date);
    setEndDate(section.end_date || "");
    setStatus(section.status);
    setEditId(section.id);
    
    // Scroll vers le formulaire
    document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });
    
    Swal.fire({
      title: 'Modification',
      text: `Vous modifiez la section "${section.name}"`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  };

  // Supprimer une section
  const handleDelete = async (id) => {
    const section = sections.find(s => s.id === id);
    
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      html: `Êtes-vous sûr de vouloir supprimer la section <strong>"${section.name}"</strong> ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/sections/${id}`);
        
        Swal.fire({
          title: 'Supprimé !',
          text: `La section "${section.name}" a été supprimée`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        
        fetchSections();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        showAlert("Erreur", "Erreur lors de la suppression. La section est peut-être utilisée.", "error");
      }
    }
  };

  // Obtenir la classe de statut
  const getStatusClass = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "finished": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case "active": return "Active";
      case "finished": return "Terminée";
      default: return "Planifiée";
    }
  };

  // Filtrer les sections
  const filteredSections = sections.filter(section =>
    section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.filiere?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>

      {/* Main Content - col-9 */}
      <div className="w-9/12 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header avec Sélecteur */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/25 border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                  <FontAwesomeIcon icon={faChalkboardTeacher} />
                  Gestion des Sections
                </h1>
                <p className="text-blue-100 text-lg font-medium flex items-center gap-2">
                  <FontAwesomeIcon icon={faUniversity} />
                  Organisez et gérez les sections académiques
                </p>
              </div>

              {/* Indicateur de Comptage */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faList} />
                    {sections.length}
                  </div>
                  <div className="text-amber-200 text-sm font-medium">
                    Sections totales
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de Création/Modification */}
          <div id="form-section" className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FontAwesomeIcon 
                    icon={editId ? faEdit : faPlus} 
                    className="text-xl text-blue-600" 
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {editId ? "Modifier la Section" : "Créer une Nouvelle Section"}
                  </h3>
                  <p className="text-gray-600">
                    {editId ? "Modifiez les informations de la section" : "Remplissez les informations pour créer une nouvelle section"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Filière */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    Filière <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={filiereId}
                    onChange={(e) => setFiliereId(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    {filieres.map(filiere => (
                      <option key={filiere.id} value={filiere.id}>
                        {filiere.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nom de la section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBook} />
                    Nom de la section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Section A, Groupe 1..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Capacité */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} />
                    Capacité
                  </label>
                  <input
                    type="number"
                    placeholder="Nombre d'étudiants"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min={1}
                    max={100}
                  />
                </div>

                {/* Statut */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartBar} />
                    Statut
                  </label>
                  <select
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="scheduled">Planifiée</option>
                    <option value="active">Active</option>
                    <option value="finished">Terminée</option>
                  </select>
                </div>

                {/* Date de début */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                {/* Date de fin */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex gap-4 pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={editId ? faSave : faPlus} />
                      <span>{editId ? "Mettre à jour" : "Créer la section"}</span>
                    </>
                  )}
                </button>
                
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Barre de Recherche et Statistiques */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-amber-50/50 p-8 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <FontAwesomeIcon icon={faSearch} className="text-xl text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Recherche et Filtrage
                    </h3>
                    <p className="text-gray-600">
                      Trouvez rapidement les sections que vous cherchez
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faFilter} />
                    {filteredSections.length}
                  </div>
                  <div className="text-amber-100 text-sm font-medium">
                    Section{filteredSections.length !== 1 ? 's' : ''} trouvée{filteredSections.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une section ou filière..."
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-12 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-gray-600 text-lg" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des Sections */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FontAwesomeIcon icon={faBook} className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Liste des Sections
                    </h2>
                    <p className="text-blue-100 flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartBar} />
                      {sections.length} section{sections.length !== 1 ? 's' : ''} au total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Chargement des sections...
                  </p>
                </div>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Aucune section trouvée</h3>
                <p className="text-gray-500 text-lg mb-4">
                  {searchTerm ? "Aucun résultat pour votre recherche" : "Commencez par créer une nouvelle section"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 transform flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredSections.map((section, index) => (
                    <div
                      key={section.id}
                      className="bg-gray-50/50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300">
                            <FontAwesomeIcon icon={faBook} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {section.name}
                            </h3>
                            <p className="text-gray-600 font-medium flex items-center gap-2">
                              <FontAwesomeIcon icon={faGraduationCap} />
                              {section.filiere?.nom || "Filière non spécifiée"}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-2">
                                <FontAwesomeIcon icon={faUsers} />
                                {section.capacity} places
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClass(section.status)}`}>
                                {getStatusLabel(section.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Période */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                          <div>
                            <span className="text-gray-500 font-medium">Début:</span>
                            <span className="ml-2 text-gray-800 font-medium">
                              {new Date(section.start_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        {section.end_date && (
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                            <div>
                              <span className="text-gray-500 font-medium">Fin:</span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {new Date(section.end_date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(section)}
                          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}