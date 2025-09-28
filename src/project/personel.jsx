import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function Personel() {
  const [personels, setPersonels] = useState([]);
  const [form, setForm] = useState({ question: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ question: "" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>
      
      {/* Main Content - col-9 */}
      <div className="w-9/12 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
              Gestion des Questions Personnelles
            </h2>
            <p className="text-gray-600 mt-2 ml-5">
              Gérez les questions d'évaluation du personnel
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Formulaire */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-white flex items-center">
                {editId ? "✏️ Modifier la Question" : "➕ Ajouter une Question"}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Saisir une question personnelle..."
                    value={form.question}
                    onChange={(e) => setForm({ question: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                  <button 
                    type="submit"
                    disabled={!form.question.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2 min-w-fit"
                  >
                    <span>{editId ? "💾" : "➕"}</span>
                    <span>{editId ? "Modifier" : "Ajouter"}</span>
                  </button>
                  {editId && (
                    <button 
                      type="button"
                      onClick={cancelEdit}
                      className="bg-amber-400 hover:bg-amber-500 text-gray-800 font-medium px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2 min-w-fit"
                    >
                      <span>❌</span>
                      <span>Annuler</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Liste des personnels */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                📋 Liste des Questions Personnelles
                <span className="ml-3 bg-white text-amber-600 text-sm px-2 py-1 rounded-full">
                  {personels.length} question(s)
                </span>
              </h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Chargement...</span>
                </div>
              ) : personels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium text-lg mb-2">Aucune question pour le moment</p>
                  <p className="text-gray-500">Ajoutez votre première question ci-dessus</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {personels.map((p, index) => (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 font-medium">{p.question}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                        >
                          <span>✏️</span>
                          <span className="hidden sm:inline">Modifier</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                        >
                          <span>🗑️</span>
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}