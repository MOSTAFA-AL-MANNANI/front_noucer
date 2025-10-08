import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function Top12() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingTop, setLoadingTop] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);

  const fetchTop12 = async (filiere = "all") => {
    setLoadingTop(true);
    try {
      const endpoint = filiere === "all" 
        ? "/students/top30" 
        : `/students/top30/${filiere}`;
      const res = await api.get(endpoint);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du chargement des données");
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
      fetchTop12(selectedFiliere);
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
      fetchTop12(selectedFiliere);
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

  const handleFiliereChange = (filiere) => {
    setSelectedFiliere(filiere);
    fetchTop12(filiere);
  };

  // Export to Excel function
  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const dataToExport = students.map(student => ({
        "Position": students.indexOf(student) + 1,
        "Nom": student.students.nom,
        "Prénom": student.students.prenom,
        "CIN": student.students.cin,
        "Filière": student.students.filiere,
        "Score Pratique": student.scoreP || 0,
        "Score Théorique": student.scoreT || 0,
        "Score Soft Skills": student.scoreS || 0,
        "Total": student.total,
        "Statut": getStatusText(student.students.status)
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      
      const filiereName = selectedFiliere === "all" 
        ? "Toutes_Filieres" 
        : selectedFiliere.replace(/\s+/g, '_');
      
      XLSX.utils.book_append_sheet(workbook, worksheet, `Top30_${filiereName}`);
      
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `top30_${filiereName}_${date}.xlsx`);
      
      setMessage(`Fichier Excel exporté avec ${dataToExport.length} étudiant(s)`);
    } catch (error) {
      console.error("Erreur export:", error);
      setMessage("Erreur lors de l'exportation Excel");
    } finally {
      setExportLoading(false);
    }
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

  const getFiliereColor = (filiere) => {
    switch (filiere) {
      case "Développement web": return "from-purple-500 to-purple-600";
      case "Marketing digital": return "from-pink-500 to-pink-600";
      case "Création de contenu": return "from-indigo-500 to-indigo-600";
      default: return "from-blue-500 to-blue-600";
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
              Les 30 meilleurs étudiants
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Liste des 30 meilleurs étudiants par filière en fonction des résultats
          </p>
        </div>

        {/* Filiere Selection Cards */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              📊 Filtrer par Filière
            </h3>
            
            {/* Cards Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div 
                onClick={() => handleFiliereChange("all")}
                className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 ${
                  selectedFiliere === "all" ? "ring-4 ring-blue-300 ring-opacity-70" : ""
                }`}
              >
                <div className="text-2xl font-bold">
                  {selectedFiliere === "all" ? students.length : "Tous"}
                </div>
                <div className="text-sm opacity-90 flex items-center justify-center">
                  Toutes les filières
                  {selectedFiliere === "all" && <span className="ml-2">✓</span>}
                </div>
              </div>
              
              <div 
                onClick={() => handleFiliereChange("Développement web")}
                className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 ${
                  selectedFiliere === "Développement web" ? "ring-4 ring-purple-300 ring-opacity-70" : ""
                }`}
              >
                <div className="text-2xl font-bold">30</div>
                <div className="text-sm opacity-90 flex items-center justify-center">
                  Développement Web
                  {selectedFiliere === "Développement web" && <span className="ml-2">✓</span>}
                </div>
              </div>
              
              <div 
                onClick={() => handleFiliereChange("Marketing digital")}
                className={`bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 ${
                  selectedFiliere === "Marketing digital" ? "ring-4 ring-pink-300 ring-opacity-70" : ""
                }`}
              >
                <div className="text-2xl font-bold">30</div>
                <div className="text-sm opacity-90 flex items-center justify-center">
                  Marketing Digital
                  {selectedFiliere === "Marketing digital" && <span className="ml-2">✓</span>}
                </div>
              </div>
              
              <div 
                onClick={() => handleFiliereChange("Création de contenu")}
                className={`bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 ${
                  selectedFiliere === "Création de contenu" ? "ring-4 ring-indigo-300 ring-opacity-70" : ""
                }`}
              >
                <div className="text-2xl font-bold">30</div>
                <div className="text-sm opacity-90 flex items-center justify-center">
                  Création Contenu
                  {selectedFiliere === "Création de contenu" && <span className="ml-2">✓</span>}
                </div>
              </div>
            </div>

            {/* Dropdown Selection */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedFiliere}
                onChange={(e) => handleFiliereChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64"
              >
                <option value="all">Toutes les filières</option>
                <option value="Développement web">Développement web</option>
                <option value="Marketing digital">Marketing digital</option>
                <option value="Création de contenu">Création de contenu</option>
              </select>

              {/* Export Button */}
              <button
                onClick={exportToExcel}
                disabled={exportLoading || students.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors shadow-md"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Export...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📊</span>
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Update Status Button */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Mise à jour des statuts</h3>
                <p className="text-gray-500">
                  Mettre à jour le statut de tous les étudiants {selectedFiliere !== "all" && `de la filière ${selectedFiliere}`}
                </p>
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
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes("Erreur") ? "bg-red-100 text-red-700" : 
                message.includes("exporté") ? "bg-green-100 text-green-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-semibold text-white">
                  {selectedFiliere === "all" 
                    ? `Les 30 meilleurs étudiants toutes filières (${students.length})`
                    : `Les 30 meilleurs étudiants - ${selectedFiliere} (${students.length})`
                  }
                </h3>
              </div>
              {selectedFiliere !== "all" && (
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-white">
                  Filière: {selectedFiliere}
                </span>
              )}
            </div>
          </div>

          {loadingTop ? (
            <div className="py-12">
              <div className="flex flex-col items-center justify-center">
                <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 text-lg">
                  ⏳ Chargement des top30 {selectedFiliere !== "all" && `pour ${selectedFiliere}`}...
                </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index < 3 ? 'bg-amber-400 text-white' : 
                              index < 10 ? 'bg-blue-100 text-blue-600' : 
                              'bg-gray-100 text-gray-600'
                            } font-bold`}>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(s.students.status)}`}>
                            {getStatusText(s.students.status)}
                          </span>
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
                    <p className="text-xl font-medium text-gray-600 mb-2">
                      Aucun étudiant trouvé {selectedFiliere !== "all" && `pour la filière ${selectedFiliere}`}.
                    </p>
                    <p className="text-gray-500">
                      {selectedFiliere !== "all" 
                        ? "Essayez de sélectionner une autre filière ou vérifiez les données."
                        : "Aucun étudiant ne correspond à votre recherche."
                      }
                    </p>
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