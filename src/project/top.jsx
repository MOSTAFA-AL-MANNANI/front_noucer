import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function Top12() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingTop, setLoadingTop] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchTop12 = async () => {
    setLoadingTop(true);
    try {
      const res = await api.get("/students/top12");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du chargement des top12");
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/students/${id}/detail`);
      setSelected(res.data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du chargement du détail");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      const res = await api.post("/students/update-status");
      setMessage(res.data.message);
      fetchTop12(); // إعادة جلب top12 بعد التحديث
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la mise à jour du status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      setUpdating(true);
      await api.put(`/students/${studentId}/status`, { status });
      setMessage("Statut mis à jour avec succès");
      fetchTop12();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  useEffect(() => {
    fetchTop12();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "passed": return "bg-green-100 text-green-800";
      case "in_interview": return "bg-amber-100 text-amber-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "passed": return "Accepté";
      case "in_interview": return "En Entretien";
      case "rejected": return "Refusé";
      default: return "En attente";
    }
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
            <span className="text-3xl mr-3">🏆</span>
            <h2 className="text-3xl font-bold text-blue-600">
              Les 12 meilleurs étudiants
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Liste des 12 meilleurs étudiants en fonction des résultats
          </p>
        </div>

        {/* Update Status Button */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Mise à jour des statuts</h3>
                <p className="text-gray-500">Mettre à jour le statut de tous les étudiants</p>
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="flex items-center px-6 py-3 bg-amber-400 text-white font-medium rounded-lg hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Mettre à jour le status
                  </>
                )}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded-lg ${message.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-white">
                Liste des étudiants les plus performants ({students.length})
              </h3>
            </div>
          </div>

          {loadingTop ? (
            <div className="py-12">
              <div className="flex flex-col items-center justify-center">
                <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 text-lg">⏳ Chargement des top12...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiere</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-amber-400 text-white' : 'bg-blue-100 text-blue-600'} font-bold`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {s.students.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {s.students.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {s.students.cin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {s.students.filiere}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                          {s.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => fetchDetail(s.students.id_stu)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {students.length === 0 && (
                <div className="py-12">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-medium text-gray-600 mb-2">Aucun étudiant ne correspond à votre recherche.</p>
                    <p className="text-gray-500">Essayez de modifier vos termes de recherche ou de vérifier les données.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Student Details Modal */}
        {selected && showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-white">
                      📌 Détails de l'étudiant
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Prénom:</label>
                      <p className="text-lg font-semibold text-gray-900">{selected.nom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nom:</label>
                      <p className="text-lg font-semibold text-gray-900">{selected.prenom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">CIN:</label>
                      <p className="text-lg font-semibold text-gray-900">{selected.cin}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Filiere:</label>
                      <p className="text-lg font-semibold text-gray-900">{selected.filiere}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status:</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selected.status)}`}>
                        {getStatusText(selected.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section des résultats */}
                {selected.resultat && selected.resultat.length > 0 && (
                  <div className="mb-8">
                    <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                      <span className="text-2xl mr-2">📊</span>
                      Résultats Académiques
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-blue-600 mb-1">Score Pratique</label>
                        <p className="text-2xl font-bold text-blue-600">{selected.resultat[0].scoreP}</p>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-amber-600 mb-1">Score Théorique</label>
                        <p className="text-2xl font-bold text-amber-600">{selected.resultat[0].scoreT}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-green-600 mb-1">Score Soft Skills</label>
                        <p className="text-2xl font-bold text-green-600">{selected.resultat[0].scoreS}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-purple-600 mb-1">Total</label>
                        <p className="text-2xl font-bold text-purple-600">{selected.resultat[0].total}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section de modification du statut */}
                <div>
                  <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                    <span className="text-2xl mr-2">⚙️</span>
                    Modifier le Statut
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleStatusChange(selected.id_stu, "passed")}
                      disabled={updating}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50"
                    >
                      <span className="mr-2">✅</span>
                      Accepté
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id_stu, "in_interview")}
                      disabled={updating}
                      className="flex items-center px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200 disabled:opacity-50"
                    >
                      <span className="mr-2">🕑</span>
                      En Entretien
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id_stu, "rejected")}
                      disabled={updating}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 disabled:opacity-50"
                    >
                      <span className="mr-2">❌</span>
                      Refusé
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}