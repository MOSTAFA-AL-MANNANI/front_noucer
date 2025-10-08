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

  // جلب الأقسام عند تحميل الصفحة
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get("/sections");
        setSections(res.data.data || res.data);
      } catch (err) {
        console.error("Error loading sections:", err);
        setMessage("❌ Erreur lors du chargement des sections");
      }
    };
    fetchSections();
  }, []);

  // عند اختيار القسم والتاريخ
  const handleSectionSelection = async (sectionId) => {
    if (!sectionId) return;
    
    setSelectedSection(sectionId);
    setStudents([]);
    setAttendanceData({});
    setMessage("");
    setSectionLoading(true);

    try {
      // جلب الطلاب من القسم
      const res = await api.get(`/section/${sectionId}/students`);
      const studentsData = res.data.data || res.data;
      setStudents(studentsData);

      // جلب بيانات الحضور للتاريخ المحدد
      try {
        const attendanceRes = await api.get(`/attendance/section/${sectionId}/date/${date}`);
        const existingAttendances = attendanceRes.data.data || [];

        // تهيئة بيانات الحضور بناءً على البيانات الموجودة
        const initialAttendance = {};
        studentsData.forEach((student) => {
          const existingAttendance = existingAttendances.find(
            (att) => att.student_id === student.id_stu
          );
          
          // إذا وجدنا سجل حضور، نستخدم حالته (1 للحاضر، 0 للغائب)
          if (existingAttendance) {
            initialAttendance[student.id_stu] = { 
              present: existingAttendance.present === 1, // تحويل 1/0 إلى true/false
              reason: existingAttendance.reason || "" 
            };
          } else {
            // إذا لم يوجد سجل، نعتبره حاضراً (true = 1)
            initialAttendance[student.id_stu] = { 
              present: true, 
              reason: "" 
            };
          }
        });
        
        setAttendanceData(initialAttendance);
      } catch (attendanceErr) {
        // إذا لم توجد بيانات حضور، نبدأ بجميع الطلاب حاضرين
        const initialAttendance = {};
        studentsData.forEach((student) => {
          initialAttendance[student.id_stu] = { 
            present: true, // 1 = حاضر
            reason: "" 
          };
        });
        setAttendanceData(initialAttendance);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setMessage("❌ Erreur lors du chargement des données");
    } finally {
      setSectionLoading(false);
    }
  };

  // تغيير التاريخ
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedSection) {
      handleSectionSelection(selectedSection);
    }
  };

  // تغيير حالة الحضور
  const toggleStudentAttendance = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: !prev[studentId].present, // true/false
        reason: !prev[studentId].present ? "" : prev[studentId].reason,
      },
    }));
  };

  // تحديث سبب الغياب
  const updateAbsenceReason = (studentId, reason) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  // إرسال بيانات الحضور
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
          present: attendanceData[studentId]?.present ? 1 : 0, // ← إرسال 1 للحاضر و 0 للغائب
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
      console.error("Error submitting attendance:", err);
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

  // تصدير إلى Excel
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

  // إحصائيات الحضور
  const getAttendanceStats = () => {
    const presentCount = students.filter(
      (student) => attendanceData[student.id_stu]?.present
    ).length;
    const absentCount = students.length - presentCount;
    
    return { presentCount, absentCount };
  };

  const { presentCount, absentCount } = getAttendanceStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar />

        {/* المحتوى الرئيسي */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* العنوان */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent mb-3">
                نظام الحضور والغياب
              </h1>
              <p className="text-gray-600 text-lg">
                تسجيل وإدارة حضور الطلاب
              </p>
            </div>

            {/* عناصر التحكم */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* اختيار القسم */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    اختر القسم
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => handleSectionSelection(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white text-gray-700 font-medium hover:border-blue-300"
                    disabled={sectionLoading}
                  >
                    <option value="">-- اختر القسم --</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name} - {section.capacity} طالب
                      </option>
                    ))}
                  </select>
                </div>

                {/* اختيار التاريخ */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 bg-white text-gray-700 font-medium hover:border-amber-300"
                  />
                </div>

                {/* الإحصائيات */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
                  <div className="text-center">
                    <div className="text-lg font-bold mb-2">الإحصائيات</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-500 rounded-lg p-2">
                        <div className="font-semibold">حاضرون</div>
                        <div className="text-sm font-bold">{presentCount}</div>
                      </div>
                      <div className="bg-red-500 rounded-lg p-2">
                        <div className="font-semibold">غائبون</div>
                        <div className="text-sm font-bold">{absentCount}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* حالة التحميل */}
            {sectionLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* قائمة الطلاب */}
            {students.length > 0 && !sectionLoading && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 mb-6">
                
                {/* عنوان القائمة */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-bold text-white">
                      قائمة الطلاب - {students.length} طالب
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 lg:mt-0">
                      <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>تصدير إكسل</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* شبكة الطلاب */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {students.map((student) => {
                      const studentId = student.id_stu;
                      const isPresent = attendanceData[studentId]?.present;
                      
                      return (
                        <div
                          key={studentId}
                          className={`border-2 rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] ${
                            isPresent
                              ? "border-green-300 bg-green-50 hover:border-green-400 hover:shadow-lg"
                              : "border-red-300 bg-red-50 hover:border-red-400 hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${
                                isPresent ? "bg-green-500" : "bg-red-500"
                              }`}></div>
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {student.nom} {student.prenom}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  الرقم: {studentId}
                                </p>
                              </div>
                            </div>
                            
                            {/* زر تغيير الحالة */}
                            <button
                              onClick={() => toggleStudentAttendance(studentId)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                                isPresent
                                  ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                                  : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                              }`}
                            >
                              {isPresent ? "🟢 حاضر" : "🔴 غائب"}
                            </button>
                          </div>

                          {/* حقل سبب الغياب */}
                          {!isPresent && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                سبب الغياب
                              </label>
                              <input
                                type="text"
                                placeholder="أدخل سبب الغياب..."
                                value={attendanceData[studentId]?.reason || ""}
                                onChange={(e) => updateAbsenceReason(studentId, e.target.value)}
                                className="w-full p-3 border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white"
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

            {/* قسم الإجراءات */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* أزرار الإجراءات */}
              {students.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={submitAttendance}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-500 hover:to-amber-600 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>حفظ بيانات الحضور</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={exportToExcel}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>تصدير لإكسل</span>
                  </button>
                </div>
              )}

              {/* رسالة الحالة */}
              {message && (
                <div className={`flex-1 text-center p-4 rounded-xl font-semibold transition-all duration-300 ${
                  message.includes("✅") || message.includes("succès")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : message.includes("❌") || message.includes("Erreur")
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                  {message}
                </div>
              )}
            </div>

            {/* حالة عدم وجود بيانات */}
            {!selectedSection && !sectionLoading && (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    اختر قسمًا
                  </h3>
                  <p className="text-gray-600">
                    اختر قسمًا من القائمة المنسدلة لبدء تسجيل الحضور.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}