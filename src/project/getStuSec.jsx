import React, { useEffect, useState } from "react";
import api from "./api";
import * as XLSX from "xlsx";
import Sidebar from "./sidebar";

export default function SectionsStudents() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionLoading, setSectionLoading] = useState(true);

  // Fetch sections
  useEffect(() => {
    setSectionLoading(true);
    api.get("/sections")
      .then(res => {
        setSections(res.data);
        if (res.data.length > 0) {
          setSelectedSection(res.data[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setSectionLoading(false));
  }, []);

  // Handle section selection
  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setLoading(true);
    setSearchQuery("");

    api.get(`/sections/${section.id}/students`)
      .then(res => setStudents(res.data.students || []))
      .catch(err => {
        console.error(err);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    searchQuery.trim() === "" ||
    student.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.gmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export to Excel
  const exportToExcel = () => {
    if (!filteredStudents.length) return;

    const data = filteredStudents.map(s => ({
      "Section": selectedSection.name,
      "Nom": s.nom,
      "Prénom": s.prenom,
      "CIN": s.cin,
      "Email": s.gmail,
      "Adresse": s.adresse,
      "Genre": s.genre,
      "Niveau Scolaire": s.niveau_sco,
      "Statut": s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Étudiants");

    const max_width = data.reduce((w, r) => Math.max(w, r.Nom.length), 10);
    worksheet['!cols'] = [{ wch: max_width }];

    XLSX.writeFile(workbook, `étudiants-${selectedSection.name}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>

      {/* Main Content - col-9 */}
      <div className="w-9/12 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header avec Sélecteur */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/25 border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  Gestion des Sections
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Consultez les étudiants par section
                </p>
              </div>

              {/* Sélecteur de Sections */}
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
                        if (section) handleSelectSection(section);
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

          {/* Indicateur de Section */}
          {selectedSection && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 mb-8 text-white shadow-lg border border-amber-400 transform transition-all duration-300 hover:scale-105">
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
                <div className="text-4xl opacity-30 animate-bounce">📚</div>
              </div>
            </div>
          )}

          {/* Contenu Principal */}
          {selectedSection && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
              {/* Header avec Recherche et Export */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      👥 Étudiants de {selectedSection.name}
                    </h3>
                    <p className="text-gray-600">
                      {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Barre de Recherche */}
                    <div className="relative">
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
                        className="w-80 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none hover:border-gray-300"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                        >
                          <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Bouton Export */}
                    <button
                      onClick={exportToExcel}
                      disabled={filteredStudents.length === 0}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-400 flex items-center gap-2"
                    >
                      <span>📊</span>
                      Exporter Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu Étudiants */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium text-lg">Chargement des étudiants...</p>
                    </div>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200/60">
                    <table className="min-w-full divide-y divide-gray-200/60">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            Étudiant
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            CIN
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            Adresse
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            Genre
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            Niveau
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200/40">
                        {filteredStudents.map((student, index) => (
                          <tr 
                            key={student.id_stu} 
                            className="transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-amber-50/80 group cursor-pointer transform hover:scale-105"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300">
                                  <span className="text-white font-semibold text-sm">
                                    {student.nom.charAt(0)}{student.prenom.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    {student.nom} {student.prenom}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg group-hover:bg-blue-100 transition-colors">
                                {student.cin}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                {student.gmail}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs truncate group-hover:text-gray-800 transition-colors">
                                {student.adresse}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                                student.genre === 'M' 
                                  ? 'bg-blue-100 text-blue-800 group-hover:bg-blue-200 group-hover:text-blue-900' 
                                  : 'bg-pink-100 text-pink-800 group-hover:bg-pink-200 group-hover:text-pink-900'
                              }`}>
                                {student.genre}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                {student.niveau_sco}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${
                                student.status === 'actif' 
                                  ? 'bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:text-green-900' 
                                  : 'bg-red-100 text-red-800 group-hover:bg-red-200 group-hover:text-red-900'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Aucun étudiant trouvé</h3>
                    <p className="text-gray-500 text-lg mb-4">
                      {searchQuery 
                        ? `Aucun résultat pour "${searchQuery}"` 
                        : "Aucun étudiant dans cette section"
                      }
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 transform"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* État Aucune Section Sélectionnée */}
          {!selectedSection && !sectionLoading && (
            <div className="bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Sélectionnez une section</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Choisissez une section dans le sélecteur ci-dessus pour afficher les étudiants correspondants.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}