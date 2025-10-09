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

  // Fetch sections
  useEffect(() => {
    api.get("/sections")
      .then(res => setSections(res.data))
      .catch(err => console.error(err));
  }, []);

  // Handle section selection
  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setLoading(true);
    setSearchQuery(""); // Reset search when section changes

    api.get(`/sections/${section.id}/students`)
      .then(res => setStudents(res.data.students))
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

    // Auto-size columns
    const max_width = data.reduce((w, r) => Math.max(w, r.Nom.length), 10);
    worksheet['!cols'] = [{ wch: max_width }];

    XLSX.writeFile(workbook, `étudiants-${selectedSection.name}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Gestion des Sections
            </h1>
            <p className="text-gray-600">Consultez les étudiants par section</p>
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
                  onClick={() => handleSelectSection(section)}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>

          {/* Students Section */}
          {selectedSection && (
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              {/* Header with Search and Export */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-4 border-b border-gray-100">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Étudiants de {selectedSection.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
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
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={exportToExcel}
                    disabled={filteredStudents.length === 0}
                    className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-green-600 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Students Table */}
              {!loading && (
                <>
                  {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredStudents.map((student, index) => (
                            <tr 
                              key={student.id_stu} 
                              className="transition-all duration-300 hover:bg-blue-50 hover:shadow-md cursor-pointer"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold">
                                      {student.nom.charAt(0)}{student.prenom.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.nom} {student.prenom}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">{student.cin}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.gmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 max-w-xs truncate">{student.adresse}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  student.genre === 'M' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {student.genre}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{student.niveau_sco}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                  student.status === 'actif' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
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
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun étudiant trouvé</h3>
                      <p className="text-gray-500">
                        {searchQuery 
                          ? `Aucun résultat pour "${searchQuery}"` 
                          : "Aucun étudiant dans cette section"}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-amber-600 hover:text-amber-700 font-medium mt-2"
                        >
                          Effacer la recherche
                        </button>
                      )}
                    </div>
                  )}
                </>
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
                Choisissez une section dans la liste ci-dessus pour afficher les étudiants correspondants.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}