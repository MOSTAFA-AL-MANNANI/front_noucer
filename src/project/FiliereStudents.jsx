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
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-3/12">
        <Sidebar />
      </div>

      <div className="w-9/12 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Classement des Étudiants</h1>
          <p className="text-blue-100 text-lg">Découvrez le classement des meilleurs étudiants par filière</p>
        </div>

        {/* Filières */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filieres.map((filiere) => (
            <div
              key={filiere.id}
              className={`bg-gradient-to-r ${filiere.color} rounded-xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                activeFiliere?.id === filiere.id ? 'border-amber-400 border-4' : 'border-transparent'
              }`}
              onClick={() => setActiveFiliere(filiere)}
            >
              <h3 className="text-xl font-bold mb-2">{filiere.name}</h3>
            </div>
          ))}
        </div>

        {/* Section résultats */}
        {activeFiliere && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header tableau avec boutons */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Classement - {activeFiliere.name}</h2>
                <p className="text-blue-100">{loading ? "Chargement..." : `Top ${students.length} étudiants`}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={exportToExcel}
                  disabled={!students.length}
                  className="bg-amber-400 hover:bg-amber-500 text-blue-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Exporter Excel
                </button>

                {/* 💻 Bouton passer top 30 */}
                <button
                  onClick={() => passTopStudents(activeFiliere.name)}
                  disabled={!students.length}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Passer tous les top 30
                </button>
              </div>
            </div>

            {/* Tableau étudiants */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Rang</th>
                      <th>Étudiant</th>
                      <th>CIN</th>
                      <th>Score P</th>
                      <th>Score T</th>
                      <th>Score S</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.id_stu} className="hover:bg-blue-50 transition-colors duration-200">
                        <td>{index + 1}</td>
                        <td>{student.nom} {student.prenom}</td>
                        <td>{student.cin}</td>
                        <td>{student.scoreP}</td>
                        <td>{student.scoreT}</td>
                        <td>{student.scoreS}</td>
                        <td>{student.total}</td>
                        <td>
                          <button onClick={() => openStudentDetails(student)} className="bg-amber-400 hover:bg-amber-500 text-blue-900 font-semibold py-2 px-4 rounded-lg">
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Aucun étudiant trouvé</div>
            )}
          </div>
        )}

        {/* Modal détails */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">📊 Détails de l'étudiant</h3>
                <button onClick={closeStudentDetails} className="text-white hover:text-amber-300">X</button>
              </div>
              <div className="p-6">
                <p>Nom: {selectedStudent.nom} {selectedStudent.prenom}</p>
                <p>CIN: {selectedStudent.cin}</p>
                <p>Filière: {activeFiliere.name}</p>
                <p>Score Pratique: {selectedStudent.scoreP}</p>
                <p>Score Théorique: {selectedStudent.scoreT}</p>
                <p>Score Soft Skills: {selectedStudent.scoreS}</p>
                <p>Total: {selectedStudent.total}</p>
              </div>
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                <button onClick={closeStudentDetails} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
