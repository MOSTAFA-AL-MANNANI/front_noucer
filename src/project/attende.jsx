import React, { useEffect, useState, useMemo } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function WaitingStudents() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all"); // "all", "nom", "prenom", "cin"
  const [exportLoading, setExportLoading] = useState(false);

  // Alert helper function
  const showAlert = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const fetchWaiting = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students/waiting");
      setStudents(res.data);
      showAlert(`${res.data.length} étudiant(s) chargé(s) avec succès`, "success");
    } catch (err) {
      console.error("Erreur fetch:", err);
      showAlert("Erreur lors du chargement des étudiants en attente", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/students/${id}`, { status: newStatus });
      
      const statusMessages = {
        passed: "étudiant accepté avec succès",
        in_interview: "statut mis à jour vers 'En Entretien'",
        rejected: "étudiant refusé avec succès"
      };
      
      showAlert(`Statut ${statusMessages[newStatus]} !`, "success");
      fetchWaiting();
      
      if (selected && selected.id_stu === id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch (err) {
      console.error("Erreur update:", err);
      showAlert("Erreur lors de la mise à jour du statut", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const dataToExport = filteredStudents.map(student => ({
        "Nom": student.nom,
        "Prénom": student.prenom,
        "CIN": student.cin,
        "Filière": student.filiere,
        "Statut": student.status,
        "Score Pratique": student.resultat?.[0]?.scoreP || "N/A",
        "Score Théorique": student.resultat?.[0]?.scoreT || "N/A",
        "Score Soft Skills": student.resultat?.[0]?.scoreS || "N/A",
        "Total": student.resultat?.[0]?.total || "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Étudiants en Attente");
      
      // Create filename with current date
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `etudiants_attente_${date}.xlsx`);
      
      showAlert(`Fichier Excel exporté avec ${dataToExport.length} étudiant(s)`, "success");
    } catch (error) {
      console.error("Erreur export:", error);
      showAlert("Erreur lors de l'exportation Excel", "error");
    } finally {
      setExportLoading(false);
    }
  };

  // Advanced search filtering
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;

    return students.filter(student => {
      const term = searchTerm.toLowerCase();
      
      switch (searchField) {
        case "nom":
          return student.nom.toLowerCase().includes(term);
        case "prenom":
          return student.prenom.toLowerCase().includes(term);
        case "cin":
          return student.cin.toLowerCase().includes(term);
        case "all":
        default:
          return (
            student.nom.toLowerCase().includes(term) ||
            student.prenom.toLowerCase().includes(term) ||
            student.cin.toLowerCase().includes(term) ||
            student.filiere.toLowerCase().includes(term)
          );
      }
    });
  }, [students, searchTerm, searchField]);

  useEffect(() => {
    fetchWaiting();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* En-tête amélioré */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">📋</span>
              Étudiants en Attente
            </h2>
            <p className="text-gray-500 mt-1">
              {filteredStudents.length} étudiant(s) en attente de validation
              {searchTerm && ` (${students.length} au total)`}
            </p>
          </div>
          
          {/* Barre de recherche avancée */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex gap-2">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Tous les champs</option>
                <option value="nom">Nom</option>
                <option value="prenom">Prénom</option>
                <option value="cin">CIN</option>
                <option value="filiere">Filière</option>
              </select>
              
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder={`Rechercher par ${searchField === "all" ? "nom, prénom, CIN..." : searchField}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Bouton Export Excel */}
            <button
              onClick={exportToExcel}
              disabled={exportLoading || filteredStudents.length === 0}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors min-w-[140px]"
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

        {/* Message de notification amélioré */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-lg flex items-center justify-between shadow-lg transition-all duration-300 ${
            message.type === "error" 
              ? "bg-red-50 border-l-4 border-red-500 text-red-700" 
              : "bg-green-50 border-l-4 border-green-500 text-green-700"
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">
                {message.type === "error" ? "❌" : "✅"}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
            <button 
              onClick={() => setMessage({ text: "", type: "" })}
              className="text-gray-500 hover:text-gray-700 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* État de chargement */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-lg">Chargement des étudiants...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête du tableau avec statistiques */}
            <div className="px-6 py-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                <span className="text-sm text-gray-600">
                  Affichage de <strong>{filteredStudents.length}</strong> étudiant(s)
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Réinitialiser la recherche
                  </button>
                )}
              </div>
              
              {filteredStudents.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ⏳ En attente: {filteredStudents.filter(s => s.status === "waiting").length}
                  </span>
                </div>
              )}
            </div>

            {/* Tableau des étudiants */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Prénom</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">CIN</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Filière</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr key={student.id_stu} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.prenom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">{student.cin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.filiere}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          ⏳ {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelected(student)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <span className="mr-2">👁️</span>
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* État vide amélioré */}
            {filteredStudents.length === 0 && !loading && (
              <div className="text-center py-16 px-6">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? "Aucun étudiant trouvé" : "Aucun étudiant en attente"}
                </p>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "Aucun étudiant ne correspond à votre recherche. Essayez d'autres termes."
                    : "Tous les étudiants ont été traités ou aucun n'est actuellement en attente."
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Voir tous les étudiants
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Détails de l'étudiant amélioré */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header du modal */}
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-3">👤</span>
                  Détails de {selected.nom} {selected.prenom}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Contenu du modal */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div><label className="font-semibold text-gray-600 block mb-1">Nom</label><p className="text-gray-800 text-lg">{selected.nom}</p></div>
                  <div><label className="font-semibold text-gray-600 block mb-1">Prénom</label><p className="text-gray-800 text-lg">{selected.prenom}</p></div>
                  <div><label className="font-semibold text-gray-600 block mb-1">CIN</label><p className="text-gray-800 text-lg font-mono">{selected.cin}</p></div>
                  <div><label className="font-semibold text-gray-600 block mb-1">Filière</label><p className="text-gray-800 text-lg">{selected.filiere}</p></div>
                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">Statut Actuel</label>
                    <span className="mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                      ⏳ {selected.status}
                    </span>
                  </div>
                </div>

                {/* Section des résultats */}
                {selected.resultat && selected.resultat.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                      <span className="text-xl mr-2">📊</span>Résultats Académiques
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-50 p-4 rounded-lg border"><label className="font-semibold text-gray-600 text-sm">Pratique</label><p className="text-2xl font-bold text-blue-600">{selected.resultat[0].scoreP}</p></div>
                      <div className="bg-gray-50 p-4 rounded-lg border"><label className="font-semibold text-gray-600 text-sm">Théorique</label><p className="text-2xl font-bold text-blue-600">{selected.resultat[0].scoreT}</p></div>
                      <div className="bg-gray-50 p-4 rounded-lg border"><label className="font-semibold text-gray-600 text-sm">Soft Skills</label><p className="text-2xl font-bold text-blue-600">{selected.resultat[0].scoreS}</p></div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200"><label className="font-semibold text-blue-800 text-sm">Total</label><p className="text-2xl font-bold text-blue-800">{selected.resultat[0].total}</p></div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Aucun résultat académique disponible pour cet étudiant
                    </p>
                  </div>
                )}

                {/* Section de modification du statut */}
                <div>
                  <h4 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                    <span className="text-xl mr-2">⚙️</span>Modifier le Statut
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleStatusChange(selected.id_stu, "passed")} 
                      disabled={updating}
                      className="flex justify-center items-center px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors"
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span className="mr-2">✅</span>
                          <div className="text-left">
                            <div className="font-semibold">Accepté</div>
                            <div className="text-xs opacity-90">Passer à accepté</div>
                          </div>
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange(selected.id_stu, "in_interview")} 
                      disabled={updating}
                      className="flex justify-center items-center px-4 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-amber-300 transition-colors"
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span className="mr-2">🕑</span>
                          <div className="text-left">
                            <div className="font-semibold">Entretien</div>
                            <div className="text-xs opacity-90">Programmer entretien</div>
                          </div>
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange(selected.id_stu, "rejected")} 
                      disabled={updating}
                      className="flex justify-center items-center px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors"
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span className="mr-2">❌</span>
                          <div className="text-left">
                            <div className="font-semibold">Refusé</div>
                            <div className="text-xs opacity-90">Refuser l'étudiant</div>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}