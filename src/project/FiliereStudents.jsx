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

  // Export Excel
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

  // Détails étudiant
  const openStudentDetails = (student) => setSelectedStudent(student);
  const closeStudentDetails = () => setSelectedStudent(null);

  // 💻 Nouvelle fonction : passer top 30
  const passTopStudents = async (filiere) => {
    if (!window.confirm("Voulez-vous vraiment passer tous les top 30 étudiants ?")) return;

    try {
      const res = await api.post(`/students/${filiere}/pass-top`);
      if (res.data.success) {
        alert(res.data.message);
        setStudents((prev) =>
          prev.map((stu) =>
            res.data.students_updated.includes(stu.id_stu)
              ? { ...stu, status: 'passed' }
              : stu
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statuts :", error);
      alert("Erreur lors de la mise à jour des statuts.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      <Sidebar />

      <div className="flex-1 p-6 ml-72">
        {/* Header amélioré */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/25 border border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                Classement des Étudiants
              </h1>
              <p className="text-blue-100 text-lg font-medium">Découvrez le classement des meilleurs étudiants par filière</p>
            </div>
            <div className="text-6xl opacity-20 transform rotate-12">🏆</div>
          </div>
        </div>

        {/* Filières améliorées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {filieres.map((filiere) => (
            <div
              key={filiere.id}
              className={`bg-gradient-to-r ${filiere.color} rounded-2xl p-6 text-white shadow-xl transform transition-all duration-500 hover:scale-105 cursor-pointer border-2 backdrop-blur-sm ${
                activeFiliere?.id === filiere.id 
                  ? 'border-amber-400 border-4 shadow-2xl shadow-amber-400/30 scale-105' 
                  : 'border-white/20 hover:border-white/40'
              } relative overflow-hidden group`}
              onClick={() => setActiveFiliere(filiere)}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{filiere.name}</h3>
                <div className="w-12 h-1 bg-amber-300 rounded-full mb-3"></div>
                <p className="text-white/80 text-sm font-medium">
                  {activeFiliere?.id === filiere.id ? '✓ Sélectionnée' : 'Cliquer pour voir le classement'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Section résultats améliorée */}
        {activeFiliere && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
            {/* Header tableau avec boutons améliorés */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-blue-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Classement - {activeFiliere.name}</h2>
                  <p className="text-blue-100 font-medium">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Chargement...
                      </span>
                    ) : (
                      `Top ${students.length} étudiants - Score total`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportToExcel}
                  disabled={!students.length}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-900 font-bold py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 border-2 border-amber-300 flex items-center gap-2"
                >
                  <span>📥</span>
                  Exporter Excel
                </button>

                <button
                  onClick={() => passTopStudents(activeFiliere.name)}
                  disabled={!students.length}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-400 flex items-center gap-2"
                >
                  <span>✅</span>
                  Passer Top 30
                </button>
              </div>
            </div>

            {/* Tableau étudiants amélioré */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Chargement du classement...</p>
                </div>
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/60">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Rang
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Étudiant
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        CIN
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Score P
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Score T
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Score S
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Total
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200/40">
                    {students.map((student, index) => (
                      <tr 
                        key={student.id_stu} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-amber-50/80 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {student.nom} {student.prenom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                          {student.cin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {student.scoreP}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {student.scoreT}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {student.scoreS}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200">
                            {student.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => openStudentDetails(student)}
                            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-2 px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md border border-amber-300"
                          >
                            📋 Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-20">📭</div>
                <p className="text-gray-500 text-lg font-medium">Aucun étudiant trouvé pour cette filière</p>
                <p className="text-gray-400 mt-2">Veuillez sélectionner une autre filière</p>
              </div>
            )}
          </div>
        )}

        {/* Modal détails amélioré */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 transform animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-t-3xl flex justify-between items-center border-b border-blue-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Détails de l'étudiant</h3>
                    <p className="text-blue-100">Informations complètes</p>
                  </div>
                </div>
                <button 
                  onClick={closeStudentDetails}
                  className="text-white hover:text-amber-300 transition-colors duration-200 p-2 hover:bg-white/10 rounded-xl text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-4 rounded-2xl border border-blue-100">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Nom Complet</label>
                      <p className="text-lg font-bold text-gray-800">{selectedStudent.nom} {selectedStudent.prenom}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-4 rounded-2xl border border-blue-100">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">CIN</label>
                      <p className="text-lg font-mono font-bold text-gray-800">{selectedStudent.cin}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-4 rounded-2xl border border-blue-100">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Filière</label>
                      <p className="text-lg font-bold text-blue-600">{activeFiliere.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Score Pratique</label>
                      <p className="text-2xl font-bold text-green-600 text-center">{selectedStudent.scoreP}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-2xl border border-purple-100">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Score Théorique</label>
                      <p className="text-2xl font-bold text-purple-600 text-center">{selectedStudent.scoreT}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Score Soft Skills</label>
                      <p className="text-2xl font-bold text-amber-600 text-center">{selectedStudent.scoreS}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-6 rounded-2xl border border-amber-300 text-center">
                  <label className="text-sm font-semibold text-amber-800 uppercase tracking-wider">Score Total</label>
                  <p className="text-4xl font-bold text-amber-900">{selectedStudent.total}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-6 rounded-b-3xl border-t border-gray-200 flex justify-end">
                <button 
                  onClick={closeStudentDetails}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 shadow-md border border-blue-500"
                >
                  Fermer le détail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}