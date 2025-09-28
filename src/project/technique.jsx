import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function Technique() {
  const [techniques, setTechniques] = useState([]);
  const [form, setForm] = useState({ question: "" });
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    const res = await api.get("/techniques");
    setTechniques(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/techniques/${editId}`, form);
      setEditId(null);
    } else {
      await api.post("/techniques", form);
    }
    setForm({ question: "" });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question technique ?")) {
      await api.delete(`/techniques/${id}`);
      fetchData();
    }
  };

  const handleEdit = (t) => {
    setForm({ question: t.question });
    setEditId(t.id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ question: "" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - 3 colonnes */}
      <div className="w-3/12">
        <Sidebar />
      </div>
      
      {/* Contenu principal - 9 colonnes */}
      <div className="w-9/12 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">⚙️</span>
            <h2 className="text-3xl font-bold text-blue-600">
              Gestion Technique
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Gérez les questions techniques du système
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Question Technique
              </label>
              <input
                type="text"
                placeholder="Saisissez une question technique..."
                value={form.question}
                onChange={(e) => setForm({ question: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200"
              />
            </div>
            <div className="flex space-x-3">
              <button 
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                {editId ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter
                  </>
                )}
              </button>
              
              {editId && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Techniques List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* List Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-white">
                Liste des Questions Techniques ({techniques.length})
              </h3>
            </div>
          </div>

          {/* Techniques Grid */}
          <div className="p-6">
            {techniques.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {techniques.map((t) => (
                  <div key={t.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-amber-400 bg-amber-50 px-2 py-1 rounded">
                        ID: {t.id}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          title="Modifier"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          title="Supprimer"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-3">{t.question}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xl font-medium text-gray-600 mb-2">Aucune question technique</p>
                  <p className="text-gray-500">Commencez par ajouter une question technique</p>
                </div>
              </div>
            )}
          </div>

          {/* List Footer */}
          {techniques.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-gray-600 font-medium">
                Total: {techniques.length} question(s) technique(s)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}