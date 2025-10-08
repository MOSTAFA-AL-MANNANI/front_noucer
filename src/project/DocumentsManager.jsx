import React, { useEffect, useState } from "react";
import api from "./api";

export default function DocumentsManager() {
  const [filieres, setFilieres] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState({
    photo: 0,
    cin: 0,
    cv: 0,
    bac: 0,
    convocation: 0,
    radiographies_thoraciques: 0,
    bonne_conduite: 0,
  });
  const [missingDocs, setMissingDocs] = useState([]);
  const [message, setMessage] = useState("");

  // 🧩 جلب الشعب
  useEffect(() => {
    api.get("/filieres").then((res) => {
      setFilieres(res.data);
    });
  }, []);

  // 👩‍🎓 جلب التلاميذ حسب الشعبة
  const fetchStudentsByFiliere = async (filiere) => {
    setSelectedFiliere(filiere);
    setSelectedStudent(null);
    resetDocuments();
    const res = await api.get(`/top-students/${filiere}`);
    setStudents(res.data);
  };

  // 📑 جلب وثائق التلميذ
  const fetchStudentDocuments = async (studentId) => {
    setSelectedStudent(studentId);
    try {
      const res = await api.get(`/documents/missing/${studentId}`);
      if (res.data && res.data.data) {
        setDocuments({
          photo: res.data.data.photo ? 1 : 0,
          cin: res.data.data.cin ? 1 : 0,
          cv: res.data.data.cv ? 1 : 0,
          bac: res.data.data.bac ? 1 : 0,
          convocation: res.data.data.convocation ? 1 : 0,
          radiographies_thoraciques: res.data.data.radiographies_thoraciques
            ? 1
            : 0,
          bonne_conduite: res.data.data.bonne_conduite ? 1 : 0,
        });
      } else resetDocuments();
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Erreur lors du chargement des documents.");
    }
  };

  // 🔄 إعادة تعيين الحقول
  const resetDocuments = () => {
    setDocuments({
      photo: 0,
      cin: 0,
      cv: 0,
      bac: 0,
      convocation: 0,
      radiographies_thoraciques: 0,
      bonne_conduite: 0,
    });
  };

  // ✅ تحديث حالة checkbox (1 أو 0)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setDocuments({ ...documents, [name]: checked ? 1 : 0 });
  };

  // 💾 حفظ أو تعديل الوثائق
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return alert("Choisissez un étudiant !");
    try {
      await api.post("/documents", {
        student_id: selectedStudent,
        ...documents,
      });
      setMessage("📎 Documents enregistrés avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l’enregistrement.");
    }
  };

  // 🔍 التحقق من الوثائق الناقصة
  const checkMissing = async () => {
    if (!selectedStudent) return alert("Choisissez un étudiant !");
    try {
      const res = await api.get(`/documents/missing/${selectedStudent}`);
      setMissingDocs(res.data.missing_documents || []);
      setMessage("");
    } catch (err) {
      setMessage("⚠️ Étudiant non trouvé.");
      setMissingDocs([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        📂 Gestion des Documents Étudiants
      </h2>

      {/* اختيار الشعبة */}
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
          Sélectionner une filière :
        </label>
        <select
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          value={selectedFiliere}
          onChange={(e) => fetchStudentsByFiliere(e.target.value)}
        >
          <option value="">-- Choisir une filière --</option>
          {filieres.map((f, i) => (
            <option key={i} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* عرض التلاميذ */}
      {students.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="w-full border text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="p-2">Nom</th>
                <th className="p-2">Prénom</th>
                <th className="p-2">Filière</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => (
                <tr
                  key={stu.id_stu}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-2">{stu.nom}</td>
                  <td className="p-2">{stu.prenom}</td>
                  <td className="p-2">{stu.name}</td>
                  <td className="p-2">
                    <button
                      onClick={() => fetchStudentDocuments(stu.id_stu)}
                      className={`px-3 py-1 rounded-lg ${
                        selectedStudent === stu.id_stu
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Voir documents
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* إذا تم اختيار التلميذ */}
      {selectedStudent && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">
            📋 Documents de l’étudiant #{selectedStudent}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(documents).map((doc) => (
              <label
                key={doc}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  name={doc}
                  checked={documents[doc] === 1}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="capitalize">{doc.replaceAll("_", " ")}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={checkMissing}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
            >
              🔍 Vérifier Manquants
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              💾 Enregistrer
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-green-600 dark:text-green-400 font-medium">
              {message}
            </p>
          )}

          {missingDocs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">
                Documents manquants :
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200">
                {missingDocs.map((doc, i) => (
                  <li key={i}>{doc.replaceAll("_", " ")}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
