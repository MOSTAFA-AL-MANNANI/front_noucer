import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function MarkAttendance() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Charger les sections au chargement de la page
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get("/sections");
        setSections(res.data.data || res.data);
      } catch (err) {
        console.error("Erreur chargement sections:", err);
        setMessage("❌ Erreur lors du chargement des sections");
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
    setMessage("");
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
      } catch (attendanceErr) {
        const initialAttendance = {};
        studentsData.forEach((student) => {
          initialAttendance[student.id_stu] = { 
            present: true,
            reason: "" 
          };
        });
        setAttendanceData(initialAttendance);
      }
    } catch (err) {
      console.error("Erreur chargement données:", err);
      setMessage("❌ Erreur lors du chargement des données");
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
      setMessage("⚠️ Veuillez sélectionner une section");
      return;
    }

    if (students.length === 0) {
      setMessage("⚠️ Aucun étudiant trouvé dans cette section");
      return;
    }

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
        setMessage(`✅ ${response.data.message || 'Présences enregistrées avec succès'}`);
      } else {
        setMessage(`❌ ${response.data.message || 'Erreur lors de l\'enregistrement'}`);
      }
      
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err) {
      console.error("Erreur soumission présence:", err);
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        setMessage(`❌ ${validationErrors.join(', ')}`);
      } else if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        setMessage("❌ Erreur lors de l'enregistrement des présences");
      }
    } finally {
      setLoading(false);
    }
  };

  // Exporter vers Excel
  const exportToExcel = () => {
    if (students.length === 0) {
      setMessage("⚠️ Aucune donnée à exporter");
      return;
    }

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

    setMessage("✅ Fichier Excel généré avec succès");
    setTimeout(() => setMessage(""), 3000);
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
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  Gestion des Présences
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Enregistrement et gestion de la présence des étudiants
                </p>
              </div>

              {/* Sélecteur de Date */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <label className="block text-white font-semibold mb-3">
                  📅 Date de Présence
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  🎯 Sélectionner une Section
                </h3>
                <p className="text-gray-600">
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
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Statistiques
                    </h2>
                    <p className="text-amber-100">
                      {students.length} étudiant{students.length !== 1 ? 's' : ''} au total
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm border border-white/30">
                  <div className="text-2xl font-bold text-white">{presentCount}</div>
                  <div className="text-amber-100 text-sm font-medium">Présents</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm border border-white/30">
                  <div className="text-2xl font-bold text-white">{absentCount}</div>
                  <div className="text-amber-100 text-sm font-medium">Absents</div>
                </div>
              </div>
            </div>
          </div>

          {/* État de Chargement */}
          {sectionLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Chargement des étudiants...</p>
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
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Liste des Étudiants
                      </h2>
                      <p className="text-blue-100">
                        {students.length} étudiant{students.length !== 1 ? 's' : ''} - Section {sections.find(s => s.id == selectedSection)?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={exportToExcel}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-400 flex items-center gap-2"
                  >
                    <span>📊</span>
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
                              {student.nom.charAt(0)}{student.prenom.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                {student.nom} {student.prenom}
                              </h3>
                              <p className="text-sm text-gray-600 font-mono">
                                ID: {studentId}
                              </p>
                            </div>
                          </div>
                          
                          {/* Bouton de Statut */}
                          <button
                            onClick={() => toggleStudentAttendance(studentId)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 ${
                              isPresent
                                ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                                : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                            }`}
                          >
                            {isPresent ? "✅ Présent" : "❌ Absent"}
                          </button>
                        </div>

                        {/* Champ Raison d'Absence */}
                        {!isPresent && (
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Enregistrer les Présences</span>
                    </>
                  )}
                </button>

                <button
                  onClick={exportToExcel}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  <span>📥</span>
                  <span>Exporter Excel</span>
                </button>
              </div>
            )}

            {/* Message de Statut */}
            {message && (
              <div className={`flex-1 w-full p-4 rounded-xl font-semibold text-center transition-all duration-300 ${
                message.includes("✅") || message.includes("succès")
                  ? "bg-green-100 text-green-800 border-2 border-green-200"
                  : message.includes("❌") || message.includes("Erreur")
                  ? "bg-red-100 text-red-800 border-2 border-red-200"
                  : "bg-blue-100 text-blue-800 border-2 border-blue-200"
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* État Aucune Section Sélectionnée */}
          {!selectedSection && !sectionLoading && (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
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