import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function FiliereCRUD() {
  const [filieres, setFilieres] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Récupérer les filières
  const fetchFilieres = async () => {
    setLoading(true);
    try {
      const res = await api.get("/filieres");
      setFilieres(res.data.data || res.data);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilieres();
  }, []);

  // Ajouter ou modifier une filière
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/filieres/${editId}`, { name, description });
        setEditId(null);
      } else {
        await api.post("/ajouter-filiere", { name, description });
      }
      setName("");
      setDescription("");
      fetchFilieres();
    } catch (err) {
      console.error("Erreur lors de l'opération:", err);
    } finally {
      setLoading(false);
    }
  };

  // Préparer la modification
  const handleEdit = (filiere) => {
    setName(filiere.name);
    setDescription(filiere.description || "");
    setEditId(filiere.id);
    // Scroll vers le formulaire
    document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });
  };

  // Annuler l'édition
  const handleCancel = () => {
    setEditId(null);
    setName("");
    setDescription("");
  };

  // Supprimer une filière
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette filière ?")) {
      try {
        await api.delete(`/filieres/${id}`);
        fetchFilieres();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Erreur lors de la suppression. La filière est peut-être utilisée.");
      }
    }
  };

  // Filtrer les filières
  const filteredFilieres = filieres.filter(filiere =>
    filiere.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (filiere.description && filiere.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  Gestion des Filières
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Ajouter, modifier et supprimer des filières académiques
                </p>
              </div>

              {/* Indicateur de Comptage */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {filieres.length}
                  </div>
                  <div className="text-amber-200 text-sm font-medium">
                    Filières totales
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
                  <span className="text-xl text-blue-600">
                    {editId ? "✏️" : "➕"}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {editId ? "Modifier la Filière" : "Créer une Nouvelle Filière"}
                  </h3>
                  <p className="text-gray-600">
                    {editId ? "Modifiez les informations de la filière" : "Remplissez les informations pour créer une nouvelle filière"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom de la filière <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Informatique, Mathématiques..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Description de la filière..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>{editId ? "💾 Mettre à jour" : "➕ Créer la filière"}</span>
                    </>
                  )}
                </button>
                
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3"
                  >
                    <span>✕</span>
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
                    <span className="text-xl text-amber-600">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Recherche et Filtrage
                    </h3>
                    <p className="text-gray-600">
                      Trouvez rapidement les filières que vous cherchez
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold">{filteredFilieres.length}</div>
                  <div className="text-amber-100 text-sm font-medium">
                    Filière{filteredFilieres.length !== 1 ? 's' : ''} trouvée{filteredFilieres.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une filière..."
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-12 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                  >
                    <span className="text-gray-400 hover:text-gray-600 text-lg">✕</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des Filières */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Liste des Filières
                    </h2>
                    <p className="text-blue-100">
                      {filieres.length} filière{filieres.length !== 1 ? 's' : ''} au total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium text-lg">Chargement des filières...</p>
                </div>
              </div>
            ) : filteredFilieres.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Aucune filière trouvée</h3>
                <p className="text-gray-500 text-lg mb-4">
                  {searchTerm ? "Aucun résultat pour votre recherche" : "Commencez par créer une nouvelle filière"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 transform"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredFilieres.map((filiere, index) => (
                    <div
                      key={filiere.id}
                      className="bg-gray-50/50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300">
                            {filiere.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {filiere.name}
                            </h3>
                            <p className="text-gray-600 mt-2 line-clamp-2">
                              {filiere.description || "Aucune description fournie"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(filiere)}
                          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>✏️</span>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(filiere.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
}