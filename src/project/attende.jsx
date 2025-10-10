import React, { useEffect, useState, useMemo } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function WaitingStudents() {
  const [students, setStudents] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [activeFiliere, setActiveFiliere] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);

  const showAlert = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const fetchFilieres = async () => {
    try {
      const res = await api.get("/students/filiere/en");
      setFilieres(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWaiting = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students/waiting/en");
      const allStudents = [];
      Object.keys(res.data).forEach(filiere => {
        res.data[filiere].forEach(student => {
          allStudents.push({ ...student, filiere });
        });
      });
      setStudents(allStudents);
      showAlert(`${allStudents.length} étudiant(s) chargé(s)`, "success");
    } catch (err) {
      console.error(err);
      showAlert("Erreur lors du chargement des étudiants", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilieres();
    fetchWaiting();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/students/status/en/${id}`, { status: newStatus });
      showAlert("Statut mis à jour avec succès", "success");
      fetchWaiting();
      if (selected && selected.id_stu === id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur lors de la mise à jour du statut", "error");
    } finally {
      setUpdating(false);
    }
  };

  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const dataToExport = filteredStudents.map(student => ({
        "Nom": student.nom,
        "Prénom": student.prenom,
        "CIN": student.cin,
        "Filière": student.filiere,
        "Statut": student.status,
        "Score Pratique": student.resultat?.scoreP ?? "N/A",
        "Score Théorique": student.resultat?.scoreT ?? "N/A",
        "Score Soft Skills": student.resultat?.scoreS ?? "N/A",
        "Total": student.resultat?.total ?? "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Étudiants en Attente");
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `etudiants_attente_${date}.xlsx`);
      showAlert(`Fichier Excel exporté (${dataToExport.length} étudiants)`, "success");
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors de l'export Excel", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => activeFiliere === "all" || student.filiere === activeFiliere)
      .filter(student => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        switch (searchField) {
          case "nom": return student.nom.toLowerCase().includes(term);
          case "prenom": return student.prenom.toLowerCase().includes(term);
          case "cin": return student.cin.toLowerCase().includes(term);
          case "filiere": return student.filiere.toLowerCase().includes(term);
          default:
            return (
              student.nom.toLowerCase().includes(term) ||
              student.prenom.toLowerCase().includes(term) ||
              student.cin.toLowerCase().includes(term) ||
              student.filiere.toLowerCase().includes(term)
            );
        }
      });
  }, [students, searchTerm, searchField, activeFiliere]);

  const getStatusColor = (status) => {
    switch (status) {
      case "passed": return "bg-green-100 text-green-800 border-green-200";
      case "in_interview": return "bg-amber-100 text-amber-800 border-amber-200";
      case "registred": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  📋
                </div>
                Étudiants en Attente
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Gérez les candidatures en attente de décision
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {filteredStudents.length} étudiant(s)
              </span>
            </div>
          </div>
        </div>

        {/* Filières Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveFiliere("all")}
              className={`px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                activeFiliere === "all" 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              👥 Tous
            </button>
            {filieres.map(f => (
              <button
                key={f}
                onClick={() => setActiveFiliere(f)}
                className={`px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  activeFiliere === f
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Export Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <select 
                value={searchField} 
                onChange={e => setSearchField(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 bg-white"
              >
                <option value="all">🔍 Tous les champs</option>
                <option value="nom">👤 Nom</option>
                <option value="prenom">👤 Prénom</option>
                <option value="cin">🆔 CIN</option>
                <option value="filiere">🎓 Filière</option>
              </select>
              
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder={`Rechercher par ${searchField === 'all' ? 'tous les champs' : searchField}`}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 flex-1 bg-white"
              />
            </div>
            
            <button 
              onClick={exportToExcel} 
              disabled={exportLoading || filteredStudents.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              {exportLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Export...
                </>
              ) : (
                <>
                  📊 Export Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 animate-pulse">Chargement des étudiants...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        CIN
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Filière
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Scores
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                      <tr 
                        key={student.id_stu} 
                        className="hover:bg-blue-50 transition-all duration-200 group transform hover:scale-[1.002]"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                              👤
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {student.nom} {student.prenom}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <code className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-mono border border-gray-200">
                            {student.cin}
                          </code>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {student.filiere}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="font-bold text-blue-600">{student.resultat?.scoreP ?? "N/A"}</div>
                              <div className="text-xs text-blue-800">Pratique</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
                              <div className="font-bold text-green-600">{student.resultat?.scoreT ?? "N/A"}</div>
                              <div className="text-xs text-green-800">Théorique</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
                              <div className="font-bold text-purple-600">{student.resultat?.scoreS ?? "N/A"}</div>
                              <div className="text-xs text-purple-800">Soft Skills</div>
                            </div>
                            <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                              <div className="font-bold text-amber-600">{student.resultat?.total ?? "N/A"}</div>
                              <div className="text-xs text-amber-800">Total</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => setSelected(student)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 font-medium"
                          >
                            📋 Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredStudents.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun étudiant trouvé
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Aucun étudiant ne correspond à vos critères de recherche.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Student Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform animate-scaleIn">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selected.nom} {selected.prenom}
                  </h3>
                  <p className="text-gray-600 mt-1">Détails de l'étudiant</p>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:rotate-90"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-medium text-blue-700">CIN</label>
                    <p className="text-gray-900 font-mono text-lg">{selected.cin}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <label className="text-sm font-medium text-purple-700">Filière</label>
                    <p className="text-gray-900 text-lg font-semibold">{selected.filiere}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <label className="text-sm font-medium text-gray-700">Statut actuel</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selected.status)}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>

                {/* Results */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📊 Résultats d'Évaluation
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 transform hover:scale-105 transition-all duration-200">
                      <div className="text-2xl font-bold text-blue-600">{selected.resultat?.scoreP ?? "N/A"}</div>
                      <div className="text-sm text-blue-800 font-medium">Pratique</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200 transform hover:scale-105 transition-all duration-200">
                      <div className="text-2xl font-bold text-green-600">{selected.resultat?.scoreT ?? "N/A"}</div>
                      <div className="text-sm text-green-800 font-medium">Théorique</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200 transform hover:scale-105 transition-all duration-200">
                      <div className="text-2xl font-bold text-purple-600">{selected.resultat?.scoreS ?? "N/A"}</div>
                      <div className="text-sm text-purple-800 font-medium">Soft Skills</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200 transform hover:scale-105 transition-all duration-200">
                      <div className="text-2xl font-bold text-amber-600">{selected.resultat?.total ?? "N/A"}</div>
                      <div className="text-sm text-amber-800 font-medium">Total</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    ⚡ Actions Rapides
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleStatusChange(selected.id_stu, "passed")} 
                      disabled={updating}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium shadow-lg shadow-green-500/20"
                    >
                      {updating ? "🔄" : "✅"} Accepté
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selected.id_stu, "in_interview")} 
                      disabled={updating}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium shadow-lg shadow-amber-500/20"
                    >
                      {updating ? "🔄" : "🎤"} Entretien
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selected.id_stu, "registred")} 
                      disabled={updating}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/20"
                    >
                      {updating ? "🔄" : "📝"} Registred
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Message */}
        {message.text && (
          <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg border-l-4 transform animate-slideInRight ${
            message.type === "error" 
              ? "bg-red-50 border-red-500 text-red-700" 
              : "bg-green-50 border-green-500 text-green-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${message.type === "error" ? "bg-red-500" : "bg-green-500"}`}></div>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
      
    </div>
  );
}