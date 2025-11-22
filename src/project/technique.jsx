import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function Technique() {
  const [techniques, setTechniques] = useState([]);
  const [filteredTechniques, setFilteredTechniques] = useState([]);
  const [form, setForm] = useState({ question: "", filiere: "" });
  const [editId, setEditId] = useState(null);
  const [selectedFiliere, setSelectedFiliere] = useState("toutes");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/techniques");
      setTechniques(res.data);
      setFilteredTechniques(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer les questions selon la filière sélectionnée
  useEffect(() => {
    if (selectedFiliere === "toutes") {
      setFilteredTechniques(techniques);
    } else {
      const filtered = techniques.filter(t => t.filiere === selectedFiliere);
      setFilteredTechniques(filtered);
    }
  }, [selectedFiliere, techniques]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/techniques/${editId}`, form);
        setEditId(null);
      } else {
        await api.post("/techniques", form);
      }
      setForm({ question: "", filiere: "" });
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question technique ?")) {
      setLoading(true);
      try {
        await api.delete(`/techniques/${id}`);
        fetchData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (t) => {
    setForm({ 
      question: t.question, 
      filiere: t.filiere || ""
    });
    setEditId(t.id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ question: "", filiere: "" });
  };

  // Obtenir la couleur de la filière
  const getFiliereColor = (filiere) => {
    switch (filiere) {
      case "Développement web": return "from-blue-500 to-blue-600";
      case "Marketing digital": return "from-amber-500 to-amber-600";
      case "Création de contenu": return "from-purple-500 to-purple-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

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
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  Gestion Technique
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Gérez les questions techniques du système
                </p>
              </div>

              {/* Indicateur de Comptage */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {techniques.length}
                  </div>
                  <div className="text-amber-200 text-sm font-medium">
                    Questions totales
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de Création/Modification */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <span className="text-xl text-blue-600">
                    {editId ? "✏️" : "➕"}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {editId ? "Modifier la Question" : "Ajouter une Nouvelle Question"}
                  </h3>
                  <p className="text-gray-600">
                    {editId ? "Modifiez les informations de la question technique" : "Remplissez les informations pour créer une nouvelle question"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Question Technique */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Question Technique <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Saisissez une question technique..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    required
                  />
                </div>
                
                {/* Filière */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Filière <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={form.filiere} 
                    onChange={(e) => setForm({ ...form, filiere: e.target.value })} 
                    required
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                  >
                    <option value="">Sélectionner une filière</option>
                    <option value="Développement web">Développement web</option>
                    <option value="Marketing digital">Marketing digital</option>
                    <option value="Création de contenu">Création de contenu</option>
                  </select>
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
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>{editId ? "💾 Mettre à jour" : "➕ Ajouter la question"}</span>
                    </>
                  )}
                </button>
                
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3"
                  >
                    <span>✕</span>
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Barre de Recherche et Filtrage */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-amber-50/50 p-8 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <span className="text-xl text-amber-600">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Filtrage des Questions
                    </h3>
                    <p className="text-gray-600">
                      Filtrez les questions techniques par filière
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold">{filteredTechniques.length}</div>
                  <div className="text-amber-100 text-sm font-medium">
                    Question{filteredTechniques.length !== 1 ? 's' : ''} trouvée{filteredTechniques.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Filtrer par filière
                  </label>
                  <select
                    value={selectedFiliere}
                    onChange={(e) => setSelectedFiliere(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                  >
                    <option value="toutes">Toutes les filières</option>
                    <option value="Développement web">Développement web</option>
                    <option value="Marketing digital">Marketing digital</option>
                    <option value="Création de contenu">Création de contenu</option>
                  </select>
                </div>

                {/* Indicateur de Filtre Actif */}
                {selectedFiliere !== "toutes" && (
                  <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div>
                      <span className="text-sm font-semibold text-blue-800">
                        Filtre actif: 
                      </span>
                      <span className="ml-2 text-blue-600 font-bold">
                        {selectedFiliere}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFiliere("toutes")}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <span>✕</span>
                      Effacer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Liste des Questions Techniques */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Liste des Questions Techniques
                    </h2>
                    <p className="text-blue-100">
                      {techniques.length} question{techniques.length !== 1 ? 's' : ''} au total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium text-lg">Chargement des questions...</p>
                </div>
              </div>
            ) : filteredTechniques.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  {selectedFiliere !== "toutes" 
                    ? `Aucune question pour "${selectedFiliere}"`
                    : "Aucune question technique"
                  }
                </h3>
                <p className="text-gray-500 text-lg mb-4">
                  {selectedFiliere !== "toutes" 
                    ? "Essayez de changer de filière ou ajoutez une nouvelle question"
                    : "Commencez par ajouter une question technique"
                  }
                </p>
                {selectedFiliere !== "toutes" && (
                  <button
                    onClick={() => setSelectedFiliere("toutes")}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 transform"
                  >
                    Voir toutes les questions
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredTechniques.map((technique, index) => (
                    <div
                      key={technique.id}
                      className="bg-gray-50/50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-r ${getFiliereColor(technique.filiere)} rounded-full flex items-center justify-center font-semibold text-white group-hover:scale-110 transition-transform duration-300`}>
                            {technique.filiere?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {technique.question}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                                ID: {technique.id}
                              </span>
                              <span className={`text-sm font-semibold px-3 py-1 rounded-full text-white bg-gradient-to-r ${getFiliereColor(technique.filiere)}`}>
                                {technique.filiere || "Non spécifiée"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(technique)}
                          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>✏️</span>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(technique.id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>🗑️</span>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pied de Liste */}
            {filteredTechniques.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-8 py-4 border-t border-gray-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 font-semibold">
                    {selectedFiliere === "toutes" 
                      ? `Total: ${filteredTechniques.length} question${filteredTechniques.length !== 1 ? 's' : ''} technique${filteredTechniques.length !== 1 ? 's' : ''}`
                      : `Filière ${selectedFiliere}: ${filteredTechniques.length} question${filteredTechniques.length !== 1 ? 's' : ''} technique${filteredTechniques.length !== 1 ? 's' : ''}`
                    }
                  </p>
                  {selectedFiliere !== "toutes" && (
                    <button
                      onClick={() => setSelectedFiliere("toutes")}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 flex items-center gap-2"
                    >
                      <span>↶</span>
                      Voir toutes les questions
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}