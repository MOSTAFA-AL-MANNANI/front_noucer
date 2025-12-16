import React, { useEffect, useState } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import Swal from 'sweetalert2';

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faSpinner,
  faTimes,
  faList,
  faClipboardList,
  faQuestionCircle,
  faUserFriends,
  faIdCard,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

export default function Personel() {
  const [personels, setPersonels] = useState([]);
  const [form, setForm] = useState({ question: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/personels");
      setPersonels(res.data);
      
      Swal.fire({
        title: 'Chargement réussi',
        text: `${res.data.length} question(s) personnelle(s) chargée(s)`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      showAlert("Erreur", "Erreur lors du chargement des questions personnelles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) {
      showAlert("Champ requis", "Veuillez saisir une question", "warning");
      return;
    }

    try {
      setSubmitLoading(true);
      if (editId) {
        await api.put(`/personels/${editId}`, form);
        
        Swal.fire({
          title: 'Modification réussie !',
          text: 'La question a été modifiée avec succès',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        
        setEditId(null);
      } else {
        await api.post("/personels", form);
        
        Swal.fire({
          title: 'Création réussie !',
          text: 'La question a été créée avec succès',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      }
      setForm({ question: "" });
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      showAlert("Erreur", "Erreur lors de l'opération sur la question", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const personel = personels.find(p => p.id === id);
    
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      html: `Êtes-vous sûr de vouloir supprimer la question :<br><strong>"${personel.question}"</strong> ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/personels/${id}`);
        
        Swal.fire({
          title: 'Supprimé !',
          text: 'La question a été supprimée avec succès',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        
        fetchData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showAlert("Erreur", "Erreur lors de la suppression de la question", "error");
      }
    }
  };

  const handleEdit = (p) => {
    setForm({ question: p.question });
    setEditId(p.id);
    
    // Scroll vers le formulaire
    document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });
    
    Swal.fire({
      title: 'Modification',
      text: 'Vous modifiez une question personnelle',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  };

  const cancelEdit = async () => {
    const result = await Swal.fire({
      title: 'Annuler la modification',
      text: 'Voulez-vous vraiment annuler les modifications ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Continuer'
    });

    if (result.isConfirmed) {
      setEditId(null);
      setForm({ question: "" });
      
      Swal.fire({
        title: 'Modification annulée',
        text: 'Les modifications ont été annulées',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    }
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
                  <FontAwesomeIcon icon={faUserFriends} />
                  Questions Personnelles
                </h1>
                <p className="text-blue-100 text-lg font-medium flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardList} />
                  Gérez les questions d'évaluation du personnel
                </p>
              </div>

              {/* Indicateur de Comptage */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faList} />
                    {personels.length}
                  </div>
                  <div className="text-amber-200 text-sm font-medium">
                    Questions totales
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de Création/Modification */}
          <div id="form-section" className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FontAwesomeIcon 
                    icon={editId ? faEdit : faPlus} 
                    className="text-xl text-blue-600" 
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {editId ? "Modifier la Question" : "Ajouter une Nouvelle Question"}
                  </h3>
                  <p className="text-gray-600">
                    {editId ? "Modifiez la question personnelle" : "Remplissez le champ pour créer une nouvelle question"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                {/* Question Personnelle */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    Question Personnelle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Saisissez une question personnelle..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-4 text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                    value={form.question}
                    onChange={(e) => setForm({ question: e.target.value })}
                    required
                  />
                </div>
                
                {/* Boutons d'action */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={!form.question.trim() || submitLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                  >
                    {submitLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        <span>Traitement en cours...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={editId ? faSave : faPlus} />
                        <span>{editId ? "Mettre à jour" : "Ajouter la question"}</span>
                      </>
                    )}
                  </button>
                  
                  {editId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Liste des Questions Personnelles */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 border-b border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Liste des Questions
                    </h2>
                    <p className="text-blue-100 flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartBar} />
                      {personels.length} question{personels.length !== 1 ? 's' : ''} personnelle{personels.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Chargement des questions...
                  </p>
                </div>
              </div>
            ) : personels.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faQuestionCircle} className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Aucune question pour le moment</h3>
                <p className="text-gray-500 text-lg mb-4">
                  Commencez par ajouter votre première question personnelle
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {personels.map((personel, index) => (
                    <div
                      key={personel.id}
                      className="bg-gray-50/50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {personel.question}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-2">
                                <FontAwesomeIcon icon={faIdCard} />
                                ID: {personel.id}
                              </span>
                              <span className="text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserFriends} />
                                Personnelle
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(personel)}
                          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(personel.id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pied de Liste */}
            {personels.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-8 py-4 border-t border-gray-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    Total: {personels.length} question{personels.length !== 1 ? 's' : ''} personnelle{personels.length !== 1 ? 's' : ''}
                  </p>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    {personels.length} élément{personels.length !== 1 ? 's' : ''} affiché{personels.length !== 1 ? 's' : ''}
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