import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function FiliereStudents() {
  const filieres = [
    { id: 1, name: "Développement web", color: "from-blue-600 to-blue-700" },
    { id: 2, name: "Marketing digital", color: "from-amber-500 to-amber-600" },
    { id: 3, name: "Création de contenu", color: "from-green-500 to-green-600" },
  ];

  const [activeFiliere, setActiveFiliere] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Charger les étudiants quand la filière change
  useEffect(() => {
    if (!activeFiliere) {
      setStudents([]);
      return;
    }
    
    setLoading(true);
    api.get(`/top-students/${activeFiliere.name}`)
      .then((res) => {
        setStudents(res.data);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [activeFiliere]);

  // Fonction pour exporter en Excel
  const exportToExcel = () => {
    if (!students.length) return;

    const worksheet = XLSX.utils.json_to_sheet(students.map((student, index) => ({
      "Rang": index + 1,
      "Nom": student.nom,
      "Prénom": student.prenom,
      "CIN": student.cin,
      "Score Pratique": student.scoreP,
      "Score Théorique": student.scoreT,
      "Score Soft Skills": student.scoreS,
      "Total": student.total,
      "Filière": activeFiliere.name
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Étudiants");
    
    XLSX.writeFile(workbook, `etudiants-${activeFiliere.name.replace(/\s+/g, '-')}.xlsx`);
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>

      {/* Contenu principal - col-9 */}
      <div className="w-9/12 p-6">
        {/* En-tête principal */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Classement des Étudiants
          </h1>
          <p className="text-blue-100 text-lg">
            Découvrez le classement des meilleurs étudiants par filière
          </p>
          <div className="flex items-center mt-4">
            <div className="w-2 h-8 bg-amber-400 rounded-full mr-3"></div>
            <p className="text-sm text-blue-100">
              Sélectionnez une filière pour voir le classement détaillé
            </p>
          </div>
        </div>

        {/* Cartes des filières */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filieres.map((filiere) => (
            <div
              key={filiere.id}
              className={`bg-gradient-to-r ${filiere.color} rounded-xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                activeFiliere?.id === filiere.id ? 'border-amber-400 border-4' : 'border-transparent'
              }`}
              onClick={() => setActiveFiliere(filiere)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{filiere.name}</h3>
                  <p className="text-sm opacity-90">
                    Cliquez pour voir le classement
                  </p>
                </div>
                <div className="text-3xl">
                  {filiere.id === 1 && "💻"}
                  {filiere.id === 2 && "📊"}
                  {filiere.id === 3 && "🎨"}
                </div>
              </div>
              {activeFiliere?.id === filiere.id && (
                <div className="mt-3 flex items-center">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-semibold">Sélectionnée</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section résultats */}
        {activeFiliere && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* En-tête du tableau avec bouton Excel */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Classement - {activeFiliere.name}
                  </h2>
                  <p className="text-blue-100">
                    {loading ? "Chargement..." : `Top ${students.length} étudiants`}
                  </p>
                </div>
                <button
                  onClick={exportToExcel}
                  disabled={!students.length}
                  className="mt-4 md:mt-0 bg-amber-400 hover:bg-amber-500 text-blue-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Exporter Excel
                </button>
              </div>
            </div>

            {/* Tableau des résultats */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        CIN
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Score P
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Score T
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Score S
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr 
                        key={student.id_stu} 
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                              index === 0 ? 'bg-amber-400' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-amber-600' : 'bg-blue-600'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {student.nom} {student.prenom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {student.cin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {student.scoreP}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600">
                          {student.scoreT}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {student.scoreS}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {student.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openStudentDetails(student)}
                            className="bg-amber-400 hover:bg-amber-500 text-blue-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun étudiant trouvé
                </h3>
                <p className="text-gray-500">
                  Aucun étudiant n'a été trouvé pour la filière {activeFiliere.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal de détails de l'étudiant */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* En-tête du modal */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    📊 Détails de l'étudiant
                  </h3>
                  <button
                    onClick={closeStudentDetails}
                    className="text-white hover:text-amber-300 transition-colors transform hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Informations personnelles
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">Nom complet:</span>
                          <span className="font-semibold">{selectedStudent.nom} {selectedStudent.prenom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">CIN:</span>
                          <span className="font-semibold">{selectedStudent.cin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">Filière:</span>
                          <span className="font-semibold">{activeFiliere.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <h4 className="font-bold text-amber-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                        Scores détaillés
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-amber-600 font-medium">Score Pratique:</span>
                            <span className="font-bold text-blue-600">{selectedStudent.scoreP}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(selectedStudent.scoreP / selectedStudent.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-amber-600 font-medium">Score Théorique:</span>
                            <span className="font-bold text-amber-600">{selectedStudent.scoreT}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-amber-400 h-2 rounded-full" 
                              style={{ width: `${(selectedStudent.scoreT / selectedStudent.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-amber-600 font-medium">Score Soft Skills:</span>
                            <span className="font-bold text-green-600">{selectedStudent.scoreS}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(selectedStudent.scoreS / selectedStudent.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 rounded-xl text-white text-center shadow-lg">
                    <div className="text-3xl font-bold">{selectedStudent.total} points</div>
                    <div className="text-lg opacity-90 font-semibold">Score Total</div>
                  </div>
                </div>
              </div>

              {/* Pied du modal */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                <button
                  onClick={closeStudentDetails}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}