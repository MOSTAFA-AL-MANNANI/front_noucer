import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function Personel() {
  const [personels, setPersonels] = useState([]);
  const [form, setForm] = useState({ question: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/personels");
      setPersonels(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) return;

    try {
      setSubmitLoading(true);
      if (editId) {
        await api.put(`/personels/${editId}`, form);
        setEditId(null);
      } else {
        await api.post("/personels", form);
      }
      setForm({ question: "" });
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      try {
        await api.delete(`/personels/${id}`);
        fetchData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleEdit = (p) => {
    setForm({ question: p.question });
    setEditId(p.id);
    // Scroll vers le formulaire
    document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ question: "" });
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
                  Questions Personnelles
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Gérez les questions d'évaluation du personnel
                </p>
              </div>

              {/* Indicateur de Comptage */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {personels.length}
                  </div>
                  <div className="text-amber-200 text-sm font-medium">
                    Questions totales
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
                    {editId ? "Modifier la Question" : "Ajouter une Nouvelle Question"}
                  </h3>
                  <p className="text-gray-600">
                    {editId ? "Modifiez la question personnelle" : "Remplissez le champ pour créer une nouvelle question"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                {/* Question Personnelle */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Question Personnelle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Saisissez une question personnelle..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={form.question}
                    onChange={(e) => setForm({ question: e.target.value })}
                    required
                  />
                </div>
                
                {/* Boutons d'action */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={!form.question.trim() || submitLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                  >
                    {submitLoading ? (
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
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3"
                    >
                      <span>✕</span>
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Liste des Questions Personnelles */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Liste des Questions
                    </h2>
                    <p className="text-blue-100">
                      {personels.length} question{personels.length !== 1 ? 's' : ''} personnelle{personels.length !== 1 ? 's' : ''}
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
            ) : personels.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Aucune question pour le moment</h3>
                <p className="text-gray-500 text-lg mb-4">
                  Commencez par ajouter votre première question personnelle
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {personels.map((personel, index) => (
                    <div
                      key={personel.id}
                      className="bg-gray-50/50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {personel.question}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                                ID: {personel.id}
                              </span>
                              <span className="text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-lg">
                                Personnelle
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(personel)}
                          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>✏️</span>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(personel.id)}
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
            {personels.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-8 py-4 border-t border-gray-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 font-semibold">
                    Total: {personels.length} question{personels.length !== 1 ? 's' : ''} personnelle{personels.length !== 1 ? 's' : ''}
                  </p>
                  <div className="text-sm text-gray-500">
                    {personels.length} élément{personels.length !== 1 ? 's' : ''} affiché{personels.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}