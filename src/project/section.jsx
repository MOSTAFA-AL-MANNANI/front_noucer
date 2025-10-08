import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

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

  // Récupérer toutes les sections
  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sections");
      setSections(res.data.data || res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des sections:", err);
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
    }
  };

  useEffect(() => {
    fetchSections();
    fetchFilieres();
  }, []);

  // Ajouter ou modifier une section
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setEditId(null);
      } else {
        await api.post("/sections", data);
      }
      resetForm();
      fetchSections();
    } catch (err) {
      console.error("Erreur lors de l'opération:", err);
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
  const handleCancel = () => {
    setEditId(null);
    resetForm();
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
  };

  // Supprimer une section
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette section ?")) {
      try {
        await api.delete(`/sections/${id}`);
        fetchSections();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Erreur lors de la suppression. La section est peut-être utilisée.");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-amber-400 bg-clip-text text-transparent mb-2">
                Gestion des Sections
              </h1>
              <p className="text-gray-600">Organisez et gérez les sections académiques</p>
            </div>

            {/* Formulaire */}
            <div id="form-section" className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className={`w-3 h-6 rounded-full mr-3 ${editId ? 'bg-amber-400' : 'bg-blue-600'}`}></span>
                {editId ? "Modifier la section" : "Créer une nouvelle section"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Filière */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filière <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Section A, Groupe 1..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Capacité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacité
                    </label>
                    <input
                      type="number"
                      placeholder="Nombre d'étudiants"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      min={1}
                      max={100}
                    />
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="scheduled">Planifiée</option>
                      <option value="active">Active</option>
                      <option value="finished">Terminée</option>
                    </select>
                  </div>

                  {/* Date de début */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Date de fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-amber-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <span>{editId ? "Mettre à jour" : "Créer la section"}</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editId ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {editId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transform hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Barre de recherche et statistiques */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher une section ou filière..."
                    className="w-full p-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-700 font-semibold">
                    {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} trouvée{filteredSections.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Liste des sections */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-3 h-6 bg-amber-400 rounded-full mr-3"></span>
                  Liste des sections
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
                </div>
              ) : filteredSections.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                  </svg>
                  <p className="text-gray-500 text-lg">Aucune section trouvée</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm ? "Essayez de modifier vos critères de recherche" : "Commencez par créer une nouvelle section"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-amber-400 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Filière</th>
                        <th className="px-6 py-4 text-left font-semibold">Section</th>
                        <th className="px-6 py-4 text-left font-semibold">Capacité</th>
                        <th className="px-6 py-4 text-left font-semibold">Période</th>
                        <th className="px-6 py-4 text-left font-semibold">Statut</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSections.map((section, index) => (
                        <tr 
                          key={section.id} 
                          className="hover:bg-blue-50 transition-colors duration-200 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {section.filiere?.nom || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                              {section.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="font-semibold text-gray-700">{section.capacity}</span>
                              <span className="text-sm text-gray-500 ml-1">étudiants</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              <div>Début: {new Date(section.start_date).toLocaleDateString()}</div>
                              {section.end_date && (
                                <div>Fin: {new Date(section.end_date).toLocaleDateString()}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(section.status)}`}>
                              {getStatusLabel(section.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(section)}
                                className="bg-amber-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(section.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}