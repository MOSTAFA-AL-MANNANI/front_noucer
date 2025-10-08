import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function FiliereCRUD() {
  const [filieres, setFilieres] = useState([]);
  const [name, setname] = useState("");
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
      setname("");
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
    setname(filiere.name);
    setDescription(filiere.description || "");
    setEditId(filiere.id);
    // Scroll vers le formulaire
    document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });
  };

  // Annuler l'édition
  const handleCancel = () => {
    setEditId(null);
    setname("");
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
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent mb-2">
                Gestion des Filières
              </h1>
              <p className="text-gray-600">Ajouter, modifier et supprimer des filières académiques</p>
            </div>

            {/* Formulaire */}
            <div id="form-section" className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className={`w-3 h-6 rounded-full mr-3 ${editId ? 'bg-amber-400' : 'bg-blue-600'}`}></span>
                {editId ? "Modifier la filière" : "Ajouter une nouvelle filière"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      name de la filière <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Informatique, Mathématiques..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Description de la filière..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                        <span>{editId ? "Mettre à jour" : "Ajouter la filière"}</span>
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

            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-blue-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une filière..."
                  className="w-full p-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Liste des filières */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-3 h-6 bg-amber-400 rounded-full mr-3"></span>
                  Liste des filières ({filteredFilieres.length})
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredFilieres.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                  </svg>
                  <p className="text-gray-500 text-lg">Aucune filière trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-amber-400 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">name</th>
                        <th className="px-6 py-4 text-left font-semibold">Description</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredFilieres.map((filiere, index) => (
                        <tr 
                          key={filiere.id} 
                          className="hover:bg-blue-50 transition-colors duration-200 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {filiere.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 max-w-md">
                              {filiere.description || "Aucune description"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(filiere)}
                                className="bg-amber-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(filiere.id)}
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