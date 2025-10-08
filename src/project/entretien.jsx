import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./sidebar";

export default function Entretien() {
  const [personels, setPersonels] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [scores, setScores] = useState({});
  const [totalP, setTotalP] = useState(0);
  const [totalT, setTotalT] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // 1) جلب بيانات الطالب أولاً ليأخذ الشعبة
        const resStudent = await api.get(`/students/${id}`);
        setStudent(resStudent.data);
        const filiere = resStudent.data.filiere || "";

        // 2) جلب الأسئلة الشخصية دائماً
        const resP = await api.get("/personels");
        setPersonels(resP.data);

        // 3) جلب الأسئلة التقنية حسب الشعبة
        //    endpoint يدعم ?filiere=...
        const resT = await api.get("/techniques", {
          params: { filiere }
        });
        setTechniques(resT.data);
      } catch (err) {
        console.error("Erreur chargement entretien:", err);
        alert("خطأ في جلب بيانات المقابلة. تحقق من الخادم.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleScoreChange = (idItem, type, value) => {
    const val = Math.min(Math.max(Number(value) || 0, 0), 20);
    const newScores = { ...scores, [`${type}-${idItem}`]: val };
    setScores(newScores);

    const sumP = personels.reduce(
      (acc, p) => acc + (newScores[`P-${p.id}`] || 0),
      0
    );
    const sumT = techniques.reduce(
      (acc, t) => acc + (newScores[`T-${t.id}`] || 0),
      0
    );

    setTotalP(sumP);
    setTotalT(sumT);
    setTotal(sumP + sumT);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/resultats", {
        id_stu: id,
        scoreP: totalP,
        scoreT: totalT,
        scoreS: 0,
        total: total,
      });
      alert("✅ تم حفظ النتيجة بنجاح");
      navigate("/studentlist");
    } catch (err) {
      console.error("Erreur enregistrement", err);
      alert("❌ خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">⏳ جاري جلب بيانات المقابلة...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-3/12"><Sidebar/></div>
      <div className="w-9/12 p-6">
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold">📝 Entretien Étudiant #{id}</h2>
          <p className="text-gray-600">
            {student ? `إسم: ${student.prenom} ${student.nom} — Filière: ${student.filiere}` : ''}
          </p>
        </div>

        {/* Questions Personnelles */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">👤 Questions Personnelles</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Note (0-20)</th>
                </tr>
              </thead>
              <tbody>
                {personels.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-3">{p.question}</td>
                    <td className="px-6 py-3">
                      <input type="number" min="0" max="20"
                        value={scores[`P-${p.id}`] || ""}
                        onChange={(e) => handleScoreChange(p.id, "P", e.target.value)}
                        className="w-20 px-3 py-2 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Questions Techniques (حسب الشعبة) */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-800">⚙️ Questions Techniques — Filière: {student?.filiere}</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            {techniques.length === 0 ? (
              <div className="text-gray-600">لا توجد أسئلة تقنية لهذه الشعبة.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Note (0-20)</th>
                  </tr>
                </thead>
                <tbody>
                  {techniques.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-3">{t.question}</td>
                      <td className="px-6 py-3">
                        <input type="number" min="0" max="20"
                          value={scores[`T-${t.id}`] || ""}
                          onChange={(e) => handleScoreChange(t.id, "T", e.target.value)}
                          className="w-20 px-3 py-2 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Résultats & Save */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">{totalP}</div>
              <div className="text-sm">Score Personnel</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">{totalT}</div>
              <div className="text-sm">Score Technique</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm">Total</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : '💾 Sauvegarder Résultats'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
