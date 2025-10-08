import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";

export default function AssignStudents() {
  const [filieres, setFilieres] = useState([]);
  const [sections, setSections] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // جلب جميع الشعب عند تحميل الصفحة
  useEffect(() => {
    api.get("/filieres").then((res) => setFilieres(res.data));
  }, []);

  // عند اختيار الشعبة
  const handleFiliereChange = async (filiereName) => {
    setLoading(true);
    setSelectedFiliere(filiereName);
    setSelectedSection("");
    setTopStudents([]);
    setSelectedStudents([]);
    setSectionStudents([]);

    try {
      // جلب الأقسام التابعة للشعبة
      const secRes = await api.get(`/sections/by-filiere/${filiereName}`);
      setSections(secRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des sections:", error);
    } finally {
      setLoading(false);
    }
  };

  // عند اختيار القسم
  const handleSectionChange = async (sectionId) => {
    setLoading(true);
    setSelectedSection(sectionId);
    setSelectedStudents([]);

    try {
      // جلب أفضل 30 تلميذ في الشعبة غير المسجلين
      const topRes = await api.get(`/top-students?filiere=${selectedFiliere}`);
      setTopStudents(topRes.data);

      // جلب التلاميذ المسجلين في هذا القسم
      const secStuRes = await api.get(`/section/${sectionId}/students`);
      setSectionStudents(secStuRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des étudiants:", error);
    } finally {
      setLoading(false);
    }
  };

  // اختيار/إلغاء اختيار تلميذ
  const toggleStudent = (id_stu) => {
    setSelectedStudents((prev) =>
      prev.includes(id_stu)
        ? prev.filter((id) => id !== id_stu)
        : [...prev, id_stu]
    );
  };

  // تسجيل التلاميذ المختارين في القسم
  const handleEnroll = async () => {
    if (!selectedSection || selectedStudents.length === 0) {
      alert("⚠️ Veuillez sélectionner une section et des étudiants");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/enroll-students", {
        section_id: selectedSection,
        student_ids: selectedStudents,
      });
      setMessage(res.data.message);
      // إعادة تحميل التلاميذ المسجلين في القسم بعد التسجيل
      const secStuRes = await api.get(`/section/${selectedSection}/students`);
      setSectionStudents(secStuRes.data);
      setSelectedStudents([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner tous les étudiants disponibles
  const selectAllStudents = () => {
    const availableStudents = topStudents.filter(
      (stu) => !sectionStudents.some((s) => s.id_stu === stu.id_stu)
    );
    setSelectedStudents(availableStudents.map(stu => stu.id_stu));
  };

  // Désélectionner tous les étudiants
  const deselectAllStudents = () => {
    setSelectedStudents([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* En-tête */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent mb-3">
                Attribution des Étudiants aux Sections
              </h1>
              <p className="text-gray-600 text-lg">
                Attribuez les meilleurs étudiants aux sections appropriées
              </p>
            </div>

            {/* Sélections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              {/* Sélection de la filière */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-8 bg-blue-600 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-gray-800">Sélectionner la Filière</h2>
                </div>
                <select
                  value={selectedFiliere}
                  onChange={(e) => handleFiliereChange(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white text-gray-700 font-medium"
                >
                  <option value="">-- Choisir une filière --</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection de la section */}
              {sections.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-8 bg-amber-400 rounded-full mr-3"></div>
                    <h2 className="text-xl font-bold text-gray-800">Sélectionner la Section</h2>
                  </div>
                  <select
                    value={selectedSection}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 bg-white text-gray-700 font-medium"
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
              )}
            </div>

            {/* Indicateur de chargement */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Meilleurs étudiants */}
            {topStudents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-6 transition-all duration-300 hover:shadow-xl">
                
                {/* En-tête de la liste */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="text-xl font-bold text-white mb-2 lg:mb-0">
                      Meilleurs Étudiants - {selectedFiliere}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllStudents}
                        className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg font-semibold hover:bg-amber-500 transform hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={deselectAllStudents}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transform hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedStudents.length} étudiant(s) sélectionné(s) sur {topStudents.filter(stu => 
                      !sectionStudents.some(s => s.id_stu === stu.id_stu)
                    ).length} disponible(s)
                  </p>
                </div>

                {/* Liste des étudiants */}
                <div className="max-h-96 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topStudents.map((stu) => {
                      const alreadyEnrolled = sectionStudents.some(
                        (s) => s.id_stu === stu.id_stu
                      );
                      if (alreadyEnrolled) return null;

                      return (
                        <div
                          key={stu.id_stu}
                          className={`border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                            selectedStudents.includes(stu.id_stu)
                              ? "border-amber-400 bg-amber-50 shadow-md"
                              : "border-gray-200 bg-gray-50 hover:border-amber-300"
                          }`}
                          onClick={() => toggleStudent(stu.id_stu)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedStudents.includes(stu.id_stu)
                                ? "bg-amber-400 border-amber-400"
                                : "bg-white border-gray-300"
                            }`}>
                              {selectedStudents.includes(stu.id_stu) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {stu.nom} {stu.prenom}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Score total: <span className="font-bold text-blue-600">{stu.total} points</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bouton d'inscription */}
            {selectedStudents.length > 0 && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleEnroll}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-500 hover:to-amber-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      <span>Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Inscrire {selectedStudents.length} étudiant(s)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Message de statut */}
            {message && (
              <div className={`rounded-2xl p-4 mb-6 text-center font-semibold transition-all duration-300 ${
                message.includes("✅") || message.includes("succès")
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : message.includes("❌") || message.includes("Erreur")
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}>
                {message}
              </div>
            )}

            {/* Étudiants inscrits */}
            {sectionStudents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">
                    Étudiants Inscrits dans cette Section
                  </h3>
                  <p className="text-green-100 text-sm mt-1">
                    {sectionStudents.length} étudiant(s) actuellement inscrit(s)
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionStudents.map((stu) => (
                      <div
                        key={stu.id_stu}
                        className="border border-green-200 rounded-xl p-4 bg-green-50 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {stu.nom} {stu.prenom}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Filière: <span className="font-medium text-blue-600">{stu.filiere}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}