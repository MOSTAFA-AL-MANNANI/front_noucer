import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUsers,
  faChartBar,
  faFileExcel,
  faSave,
  faDownload,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faUserGraduate,
  faIdCard,
  faExclamationTriangle,
  faClipboardCheck,
  faBook,
  faFilter,
  faCalendarCheck,
  faUserCheck,
  faUserSlash,
  faInfoCircle,
  faUniversity
} from '@fortawesome/free-solid-svg-icons';

export default function MarkAttendance() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Fonction pour afficher les alertes SweetAlert2
  const showAlert = (title, text, type = "success") => {
    Swal.fire({
      title,
      text,
      icon: type,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  };

  // Charger les sections au chargement de la page
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get("/sections");
        setSections(res.data.data || res.data);
        
        Swal.fire({
          title: 'Chargement réussi',
          text: `${res.data.data?.length || res.data.length} section(s) chargée(s)`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } catch (err) {
        console.error("Erreur chargement sections:", err);
        showAlert("Erreur", "Erreur lors du chargement des sections", "error");
      }
    };
    fetchSections();
  }, []);

  // Lors de la sélection de la section et de la date
  const handleSectionSelection = async (sectionId) => {
    if (!sectionId) return;
    
    setSelectedSection(sectionId);
    setStudents([]);
    setAttendanceData({});
    setSectionLoading(true);

    try {
      // Récupérer les étudiants de la section
      const res = await api.get(`/section/${sectionId}/students`);
      const studentsData = res.data.data || res.data;
      setStudents(studentsData);

      // Récupérer les données de présence pour la date spécifiée
      try {
        const attendanceRes = await api.get(`/attendance/section/${sectionId}/date/${date}`);
        const existingAttendances = attendanceRes.data.data || [];

        // Initialiser les données de présence basées sur les données existantes
        const initialAttendance = {};
        studentsData.forEach((student) => {
          const existingAttendance = existingAttendances.find(
            (att) => att.student_id === student.id_stu
          );
          
          if (existingAttendance) {
            initialAttendance[student.id_stu] = { 
              present: existingAttendance.present === 1,
              reason: existingAttendance.reason || "" 
            };
          } else {
            initialAttendance[student.id_stu] = { 
              present: true, 
              reason: "" 
            };
          }
        });
        
        setAttendanceData(initialAttendance);
        
        Swal.fire({
          title: 'Données chargées',
          text: `${studentsData.length} étudiant(s) trouvé(s) - Présences chargées`,
          icon: 'info',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } catch (attendanceErr) {
        const initialAttendance = {};
        studentsData.forEach((student) => {
          initialAttendance[student.id_stu] = { 
            present: true,
            reason: "" 
          };
        });
        setAttendanceData(initialAttendance);
        
        Swal.fire({
          title: 'Nouvelle feuille',
          text: 'Nouvelle feuille de présence créée',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    } catch (err) {
      console.error("Erreur chargement données:", err);
      showAlert("Erreur", "Erreur lors du chargement des données", "error");
    } finally {
      setSectionLoading(false);
    }
  };

  // Changer la date
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedSection) {
      handleSectionSelection(selectedSection);
    }
  };

  // Changer l'état de présence
  const toggleStudentAttendance = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: !prev[studentId].present,
        reason: !prev[studentId].present ? "" : prev[studentId].reason,
      },
    }));
  };

  // Mettre à jour la raison d'absence
  const updateAbsenceReason = (studentId, reason) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  // Soumettre les données de présence
  const submitAttendance = async () => {
    if (!selectedSection) {
      showAlert("Attention", "Veuillez sélectionner une section", "warning");
      return;
    }

    if (students.length === 0) {
      showAlert("Attention", "Aucun étudiant trouvé dans cette section", "warning");
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmer l\'enregistrement',
      html: `Voulez-vous enregistrer les présences pour <strong>${students.length} étudiant(s)</strong> ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, enregistrer !',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const attendancePayload = students.map((student) => {
        const studentId = student.id_stu;
        if (!studentId) {
          throw new Error(`ID étudiant manquant pour: ${student.nom} ${student.prenom}`);
        }

        return {
          student_id: studentId,
          section_id: parseInt(selectedSection),
          date: date,
          present: attendanceData[studentId]?.present ? 1 : 0,
          reason: attendanceData[studentId]?.reason || "",
        };
      });

      const response = await api.post("/mark-attendance", { 
        attendances: attendancePayload 
      });
      
      if (response.data.success) {
        await Swal.fire({
          title: 'Succès !',
          text: response.data.message || 'Présences enregistrées avec succès',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      } else {
        showAlert("Erreur", response.data.message || 'Erreur lors de l\'enregistrement', "error");
      }
    } catch (err) {
      console.error("Erreur soumission présence:", err);
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        showAlert("Erreur de validation", validationErrors.join(', '), "error");
      } else if (err.response?.data?.message) {
        showAlert("Erreur", err.response.data.message, "error");
      } else {
        showAlert("Erreur", "Erreur lors de l'enregistrement des présences", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Exporter vers Excel
  const exportToExcel = () => {
    if (students.length === 0) {
      showAlert("Aucune donnée", "Aucune donnée à exporter", "warning");
      return;
    }

    Swal.fire({
      title: 'Exporter en Excel ?',
      text: `Voulez-vous exporter les présences de ${students.length} étudiant(s) ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, exporter !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        const excelData = students.map((student) => {
          const studentId = student.id_stu;
          const isPresent = attendanceData[studentId]?.present;
          const status = isPresent ? "Présent" : "Absent";
          const reason = attendanceData[studentId]?.reason || "";
          
          return {
            "ID Étudiant": studentId,
            "Nom": student.nom,
            "Prénom": student.prenom,
            "Statut": status,
            "Raison d'absence": reason,
            "Date": date,
            "Section": sections.find(s => s.id == selectedSection)?.name || ""
          };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "Présences");

        const fileName = `presences_${sections.find(s => s.id == selectedSection)?.name || 'section'}_${date}.xlsx`;
        XLSX.writeFile(wb, fileName);

        Swal.fire({
          title: 'Export réussi !',
          text: 'Fichier Excel généré avec succès',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    });
  };

  // Statistiques de présence
  const getAttendanceStats = () => {
    const presentCount = students.filter(
      (student) => attendanceData[student.id_stu]?.present
    ).length;
    const absentCount = students.length - presentCount;
    
    return { presentCount, absentCount };
  };

  const { presentCount, absentCount } = getAttendanceStats();

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
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  Gestion des Présences
                </h1>
                <p className="text-blue-100 text-lg font-medium flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  Enregistrement et gestion de la présence des étudiants
                </p>
              </div>

              {/* Sélecteur de Date */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Date de Présence
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-64 bg-white/90 border-2 border-white/50 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Contrôles Principaux */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Sélecteur de Section */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} />
                  Sélectionner une Section
                </h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Choisissez une section pour gérer les présences
                </p>
              </div>
              <div className="p-6">
                <select
                  value={selectedSection}
                  onChange={(e) => handleSectionSelection(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  disabled={sectionLoading}
                >
                  <option value="">-- Choisir une section --</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name} - {section.capacity} étudiants
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg border border-amber-400 transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FontAwesomeIcon icon={faChartBar} className="text-xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Statistiques
                    </h2>
                    <p className="text-amber-100 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} />
                      {students.length} étudiant{students.length !== 1 ? 's' : ''} au total
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm border border-white/30">
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faUserCheck} />
                    {presentCount}
                  </div>
                  <div className="text-amber-100 text-sm font-medium">Présents</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm border border-white/30">
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faUserSlash} />
                    {absentCount}
                  </div>
                  <div className="text-amber-100 text-sm font-medium">Absents</div>
                </div>
              </div>
            </div>
          </div>

          {/* État de Chargement */}
          {sectionLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Chargement des étudiants...
                </p>
              </div>
            </div>
          )}

          {/* Liste des Étudiants */}
          {students.length > 0 && !sectionLoading && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-6">
              
              {/* En-tête de la Liste */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Liste des Étudiants
                      </h2>
                      <p className="text-blue-100 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBook} />
                        {students.length} étudiant{students.length !== 1 ? 's' : ''} - Section {sections.find(s => s.id == selectedSection)?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={exportToExcel}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-400 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileExcel} />
                    Exporter Excel
                  </button>
                </div>
              </div>

              {/* Grille des Étudiants */}
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {students.map((student, index) => {
                    const studentId = student.id_stu;
                    const isPresent = attendanceData[studentId]?.present;
                    
                    return (
                      <div
                        key={studentId}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                          isPresent
                            ? "border-green-300 bg-gradient-to-r from-green-50 to-green-100/50 hover:border-green-400"
                            : "border-red-300 bg-gradient-to-r from-red-50 to-red-100/50 hover:border-red-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                              isPresent
                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                : "bg-gradient-to-r from-red-500 to-red-600"
                            }`}>
                              <FontAwesomeIcon icon={faUserGraduate} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                {student.nom} {student.prenom}
                              </h3>
                              <p className="text-sm text-gray-600 font-mono flex items-center gap-2">
                                <FontAwesomeIcon icon={faIdCard} />
                                ID: {studentId}
                              </p>
                            </div>
                          </div>
                          
                          {/* Bouton de Statut */}
                          <button
                            onClick={() => toggleStudentAttendance(studentId)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 flex items-center gap-2 ${
                              isPresent
                                ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                                : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                            }`}
                          >
                            {isPresent ? (
                              <>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Présent
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faTimesCircle} />
                                Absent
                              </>
                            )}
                          </button>
                        </div>

                        {/* Champ Raison d'Absence */}
                        {!isPresent && (
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              Raison de l'absence
                            </label>
                            <input
                              type="text"
                              placeholder="Entrez la raison de l'absence..."
                              value={attendanceData[studentId]?.reason || ""}
                              onChange={(e) => updateAbsenceReason(studentId, e.target.value)}
                              className="w-full p-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Boutons d'Action */}
            {students.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={submitAttendance}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      <span>Enregistrer les Présences</span>
                    </>
                  )}
                </button>

                <button
                  onClick={exportToExcel}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Exporter Excel</span>
                </button>
              </div>
            )}
          </div>

          {/* État Aucune Section Sélectionnée */}
          {!selectedSection && !sectionLoading && (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUniversity} className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Sélectionnez une Section
                </h3>
                <p className="text-gray-600 text-lg">
                  Choisissez une section dans la liste pour commencer l'enregistrement des présences.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}