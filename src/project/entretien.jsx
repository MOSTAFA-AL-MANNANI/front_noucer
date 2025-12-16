import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./sidebar";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCog,
  faSave,
  faSpinner,
  faClipboardList,
  faChartBar,
  faCalculator,
  faUsers,
  faQuestionCircle,
  faCheckCircle,
  faExclamationTriangle,
  faArrowLeft,
  faIdCard,
  faGraduationCap,
  faListAlt
} from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        
        // 1) Récupérer les données de l'étudiant d'abord pour obtenir la filière
        const resStudent = await api.get(`/students/${id}`);
        setStudent(resStudent.data);
        const filiere = resStudent.data.filiere || "";

        // 2) Récupérer les questions personnelles (toujours)
        const resP = await api.get("/personels");
        setPersonels(resP.data);

        // 3) Récupérer les questions techniques selon la filière
        const resT = await api.get("/techniques", {
          params: { filiere }
        });
        setTechniques(resT.data);
        
        showAlert("Chargement réussi", "Données de l'entretien chargées avec succès", "success");
      } catch (err) {
        console.error("Erreur chargement entretien:", err);
        showAlert("Erreur", "Erreur lors du chargement des données de l'entretien. Vérifiez le serveur.", "error");
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
    // Vérifier si tous les champs sont remplis
    const totalQuestions = personels.length + techniques.length;
    const questionsRemplies = Object.keys(scores).length;
    
    if (questionsRemplies < totalQuestions) {
      const result = await Swal.fire({
        title: 'Champs incomplets',
        text: `Vous avez rempli ${questionsRemplies}/${totalQuestions} questions. Voulez-vous quand même sauvegarder ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, sauvegarder',
        cancelButtonText: 'Continuer la saisie'
      });
      
      if (!result.isConfirmed) return;
    }

    setSaving(true);
    try {
      await api.post("/resultats", {
        id_stu: id,
        scoreP: totalP,
        scoreT: totalT,
        scoreS: 0,
        total: total,
      });
      
      await Swal.fire({
        title: 'Succès !',
        text: 'Les résultats ont été sauvegardés avec succès',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Retour à la liste'
      });
      
      navigate("/studentlist");
    } catch (err) {
      console.error("Erreur enregistrement", err);
      showAlert("Erreur", "Erreur lors de la sauvegarde des résultats", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Annuler la saisie',
      text: 'Voulez-vous vraiment quitter sans sauvegarder ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, quitter',
      cancelButtonText: 'Continuer'
    });
    
    if (result.isConfirmed) {
      navigate("/studentlist");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-6 w-6 text-blue-600" />
          <p className="text-gray-600 font-medium">Chargement des données de l'entretien...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="w-3/12"><Sidebar/></div>
      <div className="w-9/12 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/25 border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                  <FontAwesomeIcon icon={faClipboardList} />
                  Entretien Étudiant
                </h1>
                <p className="text-blue-100 text-lg font-medium flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} />
                  {student ? `${student.prenom} ${student.nom} — Filière: ${student.filiere}` : 'Chargement...'}
                </p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">#{id}</div>
                  <div className="text-amber-200 text-sm font-medium">ID Étudiant</div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Personnelles */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FontAwesomeIcon icon={faUsers} className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Questions Personnelles
                  </h2>
                  <p className="text-blue-100">
                    Évaluation des compétences comportementales et personnelles
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      Question
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-48 flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartBar} />
                      Note (0-20)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {personels.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-gray-800 font-medium">{p.question}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          min="0" 
                          max="20"
                          value={scores[`P-${p.id}`] || ""}
                          onChange={(e) => handleScoreChange(p.id, "P", e.target.value)}
                          className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                          placeholder="0-20"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Questions Techniques */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-8 border-b border-amber-400">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FontAwesomeIcon icon={faCog} className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Questions Techniques
                  </h2>
                  <p className="text-amber-100 flex items-center gap-2">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    Filière: {student?.filiere || 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto">
              {techniques.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune question technique</h3>
                  <p className="text-gray-600">Aucune question technique disponible pour cette filière.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-amber-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon icon={faQuestionCircle} />
                        Question
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-48 flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartBar} />
                        Note (0-20)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {techniques.map((t) => (
                      <tr key={t.id} className="hover:bg-amber-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-gray-800 font-medium">{t.question}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            min="0" 
                            max="20"
                            value={scores[`T-${t.id}`] || ""}
                            onChange={(e) => handleScoreChange(t.id, "T", e.target.value)}
                            className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300 hover:border-gray-300"
                            placeholder="0-20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Résultats & Actions */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 border-b border-green-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FontAwesomeIcon icon={faCalculator} className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Résultats de l'Entretien
                  </h2>
                  <p className="text-green-100">
                    Synthèse des scores et validation finale
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-blue-200 transform transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{totalP}</div>
                  <div className="text-blue-800 font-semibold flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faUsers} />
                    Score Personnel
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 text-center border-2 border-amber-200 transform transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-amber-600 mb-2">{totalT}</div>
                  <div className="text-amber-800 font-semibold flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faCog} />
                    Score Technique
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border-2 border-green-200 transform transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-green-600 mb-2">{total}</div>
                  <div className="text-green-800 font-semibold flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faChartBar} />
                    Total Général
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleCancel}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center gap-3"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Retour
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-3"
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Sauvegarder les Résultats
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}