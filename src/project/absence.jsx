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
  const [sectionLoading, setSectionLoading] = useState(true);

  // Charger toutes les sections
  useEffect(() => {
    setSectionLoading(true);
    api.get("/sections")
      .then(res => {
        setSections(res.data);
        if (res.data.length > 0) {
          setSelectedSection(res.data[0]);
        }
      })
      .catch(err => console.error("Erreur Sections:", err))
      .finally(() => setSectionLoading(false));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>

      {/* Contenu principal - col-9 */}
      <div className="w-9/12 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header avec sélecteur de sections */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/25 border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  Gestion des Absences
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Suivez les absences des étudiants par section
                </p>
              </div>

              {/* Sélecteur de sections professionnel */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <label className="block text-white font-semibold mb-3">
                  📊 Sélectionner une Section
                </label>
                {sectionLoading ? (
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Chargement des sections...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedSection?.id || ""}
                      onChange={(e) => {
                        const section = sections.find(s => s.id === parseInt(e.target.value));
                        if (section) handleSection(section);
                      }}
                      className="w-80 bg-white/90 border-2 border-white/50 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <option value="">Choisir une section</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Indicateur de section sélectionnée */}
          {selectedSection && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 mb-8 text-white shadow-lg border border-amber-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Section {selectedSection.name}
                    </h2>
                    <p className="text-amber-100">
                      {students.length} étudiant{students.length !== 1 ? 's' : ''} dans cette section
                    </p>
                  </div>
                </div>
                <div className="text-4xl opacity-30">📚</div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="grid grid-cols-2 gap-8">
            {/* Colonne Étudiants */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      👥 Liste des Étudiants
                    </h3>
                    <p className="text-gray-600">
                      Sélectionnez un étudiant pour voir ses absences
                    </p>
                  </div>

                  {/* Barre de recherche */}
                  <div className="relative w-64">
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Liste des étudiants */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Chargement des étudiants...</p>
                    </div>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredStudents.map((student, index) => (
                      <div
                        key={student.id_stu}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg ${
                          selectedStudent?.id_stu === student.id_stu
                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-md scale-105"
                            : "border-gray-100 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"
                        }`}
                        onClick={() => handleStudent(student)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                              selectedStudent?.id_stu === student.id_stu
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : "bg-gradient-to-r from-gray-500 to-gray-600"
                            }`}>
                              {student.nom.charAt(0)}{student.prenom.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-800 truncate">
                              {student.nom} {student.prenom}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                                {student.cin}
                              </span>
                              <span className="text-sm text-gray-500 truncate">
                                {student.gmail}
                              </span>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            selectedStudent?.id_stu === student.id_stu ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucun étudiant trouvé</h4>
                    <p className="text-gray-500 text-sm">
                      {searchQuery 
                        ? `Aucun résultat pour "${searchQuery}"`
                        : "Aucun étudiant dans cette section"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne Absences */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      📋 Détail des Absences
                    </h3>
                    <p className="text-gray-600">
                      {selectedStudent 
                        ? `Absences de ${selectedStudent.nom} ${selectedStudent.prenom}`
                        : "Sélectionnez un étudiant pour voir ses absences"
                      }
                    </p>
                  </div>

                  {selectedStudent && (
                    <button
                      onClick={exportToExcel}
                      disabled={absences.length === 0}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-400 flex items-center gap-2 whitespace-nowrap"
                    >
                      <span>📊</span>
                      Exporter Excel
                    </button>
                  )}
                </div>
              </div>

              {/* Détail des absences */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {!selectedStudent ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">Aucun étudiant sélectionné</h4>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Veuillez sélectionner un étudiant dans la liste pour afficher son historique d'absences.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Chargement des absences...</p>
                    </div>
                  </div>
                ) : absences.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Aucune absence</h4>
                    <p className="text-gray-500">
                      {selectedStudent.nom} {selectedStudent.prenom} n'a aucune absence enregistrée.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Résumé */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-3xl font-bold text-blue-600">{absences.length}</div>
                          <div className="text-sm text-blue-800 font-medium">Total absences</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-purple-600">
                            {new Set(absences.map(a => a.section?.name)).size}
                          </div>
                          <div className="text-sm text-purple-800 font-medium">Sections</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-amber-600">
                            {new Set(absences.map(a => new Date(a.date).toLocaleDateString())).size}
                          </div>
                          <div className="text-sm text-amber-800 font-medium">Jours différents</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-red-600">
                            {absences.filter(a => !a.reason || a.reason === "Non spécifiée").length}
                          </div>
                          <div className="text-sm text-red-800 font-medium">Sans raison</div>
                        </div>
                      </div>
                    </div>

                    {/* Liste des absences */}
                    <div className="space-y-3">
                      {absences.map((absence, index) => (
                        <div
                          key={absence.id}
                          className="bg-gray-50/50 rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold text-sm">❌</span>
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-800">
                                  Absence #{index + 1}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {new Date(absence.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                              Absent
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">Section:</span>
                              <span className="ml-2 text-gray-800">{absence.section?.name || "Non spécifié"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Raison:</span>
                              <span className={`ml-2 ${
                                absence.reason && absence.reason !== "Non spécifiée" 
                                  ? "text-gray-800" 
                                  : "text-red-600 font-medium"
                              }`}>
                                {absence.reason || "Non spécifiée"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}