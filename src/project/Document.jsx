import React, { useState, useEffect } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faUsers,
  faUserGraduate,
  faSearch,
  faBook,
  faIdCard,
  faCheckCircle,
  faTimesCircle,
  faClipboardCheck,
  faChartBar,
  faCog,
  faSpinner,
  faEye,
  faTrash,
  faFilter,
  faUniversity,
  faListAlt,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage
} from '@fortawesome/free-solid-svg-icons';

function Document() {
  const [filieres, setFilieres] = useState([]); 
  const [filiereSelected, setFiliereSelected] = useState(""); 
  const [students, setStudents] = useState([]); 
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);

  // 🔹 Récupérer toutes les filières
  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const res = await api.get("/filieres");
        setFilieres(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des filières:", error);
        showAlert("Erreur", "Impossible de charger les filières", "error");
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

  // 🔹 Fonction pour afficher les alertes SweetAlert2
  const showAlert = (title, text, type = "success") => {
    Swal.fire({
      title,
      text,
      icon: type,
      confirmButtonColor: '#3085d6',
      timer: type === 'success' ? 3000 : undefined,
      showConfirmButton: type !== 'success'
    });
  };

  // 🔹 Récupérer les élèves selon la filière sélectionnée
  const fetchStudents = async () => {
    if (!filiereSelected) {
      showAlert("Attention", "Veuillez sélectionner une filière", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/student/${filiereSelected}`);
      setStudents(res.data);
      setFilteredStudents(res.data);
      setSelectedStudent(null);
      setSelectedStudentInfo(null);
      setDocuments({});
      setSearchQuery("");
      
      showAlert("Succès", `${res.data.length} étudiant(s) trouvé(s) dans la filière ${filiereSelected}`);
    } catch (error) {
      console.error("Erreur lors de la récupération des élèves:", error);
      showAlert("Erreur", "Impossible de charger les étudiants de cette filière", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Récupérer les documents d'un élève
  const fetchDocuments = async (student) => {
    setSelectedStudent(student.id_stu);
    setSelectedStudentInfo(student);
    try {
      const res = await api.get(`/student/${student.id_stu}/documents`);
      setDocuments(res.data || {});
      
      // Afficher une notification toast pour l'étudiant sélectionné
      Swal.fire({
        title: `Documents de ${student.nom} ${student.prenom}`,
        text: "Chargement des documents...",
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      showAlert("Erreur", "Impossible de charger les documents de cet étudiant", "error");
    }
  };

  // 🔹 Mettre à jour l'état d'un document
  const handleCheckboxChange = async (field) => {
    const newValue = !documents[field];
    const documentName = field.replace(/_/g, " ");
    
    // Confirmation avant modification
    const result = await Swal.fire({
      title: 'Modifier le statut',
      text: `Voulez-vous marquer le document "${documentName}" comme ${newValue ? 'complété' : 'manquant'} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/student/${selectedStudent}/documents/update`, {
        field,
        value: newValue,
      });
      setDocuments({ ...documents, [field]: newValue });
      
      // Notification de succès
      Swal.fire({
        title: 'Statut mis à jour',
        text: `Le document "${documentName}" a été marqué comme ${newValue ? 'complété' : 'manquant'}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du document:", error);
      showAlert("Erreur", "Impossible de mettre à jour le statut du document", "error");
    }
  };

  // 🔹 Obtenir l'icône appropriée pour le type de document
  const getDocumentIcon = (docName) => {
    if (docName.includes('cv') || docName.includes('resume')) return faFileWord;
    if (docName.includes('photo')) return faFileImage;
    if (docName.includes('releve') || docName.includes('note')) return faFileExcel;
    if (docName.includes('diplome') || docName.includes('certificat')) return faFilePdf;
    return faFileAlt;
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
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                  <FontAwesomeIcon icon={faFileAlt} />
                  Gestion des Documents
                </h1>
                <p className="text-blue-100 text-lg font-medium flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  Gérez les documents des étudiants par filière
                </p>
              </div>

              {/* Sélecteur de Filière */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUniversity} />
                  Sélectionner une Filière
                </label>
                <div className="flex items-center gap-4">
                  <select
                    value={filiereSelected}
                    onChange={(e) => setFiliereSelected(e.target.value)}
                    className="w-80 bg-white/90 border-2 border-white/50 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <option value="">-- Choisir une filière --</option>
                    {filieres.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchStudents}
                    disabled={!filiereSelected || loading}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 border-2 border-amber-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSearch} />
                        Rechercher
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Indicateur de Filière */}
          {filiereSelected && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 mb-8 text-white shadow-lg border border-amber-400 transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Filière {filiereSelected}
                    </h2>
                    <p className="text-amber-100 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} />
                      {students.length} étudiant{students.length !== 1 ? 's' : ''} dans cette filière
                    </p>
                  </div>
                </div>
                <div className="text-4xl opacity-30 animate-pulse">
                  <FontAwesomeIcon icon={faChartBar} />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* Colonne Liste des Étudiants */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} />
                      Liste des Étudiants
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUserGraduate} />
                      {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Barre de Recherche */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
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
                        <FontAwesomeIcon icon={faTimesCircle} className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Liste des Étudiants */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {students.length === 0 && filiereSelected && !loading && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUserGraduate} className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Aucun élève trouvé</h3>
                    <p className="text-gray-500">Aucun élève trouvé pour cette filière</p>
                  </div>
                )}
                
                {filteredStudents.length === 0 && searchQuery && students.length > 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faSearch} className="w-12 h-12 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Aucun résultat</h3>
                    <p className="text-gray-500 mb-4">Aucun étudiant trouvé pour "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 transform flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Effacer la recherche
                    </button>
                  </div>
                )}
                
                <div className="space-y-3">
                  {filteredStudents.map((student, index) => (
                    <div
                      key={student.id_stu}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg ${
                        selectedStudent === student.id_stu
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-md scale-105"
                          : "border-gray-100 bg-gray-50/50 hover:border-amber-300 hover:bg-amber-50/30"
                      }`}
                      onClick={() => fetchDocuments(student)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                            selectedStudent === student.id_stu
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gradient-to-r from-gray-500 to-gray-600"
                          }`}>
                            <FontAwesomeIcon icon={faUserGraduate} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-800 truncate">
                            {student.nom} {student.prenom}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-2">
                              <FontAwesomeIcon icon={faIdCard} />
                              ID: {student.id_stu}
                            </span>
                            <span className="text-sm text-gray-500 truncate flex items-center gap-2">
                              <FontAwesomeIcon icon={faIdCard} />
                              {student.cin}
                            </span>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          selectedStudent === student.id_stu ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne Documents */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faListAlt} />
                      Documents de l'Étudiant
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FontAwesomeIcon icon={faEye} />
                      {selectedStudentInfo 
                        ? `${selectedStudentInfo.nom} ${selectedStudentInfo.prenom}`
                        : "Sélectionnez un étudiant"
                      }
                    </p>
                  </div>
                  
                  {selectedStudent && (
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-semibold">
                      <FontAwesomeIcon icon={faClipboardCheck} />
                      {Object.values(documents).filter(Boolean).length}/{Object.keys(documents).length} documents
                    </div>
                  )}
                </div>
              </div>

              {/* Contenu Documents */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {!selectedStudent ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileAlt} className="w-12 h-12 text-blue-500" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">Aucun étudiant sélectionné</h4>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Veuillez sélectionner un étudiant dans la liste pour afficher ses documents.
                    </p>
                  </div>
                ) : Object.keys(documents).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileAlt} className="w-12 h-12 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Aucun document</h4>
                    <p className="text-gray-500">
                      Aucun document trouvé pour cet étudiant.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(documents).map((doc, index) => (
                      <div
                        key={doc}
                        className="bg-gray-50/50 rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md group cursor-pointer"
                        onClick={() => handleCheckboxChange(doc)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Checkbox Personnalisée */}
                            <div className="relative">
                              <div className={`w-6 h-6 rounded border-2 transition-all duration-300 ${
                                documents[doc]
                                  ? "bg-blue-600 border-blue-600 group-hover:bg-blue-700 group-hover:border-blue-700"
                                  : "bg-white border-gray-300 group-hover:border-amber-400"
                              }`}>
                                {documents[doc] && (
                                  <FontAwesomeIcon 
                                    icon={faCheckCircle} 
                                    className="w-4 h-4 text-white mx-auto mt-0.5" 
                                  />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1">
                              <FontAwesomeIcon 
                                icon={getDocumentIcon(doc)} 
                                className={`text-lg ${
                                  documents[doc] ? "text-blue-500" : "text-gray-400"
                                }`} 
                              />
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors capitalize">
                                  {doc.replace(/_/g, " ")}
                                </h5>
                              </div>
                            </div>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                            documents[doc]
                              ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                              : "bg-red-100 text-red-800 group-hover:bg-red-200"
                          }`}>
                            {documents[doc] ? (
                              <>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Complété
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faTimesCircle} />
                                Manquant
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
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

export default Document;