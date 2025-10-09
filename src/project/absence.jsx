import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function Absences() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Charger toutes les sections
  useEffect(() => {
    api.get("/sections")
      .then(res => {
        setSections(res.data);
      })
      .catch(err => console.error("Erreur Sections:", err));
  }, []);

  // Lors de la sélection d'une section
  const handleSection = async (section) => {
    setSelectedSection(section);
    setSelectedStudent(null);
    setAbsences([]);
    setSearchQuery("");
    setLoading(true);

    try {
      const res = await api.get(`/sections/${section.id}/students`);
      console.log("Students Response:", res.data);

      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else if (res.data.students) {
        setStudents(res.data.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Erreur Étudiants:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Lors de la sélection d'un étudiant
  const handleStudent = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const res = await api.get(`/students/${student.id_stu}/absences`);
      setAbsences(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erreur Absences:", error);
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les étudiants
  const filteredStudents = students.filter(student =>
    searchQuery.trim() === "" ||
    student.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${student.nom} ${student.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Exporter les données en Excel
  const exportToExcel = () => {
    if (!selectedStudent) return;

    const data = [
      {
        "Nom": selectedStudent.nom,
        "Prénom": selectedStudent.prenom,
        "CIN": selectedStudent.cin,
        "Email": selectedStudent.gmail,
        "Section": selectedSection?.name,
        "Nombre d'absences": absences.length,
        "Dernière absence": absences.length > 0 
          ? new Date(absences[absences.length - 1].date).toLocaleDateString()
          : "Aucune"
      },
      ...absences.map((abs, index) => ({
        "Absence N°": index + 1,
        "Date": new Date(abs.date).toLocaleDateString(),
        "Section": abs.section?.name || "Non spécifié",
        "Raison": abs.reason || "Non spécifiée"
      }))
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absences");

    XLSX.writeFile(workbook, `absences-${selectedStudent.nom}-${selectedStudent.prenom}.xlsx`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Gestion des Absences
            </h1>
            <p className="text-gray-600">Suivez les absences des étudiants par section</p>
          </div>

          {/* Sections Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sections Disponibles</h2>
            <div className="flex flex-wrap gap-3">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedSection?.id === section.id 
                      ? "bg-blue-600 text-white shadow-md scale-105" 
                      : "bg-gray-100 text-gray-700 hover:bg-amber-400 hover:text-white"
                  }`}
                  onClick={() => handleSection(section)}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>

          {/* Students Section */}
          {selectedSection && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Étudiants - {selectedSection.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Students List */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <div
                        key={student.id_stu}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg ${
                          selectedStudent?.id_stu === student.id_stu
                            ? "border-blue-600 bg-blue-50 shadow-md scale-105"
                            : "border-gray-100 bg-gray-50 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                        onClick={() => handleStudent(student)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {student.nom.charAt(0)}{student.prenom.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {student.nom} {student.prenom}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {student.cin}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                      </div>
                      <p className="text-gray-500">
                        {searchQuery 
                          ? `Aucun étudiant trouvé pour "${searchQuery}"`
                          : "Aucun étudiant dans cette section"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Absences Section */}
          {selectedStudent && (
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Absences de {selectedStudent.nom} {selectedStudent.prenom}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {absences.length} absence{absences.length !== 1 ? 's' : ''} enregistrée{absences.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Export Button */}
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-green-600 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Exporter Excel
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : absences.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune absence</h3>
                  <p className="text-gray-500">L'étudiant n'a aucune absence enregistrée</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raison
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {absences.map((absence, index) => (
                        <tr 
                          key={absence.id} 
                          className="transition-all duration-300 hover:bg-blue-50"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(absence.date).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {absence.section?.name || "Non spécifié"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {absence.reason || "Non spécifiée"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Absent
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* No Section Selected State */}
          {!selectedSection && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Sélectionnez une section</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Choisissez une section dans la liste ci-dessus pour afficher les étudiants et gérer leurs absences.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}