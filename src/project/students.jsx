import React, { useEffect, useState, useMemo } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    numero: "",
    genre: "H",
    date_naissance: "",
    niveau_sco: "",
    status: "registred",
    gmail: "",
    filiere: "",
    cin: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // Fonction d'alerte améliorée
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 4000);
  };

  // Fetch all students
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students");
      setStudents(res.data);
      showAlert(`${res.data.length} étudiant(s) chargé(s) avec succès`, "success");
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      showAlert("Erreur lors du chargement des étudiants", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ajouter / Modifier
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
        showAlert("Étudiant modifié avec succès", "success");
        setEditId(null);
      } else {
        await api.post("/students", form);
        showAlert("Étudiant ajouté avec succès", "success");
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      showAlert("Erreur lors de l'opération", "error");
    }
  };

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      numero: "",
      genre: "H",
      date_naissance: "",
      niveau_sco: "",
      status: "registred",
      gmail: "",
      filiere: "",
      cin: "",
    });
    setEditId(null);
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        await api.delete(`/students/${id}`);
        showAlert("Étudiant supprimé avec succès", "success");
        fetchData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showAlert("Erreur lors de la suppression", "error");
      }
    }
  };

  // Modifier
  const handleEdit = (s) => {
    setForm({
      nom: s.nom,
      prenom: s.prenom,
      numero: s.numero,
      genre: s.genre,
      date_naissance: s.date_naissance,
      niveau_sco: s.niveau_sco,
      status: s.status,
      gmail: s.gmail,
      filiere: s.filiere,
      cin: s.cin,
    });
    setEditId(s.id_stu);
    showAlert(`Modification de ${s.nom} ${s.prenom}`, "info");
  };

  // Export to Excel
  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const dataToExport = filteredStudents.map(student => ({
        "Nom": student.nom,
        "Prénom": student.prenom,
        "CIN": student.cin,
        "Téléphone": student.numero,
        "Email": student.gmail,
        "Genre": student.genre === "H" ? "Homme" : "Femme",
        "Date Naissance": student.date_naissance,
        "Niveau Scolaire": student.niveau_sco,
        "Filière": student.filiere,
        "Statut": student.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Étudiants");
      
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `etudiants_${date}.xlsx`);
      
      showAlert(`Fichier Excel exporté avec ${dataToExport.length} étudiant(s)`, "success");
    } catch (error) {
      console.error("Erreur export:", error);
      showAlert("Erreur lors de l'exportation Excel", "error");
    } finally {
      setExportLoading(false);
    }
  };

  // Filtrage avancé avec useMemo
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;

    return students.filter(student => {
      const term = searchTerm.toLowerCase();
      
      switch (searchField) {
        case "nom":
          return student.nom.toLowerCase().includes(term);
        case "prenom":
          return student.prenom.toLowerCase().includes(term);
        case "cin":
          return student.cin.toLowerCase().includes(term);
        case "filiere":
          return student.filiere.toLowerCase().includes(term);
        case "all":
        default:
          return (
            student.nom.toLowerCase().includes(term) ||
            student.prenom.toLowerCase().includes(term) ||
            student.cin.toLowerCase().includes(term) ||
            student.filiere.toLowerCase().includes(term) ||
            student.gmail.toLowerCase().includes(term) ||
            student.numero.includes(term)
          );
      }
    });
  }, [students, searchTerm, searchField]);

  const getStatusColor = (status) => {
    switch (status) {
      case "passed": return "bg-green-100 text-green-800 border border-green-200";
      case "attende": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "registred": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getFiliereColor = (filiere) => {
    switch (filiere) {
      case "développement web": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "marketing digital": return "bg-pink-100 text-pink-800 border border-pink-200";
      case "Création de contenu": return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-3/12">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="w-9/12 p-6">
        {/* Alert Notification */}
        {alert.show && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 shadow-lg ${
            alert.type === "success" ? "bg-green-50 border-green-500 text-green-700" :
            alert.type === "error" ? "bg-red-50 border-red-500 text-red-700" :
            "bg-blue-50 border-blue-500 text-blue-700"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl mr-3">
                  {alert.type === "success" ? "✅" : 
                   alert.type === "error" ? "❌" : "ℹ️"}
                </span>
                <span className="font-medium">{alert.message}</span>
              </div>
              <button 
                onClick={() => setAlert({ show: false, message: "", type: "" })}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
                  Gestion des Étudiants
                </h2>
                <p className="text-gray-600 mt-2 ml-5">
                  Ajouter, modifier et gérer les étudiants
                </p>
              </div>
              
              {/* Barre de recherche et export */}
              <div className="flex items-center space-x-3">
                <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="px-3 py-2 border-r border-gray-300 focus:outline-none bg-gray-50"
                  >
                    <option value="all">Tous</option>
                    <option value="nom">Nom</option>
                    <option value="prenom">Prénom</option>
                    <option value="cin">CIN</option>
                    <option value="filiere">Filière</option>
                  </select>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Rechercher...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 focus:outline-none"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                  </div>
                </div>

                <button
                  onClick={exportToExcel}
                  disabled={exportLoading || students.length === 0}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
                >
                  {exportLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Export...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📊</span>
                      Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Formulaire */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-white flex items-center">
                {editId ? "✏️ Modifier l'Étudiant" : "👨‍🎓 Ajouter un Étudiant"}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      placeholder="Nom"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Numéro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="text"
                      placeholder="Numéro"
                      value={form.numero}
                      onChange={(e) => setForm({ ...form, numero: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                    <select
                      value={form.genre}
                      onChange={(e) => setForm({ ...form, genre: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="H">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>

                  {/* Date de naissance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <input
                      type="date"
                      value={form.date_naissance}
                      onChange={(e) => setForm({ ...form, date_naissance: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Niveau scolaire */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveau scolaire</label>
                    <select 
                      value={form.niveau_sco}
                      onChange={(e) => setForm({ ...form, niveau_sco: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un niveau</option>
                      <option value="Lycée">Lycée</option>
                      <option value="Bac">Bac</option>
                      <option value="Bac+1">Bac+1</option>
                      <option value="Bac+2">Bac+2</option>
                      <option value="Bac+3">Bac+3</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="registred">Inscrit</option>
                      <option value="attende">En attente</option>
                      <option value="passed">Réussi</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="adresse@email.com"
                      value={form.gmail}
                      onChange={(e) => setForm({ ...form, gmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filière */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filière</label>
                    <select 
                      value={form.filiere} 
                      onChange={(e) => setForm({ ...form, filiere: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une filière</option>
                      <option value="développement web">Développement web</option>
                      <option value="marketing digital">Marketing digital</option>
                      <option value="Création de contenu">Création de contenu</option>
                    </select>
                  </div>

                  {/* CIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                    <input
                      type="text"
                      placeholder="Numéro CIN"
                      value={form.cin}
                      onChange={(e) => setForm({ ...form, cin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex space-x-4 pt-4">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2 shadow-md"
                  >
                    <span>{editId ? "💾" : "➕"}</span>
                    <span>{editId ? "Modifier" : "Ajouter"}</span>
                  </button>
                  {editId && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="bg-amber-400 hover:bg-amber-500 text-gray-800 font-medium px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2 shadow-md"
                    >
                      <span>❌</span>
                      <span>Annuler</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Statistiques améliorées */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              📊 Statistiques des Étudiants
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-center text-white shadow-lg">
                <div className="text-2xl font-bold">{students.length}</div>
                <div className="text-sm opacity-90">Total Étudiants</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-center text-white shadow-lg">
                <div className="text-2xl font-bold">
                  {students.filter(s => s.status === "انتظار").length}
                </div>
                <div className="text-sm opacity-90">En attente</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-center text-white shadow-lg">
                <div className="text-2xl font-bold">
                  {students.filter(s => s.status === "نجاح").length}
                </div>
                <div className="text-sm opacity-90">Réussis</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-center text-white shadow-lg">
                <div className="text-2xl font-bold">
                  {students.filter(s => s.filiere === "développement web").length}
                </div>
                <div className="text-sm opacity-90">Développement</div>
              </div>
            </div>
            
            {/* Statistiques de recherche */}
            {searchTerm && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Recherche: <span className="font-semibold">"{searchTerm}"</span> • 
                  Trouvés: <span className="font-semibold text-blue-600">{filteredStudents.length}</span> • 
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-blue-500 hover:text-blue-700 underline text-sm"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liste des étudiants améliorée */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                📋 Liste des Étudiants
                <span className="ml-3 bg-white text-amber-600 text-sm px-3 py-1 rounded-full shadow-sm">
                  {filteredStudents.length} étudiant(s)
                  {searchTerm && ` sur ${students.length}`}
                </span>
              </h3>
              
              <div className="text-sm text-gray-700">
                Filtre: <span className="font-semibold capitalize">{searchField}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Chargement des étudiants...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
                <p className="text-gray-600 font-medium text-lg mb-2">
                  {searchTerm ? "Aucun étudiant trouvé" : "Aucun étudiant enregistré"}
                </p>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par ajouter un étudiant"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Réinitialiser la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filière</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((s) => (
                      <tr key={s.id_stu} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.nom} {s.prenom}</div>
                            <div className="text-xs text-gray-500 font-mono mt-1">CIN: {s.cin || "Non renseigné"}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{s.numero}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">{s.gmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getFiliereColor(s.filiere)}`}>
                            {s.filiere || "Non spécifiée"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(s.status)}`}>
                            {s.status === "registred" ? "Inscrit" : 
                             s.status === "انتظار" ? "En attente" : 
                             s.status === "نجاح" ? "Réussi" : s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(s)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition duration-200 flex items-center space-x-1 text-sm"
                              title="Modifier"
                            >
                              <span>✏️</span>
                              <span className="hidden lg:inline">Modifier</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(s.id_stu)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition duration-200 flex items-center space-x-1 text-sm"
                              title="Supprimer"
                            >
                              <span>🗑️</span>
                              <span className="hidden lg:inline">Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}