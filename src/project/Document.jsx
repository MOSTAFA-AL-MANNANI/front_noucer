import React, { useState, useEffect } from "react";
import api from "./api";
import Sidebar from "./sidebar";

function Document() {
  const [filieres, setFilieres] = useState([]); 
  const [filiereSelected, setFiliereSelected] = useState(""); 
  const [students, setStudents] = useState([]); 
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Récupérer toutes les filières
  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const res = await api.get("/filieres");
        setFilieres(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des filières:", error);
      }
    };
    fetchFilieres();
  }, []);

  // 🔹 Filtrer les étudiants lorsque la recherche change
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = students.filter(student => 
        student.nom.toLowerCase().includes(query) ||
        student.prenom.toLowerCase().includes(query) ||
        `${student.nom} ${student.prenom}`.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  // 🔹 Récupérer les élèves selon la filière sélectionnée
  const fetchStudents = async () => {
    if (!filiereSelected) return;
    setLoading(true);
    try {
      const res = await api.get(`/student/${filiereSelected}`);
      setStudents(res.data);
      setFilteredStudents(res.data);
      setSelectedStudent(null);
      setDocuments({});
      setSearchQuery(""); // Réinitialiser la recherche
    } catch (error) {
      console.error("Erreur lors de la récupération des élèves:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Récupérer les documents d'un élève
  const fetchDocuments = async (id) => {
    setSelectedStudent(id);
    try {
      const res = await api.get(`/student/${id}/documents`);
      setDocuments(res.data || {});
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
    }
  };

  // 🔹 Mettre à jour l'état d'un document
  const handleCheckboxChange = async (field) => {
    const newValue = !documents[field];
    try {
      await api.post(`/student/${selectedStudent}/documents/update`, {
        field,
        value: newValue,
      });
      setDocuments({ ...documents, [field]: newValue });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du document:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Gestion des Documents
            </h1>
            <p className="text-gray-600">Gérez les documents des étudiants par filière</p>
          </div>

          {/* Sélecteur de filière */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner une filière
                </label>
                <select
                  value={filiereSelected}
                  onChange={(e) => setFiliereSelected(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all duration-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none hover:border-gray-300"
                >
                  <option value="">-- Choisir une filière --</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={fetchStudents}
                disabled={!filiereSelected || loading}
                className="w-full lg:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recherche...
                  </span>
                ) : (
                  "Rechercher les étudiants"
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des élèves */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
                  Liste des Étudiants
                  <span className="text-blue-600 ml-2">({filteredStudents.length})</span>
                </h2>
                
                {/* Barre de recherche */}
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
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {students.length === 0 && filiereSelected && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <p>Aucun élève trouvé pour cette filière</p>
                  </div>
                )}
                
                {filteredStudents.length === 0 && searchQuery && students.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <p>Aucun étudiant trouvé pour "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-amber-600 hover:text-amber-700 font-medium mt-2"
                    >
                      Effacer la recherche
                    </button>
                  </div>
                )}
                
                {filteredStudents.map((stu) => (
                  <div
                    key={stu.id_stu}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      selectedStudent === stu.id_stu
                        ? "border-blue-600 bg-blue-50 shadow-md transform scale-105"
                        : "border-gray-100 bg-gray-50 hover:border-amber-400 hover:bg-amber-50 hover:shadow-md hover:transform hover:scale-105"
                    }`}
                    onClick={() => fetchDocuments(stu.id_stu)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {stu.nom} {stu.prenom}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">ID: {stu.id_stu}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        selectedStudent === stu.id_stu ? "bg-blue-600" : "bg-gray-300"
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents de l'élève */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Documents de l'Étudiant
              </h2>
              
              {selectedStudent ? (
                <div className="space-y-4">
                  {Object.keys(documents).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun document trouvé</p>
                  ) : (
                    Object.keys(documents).map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 hover:shadow-md"
                      >
                        <label className="flex items-center space-x-3 cursor-pointer flex-1">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={documents[doc] || false}
                              onChange={() => handleCheckboxChange(doc)}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded border-2 transition-all duration-300 ${
                              documents[doc]
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-gray-300"
                            }`}>
                              {documents[doc] && (
                                <svg className="w-4 h-4 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-700 font-medium capitalize">
                            {doc.replace(/_/g, " ")}
                          </span>
                        </label>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          documents[doc]
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {documents[doc] ? "Complété" : "Manquant"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <p>Sélectionnez un étudiant pour voir ses documents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Document;