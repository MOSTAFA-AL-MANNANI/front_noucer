import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserGraduate,
  faBook,
  faClipboardList,
  faTrophy,
  faCheckCircle,
  faTimesCircle,
  faPlusCircle,
  faListAlt,
  faUniversity,
  faChalkboardTeacher,
  faIdCard,
  faChartLine,
  faSpinner,
  faCheck,
  faTimes,
  faEye,
  faFilter,
  faCog,
  faArrowRight,
  faUserCheck,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

export default function AssignStudents() {
  const [filieres, setFilieres] = useState([]);
  const [sections, setSections] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filiereLoading, setFiliereLoading] = useState(false);

  // Fonction pour afficher les alertes SweetAlert2
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

  // Charger toutes les filières au chargement de la page
  useEffect(() => {
    setFiliereLoading(true);
    api.get("/filieres")
      .then((res) => setFilieres(res.data))
      .catch(err => {
        console.error("Erreur filières:", err);
        showAlert("Erreur", "Impossible de charger les filières", "error");
      })
      .finally(() => setFiliereLoading(false));
  }, []);

  // Lors de la sélection de la filière
  const handleFiliereChange = async (filiereName) => {
    if (!filiereName) return;
    
    setLoading(true);
    setSelectedFiliere(filiereName);
    setSelectedSection("");
    setTopStudents([]);
    setSelectedStudents([]);
    setSectionStudents([]);

    try {
      // Récupérer les sections de la filière
      const secRes = await api.get(`/sections/by-filiere/${filiereName}`);
      setSections(secRes.data);
      
      showAlert("Filière sélectionnée", `Sections de ${filiereName} chargées`, "success");
    } catch (error) {
      console.error("Erreur lors du chargement des sections:", error);
      showAlert("Erreur", "Impossible de charger les sections de cette filière", "error");
    } finally {
      setLoading(false);
    }
  };

  // Lors de la sélection de la section
  const handleSectionChange = async (sectionId) => {
    if (!sectionId) return;
    
    setLoading(true);
    setSelectedSection(sectionId);
    setSelectedStudents([]);

    try {
      // Récupérer les meilleurs 30 étudiants de la filière non inscrits
      const topRes = await api.get(`/top-students?filiere=${selectedFiliere}`);
      setTopStudents(topRes.data);

      // Récupérer les étudiants déjà inscrits dans cette section
      const secStuRes = await api.get(`/section/${sectionId}/students`);
      setSectionStudents(secStuRes.data);
      
      const sectionName = sections.find(s => s.id === sectionId)?.name;
      showAlert("Section sélectionnée", `Étudiants chargés pour ${sectionName}`, "info");
    } catch (error) {
      console.error("Erreur lors du chargement des étudiants:", error);
      showAlert("Erreur", "Impossible de charger les étudiants", "error");
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner/Désélectionner un étudiant
  const toggleStudent = (id_stu) => {
    setSelectedStudents((prev) =>
      prev.includes(id_stu)
        ? prev.filter((id) => id !== id_stu)
        : [...prev, id_stu]
    );
  };

  // Inscrire les étudiants sélectionnés dans la section
  const handleEnroll = async () => {
    if (!selectedSection || selectedStudents.length === 0) {
      showAlert("Attention", "Veuillez sélectionner une section et des étudiants", "warning");
      return;
    }
    
    const result = await Swal.fire({
      title: 'Confirmer l\'inscription',
      text: `Voulez-vous inscrire ${selectedStudents.length} étudiant(s) dans cette section ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, inscrire !',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;
    
    setLoading(true);
    try {
      const res = await api.post("/enroll-students", {
        section_id: selectedSection,
        student_ids: selectedStudents,
      });
      
      showAlert("Succès", `${res.data.message}`, "success");
      
      // Recharger les étudiants inscrits après l'inscription
      const secStuRes = await api.get(`/section/${selectedSection}/students`);
      setSectionStudents(secStuRes.data);
      setSelectedStudents([]);
    } catch (err) {
      console.error(err);
      showAlert("Erreur", "Erreur lors de l'inscription des étudiants", "error");
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner tous les étudiants disponibles
  const selectAllStudents = () => {
    const availableStudents = topStudents.filter(
      (stu) => !sectionStudents.some((s) => s.id_stu === stu.id_stu)
    );
    if (availableStudents.length === 0) {
      showAlert("Aucun étudiant", "Tous les étudiants sont déjà inscrits", "info");
      return;
    }
    setSelectedStudents(availableStudents.map(stu => stu.id_stu));
    
    Swal.fire({
      title: 'Tous sélectionnés',
      text: `${availableStudents.length} étudiant(s) sélectionné(s)`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  };

  // Désélectionner tous les étudiants
  const deselectAllStudents = () => {
    if (selectedStudents.length === 0) return;
    setSelectedStudents([]);
    
    Swal.fire({
      title: 'Sélection annulée',
      text: 'Tous les étudiants ont été désélectionnés',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
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
                  <FontAwesomeIcon icon={faUserPlus} />
                  Attribution des Étudiants
                </h1>
                <p className="text-blue-100 text-lg font-medium flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardList} />
                  Attribuez les meilleurs étudiants aux sections appropriées
                </p>
              </div>

              {/* Indicateur de Statut */}
              {selectedFiliere && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faUsers} />
                      {topStudents.filter(stu => 
                        !sectionStudents.some(s => s.id_stu === stu.id_stu)
                      ).length}
                    </div>
                    <div className="text-amber-200 text-sm font-medium flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faUserGraduate} />
                      Étudiants disponibles
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sélections */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            
            {/* Sélection de la Filière */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FontAwesomeIcon icon={faUniversity} className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Sélectionner la Filière
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une filière pour voir ses sections
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <select
                  value={selectedFiliere}
                  onChange={(e) => handleFiliereChange(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  disabled={filiereLoading}
                >
                  <option value="">-- Choisir une filière --</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sélection de la Section */}
            {sections.length > 0 && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-r from-gray-50 to-amber-50/50 p-8 border-b border-gray-200/60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="text-xl text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Sélectionner la Section
                      </h3>
                      <p className="text-gray-600">
                        Choisissez une section pour l'attribution
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <select
                    value={selectedSection}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                    disabled={loading}
                  >
                    <option value="">-- Choisir une section --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Indicateur de Chargement */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faCog} className="animate-spin" />
                  Chargement en cours...
                </p>
              </div>
            </div>
          )}

          {/* Meilleurs Étudiants */}
          {topStudents.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
              
              {/* En-tête de la Liste */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <FontAwesomeIcon icon={faTrophy} className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Meilleurs Étudiants
                      </h2>
                      <p className="text-blue-100 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} />
                        Filière {selectedFiliere} - {topStudents.filter(stu => 
                          !sectionStudents.some(s => s.id_stu === stu.id_stu)
                        ).length} étudiant(s) disponible(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={selectAllStudents}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-amber-300 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Tout sélectionner
                    </button>
                    <button
                      onClick={deselectAllStudents}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-400 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                      Tout désélectionner
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des Étudiants */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {topStudents.map((student) => {
                    const alreadyEnrolled = sectionStudents.some(
                      (s) => s.id_stu === student.id_stu
                    );
                    if (alreadyEnrolled) return null;

                    return (
                      <div
                        key={student.id_stu}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg ${
                          selectedStudents.includes(student.id_stu)
                            ? "border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md scale-105"
                            : "border-gray-100 bg-gray-50/50 hover:border-amber-300 hover:bg-amber-50/30"
                        }`}
                        onClick={() => toggleStudent(student.id_stu)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                              selectedStudents.includes(student.id_stu)
                                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                : "bg-gradient-to-r from-gray-500 to-gray-600"
                            }`}>
                              <FontAwesomeIcon icon={faUserGraduate} />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                {student.nom} {student.prenom}
                              </h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-2">
                                  <FontAwesomeIcon icon={faIdCard} />
                                  ID: {student.id_stu}
                                </span>
                                <span className="text-sm font-bold text-blue-600 flex items-center gap-2">
                                  <FontAwesomeIcon icon={faChartLine} />
                                  Score: {student.total} pts
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            selectedStudents.includes(student.id_stu)
                              ? "bg-amber-400 border-amber-400"
                              : "bg-white border-gray-300"
                          }`}>
                            {selectedStudents.includes(student.id_stu) && (
                              <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bouton d'Inscription */}
          {selectedStudents.length > 0 && (
            <div className="flex justify-center mb-8">
              <button
                onClick={handleEnroll}
                disabled={loading}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold py-5 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 text-xl"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    <span>Inscription en cours...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserCheck} />
                    <span>Inscrire {selectedStudents.length} étudiant(s)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Étudiants Inscrits */}
          {sectionStudents.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 border-b border-green-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <FontAwesomeIcon icon={faListAlt} className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Étudiants Inscrits
                      </h2>
                      <p className="text-green-100 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} />
                        {sectionStudents.length} étudiant(s) dans cette section
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {sectionStudents.map((student) => (
                    <div
                      key={student.id_stu}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center font-semibold text-white">
                          <FontAwesomeIcon icon={faUserGraduate} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {student.nom} {student.prenom}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 font-mono bg-green-100 px-2 py-1 rounded-lg flex items-center gap-2">
                              <FontAwesomeIcon icon={faIdCard} />
                              ID: {student.id_stu}
                            </span>
                            <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
                              <FontAwesomeIcon icon={faBook} />
                              {student.filiere}
                            </span>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* État Aucune Filière Sélectionnée */}
          {!selectedFiliere && !filiereLoading && (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUniversity} className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Sélectionnez une Filière
                </h3>
                <p className="text-gray-600 text-lg">
                  Choisissez une filière dans la liste pour commencer l'attribution des étudiants.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}