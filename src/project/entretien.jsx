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
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resP, resT] = await Promise.all([
          api.get("/personels"),
          api.get("/techniques"),
        ]);
        setPersonels(resP.data);
        setTechniques(resT.data);
      } catch (err) {
        console.error("Erreur chargement questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScoreChange = (id, type, value) => {
    const val = Math.min(Math.max(Number(value) || 0, 0), 20);
    const newScores = { ...scores, [`${type}-${id}`]: val };
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
      navigate("/studentlist");
      alert("✅ Résultat bien enregistré !");
    } catch (err) {
      console.error("Erreur enregistrement", err);
      alert("❌ Problème lors de l'enregistrement !");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">⏳ Chargement des questions...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>
      
      {/* Main Content - col-8 */}
      <div className="w-9/12 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              📝 Entretien Étudiant #{id}
            </h2>
            <p className="text-gray-600 mt-2">
              Évaluez l'étudiant en répondant aux questions ci-dessous
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Questions Personnelles */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                👤 Questions Personnelles
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Note (0-20)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personels.map((p, index) => (
                    <tr key={p.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {p.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          value={scores[`P-${p.id}`] || ""}
                          onChange={(e) => handleScoreChange(p.id, "P", e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Questions Techniques */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                ⚙️ Questions Techniques
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Note (0-20)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {techniques.map((t, index) => (
                    <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {t.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition duration-200"
                          value={scores[`T-${t.id}`] || ""}
                          onChange={(e) => handleScoreChange(t.id, "T", e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            📊 Résultats de l'Évaluation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Personnel */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalP}</div>
              <div className="text-sm font-medium text-blue-800">Score Personnel</div>
              <div className="text-xs text-blue-600 mt-1">
                / {personels.length * 20}
              </div>
            </div>

            {/* Score Technique */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{totalT}</div>
              <div className="text-sm font-medium text-amber-800">Score Technique</div>
              <div className="text-xs text-amber-600 mt-1">
                / {techniques.length * 20}
              </div>
            </div>

            {/* Total Général */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-700">{total}</div>
              <div className="text-sm font-medium text-gray-800">Total Général</div>
              <div className="text-xs text-gray-600 mt-1">
                / {(personels.length + techniques.length) * 20}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center space-x-2 shadow-md"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Sauvegarder Résultats</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}