import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import Sidebar from "./sidebar";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faFileExcel, 
  faSearch, 
  faSync, 
  faFilter, 
  faTimes, 
  faArrowRight, 
  faIdCard, 
  faPhone, 
  faEnvelope, 
  faGraduationCap,
  faChartBar,
  faList,
  faUserCheck,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filiereFilter, setFiliereFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction d'alerte avec SweetAlert2
  const showAlert = (message, type = "success") => {
    Swal.fire({
      title: type === "success" ? "Succès" : 
             type === "error" ? "Erreur" : 
             "Information",
      text: message,
      icon: type,
      timer: 4000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students");
      const filtered = res.data.filter((s) => s.status === "registred");
      setStudents(filtered);
      showAlert(`${filtered.length} étudiant(s) inscrit(s) chargés avec succès`, "success");
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

  // Export to Excel function
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
        "Statut": student.status === "registred" ? "Inscrit" : student.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Étudiants Inscrits");
      
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `etudiants_inscrits_${date}.xlsx`);
      
      showAlert(`Fichier Excel exporté avec ${dataToExport.length} étudiant(s)`, "success");
    } catch (error) {
      console.error("Erreur export:", error);
      showAlert("Erreur lors de l'exportation Excel", "error");
    } finally {
      setExportLoading(false);
    }
  };

  // Fonctions de filtrage par filière
  const filterByFiliere = (filiere) => {
    setFiliereFilter(filiere);
    setSearch("");
  };

  const resetFiliereFilter = () => {
    setFiliereFilter("all");
  };

  // Filtrage avancé avec useMemo
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filtrage par filière d'abord
    if (filiereFilter !== "all") {
      filtered = filtered.filter(student => student.filiere === filiereFilter);
    }

    // Puis filtrage par recherche textuelle
    if (!search.trim()) return filtered;

    return filtered.filter(student => {
      const term = search.toLowerCase();
      
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
            student.numero.includes(term)
          );
      }
    });
  }, [students, search, searchField, filiereFilter]);

  const getFiliereColor = (filiere) => {
    switch (filiere) {
      case "Développement web": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Marketing digital": return "bg-pink-100 text-pink-800 border-pink-200";
      case "Création de contenu": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "registred": return "bg-blue-100 text-blue-800 border-blue-200";
      case "attende": return "bg-amber-100 text-amber-800 border-amber-200";
      case "passed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "registred": return "Inscrit";
      case "attende": return "En attente";
      case "passed": return "Réussi";
      default: return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - col-3 */}
      <div className="w-3/12">
        <Sidebar />
      </div>
      
      {/* Main Content - col-9 */}
      <div className="w-9/12 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-600" />
                  Liste des Étudiants Inscrits
                </h2>
                <p className="text-gray-600 mt-2 ml-8">
                  Gérer et afficher la liste des étudiants inscrits dans le système
                </p>
              </div>
              
              {/* Bouton Export Excel */}
              <button
                onClick={exportToExcel}
                disabled={exportLoading || students.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors shadow-md"
              >
                {exportLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSync} className="animate-spin mr-2" />
                    Export...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche améliorée */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex flex-col md:flex-row gap-3">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full md:w-40"
              >
                <option value="all">Tous les champs</option>
                <option value="nom">Nom</option>
                <option value="prenom">Prénom</option>
                <option value="cin">CIN</option>
                <option value="filiere">Filière</option>
              </select>
              
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Rechercher par ${searchField === "all" ? "nom, prénom, CIN...": searchField}`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>
            
            {(search || filiereFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFiliereFilter("all");
                }}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition duration-200 whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Réinitialiser tous les filtres
              </button>
            )}
          </div>
          
          {/* Indicateur de recherche */}
          {(search || filiereFilter !== "all") && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700 flex items-center justify-between">
                <span>
                  {search && filiereFilter !== "all" ? (
                    <>
                      Recherche: <strong>"{search}"</strong> dans <strong>{searchField === "all" ? "tous les champs" : searchField}</strong> 
                      et Filière: <strong>{filiereFilter}</strong>
                    </>
                  ) : search ? (
                    <>
                      Recherche: <strong>"{search}"</strong> dans <strong>{searchField === "all" ? "tous les champs" : searchField}</strong>
                    </>
                  ) : (
                    <>
                      Filtre par filière: <strong>{filiereFilter}</strong>
                    </>
                  )}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {filteredStudents.length} résultat(s)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques rapides avec fonctionnalité de clic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            onClick={resetFiliereFilter}
            className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl ${
              filiereFilter === "all" ? "ring-4 ring-blue-300 ring-opacity-70" : ""
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="text-xl mb-2" />
            <div className="text-2xl font-bold">{students.length}</div>
            <div className="text-sm opacity-90 flex items-center justify-center">
              Total Inscrits
              {filiereFilter === "all" && <FontAwesomeIcon icon={faUserCheck} className="ml-2" />}
            </div>
          </div>
          
          <div 
            onClick={() => filterByFiliere("Développement web")}
            className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl ${
              filiereFilter === "Développement web" ? "ring-4 ring-purple-300 ring-opacity-70" : ""
            }`}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="text-xl mb-2" />
            <div className="text-2xl font-bold">
              {students.filter(s => s.filiere === "Développement web").length}
            </div>
            <div className="text-sm opacity-90 flex items-center justify-center">
              Développement Web
              {filiereFilter === "Développement web" && <FontAwesomeIcon icon={faUserCheck} className="ml-2" />}
            </div>
          </div>
          
          <div 
            onClick={() => filterByFiliere("Marketing digital")}
            className={`bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl ${
              filiereFilter === "Marketing digital" ? "ring-4 ring-pink-300 ring-opacity-70" : ""
            }`}
          >
            <FontAwesomeIcon icon={faChartBar} className="text-xl mb-2" />
            <div className="text-2xl font-bold">
              {students.filter(s => s.filiere === "Marketing digital").length}
            </div>
            <div className="text-sm opacity-90 flex items-center justify-center">
              Marketing Digital
              {filiereFilter === "Marketing digital" && <FontAwesomeIcon icon={faUserCheck} className="ml-2" />}
            </div>
          </div>
          
          <div 
            onClick={() => filterByFiliere("Création de contenu")}
            className={`bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-center text-white shadow-lg cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl ${
              filiereFilter === "Création de contenu" ? "ring-4 ring-indigo-300 ring-opacity-70" : ""
            }`}
          >
            <FontAwesomeIcon icon={faList} className="text-xl mb-2" />
            <div className="text-2xl font-bold">
              {students.filter(s => s.filiere === "Création de contenu").length}
            </div>
            <div className="text-sm opacity-90 flex items-center justify-center">
              Création Contenu
              {filiereFilter === "Création de contenu" && <FontAwesomeIcon icon={faUserCheck} className="ml-2" />}
            </div>
          </div>
        </div>

        {/* Conteneur du tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* En-tête du tableau */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faList} className="mr-2" />
                Étudiants Inscrits
                <span className="ml-3 bg-white text-amber-600 text-sm px-3 py-1 rounded-full shadow-sm">
                  {filteredStudents.length} étudiant(s)
                  {(search || filiereFilter !== "all") && ` sur ${students.length}`}
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                {filiereFilter !== "all" && (
                  <div className="text-sm text-gray-700 bg-white bg-opacity-50 px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faFilter} className="mr-1" />
                    Filière: <span className="font-semibold">{filiereFilter}</span>
                  </div>
                )}
                <div className="text-sm text-gray-700 bg-white bg-opacity-50 px-3 py-1 rounded-full">
                  <FontAwesomeIcon icon={faSearch} className="mr-1" />
                  Recherche: <span className="font-semibold capitalize">{searchField}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FontAwesomeIcon icon={faSync} className="animate-spin text-blue-600 text-2xl mr-3" />
                <span className="text-gray-600">Chargement des étudiants...</span>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filière</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((s) => (
                      <tr key={s.id_stu} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{s.prenom} {s.nom}</div>
                            <div className="text-sm text-gray-500 font-mono mt-1 flex items-center">
                              <FontAwesomeIcon icon={faIdCard} className="mr-1 text-gray-400" />
                              CIN: {s.cin || "Non renseigné"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                            {s.numero}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px] flex items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                            {s.gmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getFiliereColor(s.filiere)}`}>
                            {s.filiere || "Non spécifiée"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(s.status)}`}>
                            {getStatusText(s.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/entretien/${s.id_stu}`)}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2 text-sm font-medium shadow-md"
                          >
                            <FontAwesomeIcon icon={faArrowRight} />
                            <span>Accéder à l'entretien</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faSearch} className="text-2xl text-gray-400" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium text-lg mb-2">
                  {search || filiereFilter !== "all" 
                    ? "Aucun étudiant ne correspond à vos critères de filtrage" 
                    : "Aucun étudiant inscrit"}
                </p>
                <p className="text-gray-500 mb-4">
                  {search || filiereFilter !== "all" 
                    ? "Essayez de modifier vos termes de recherche ou vérifiez l'orthographe" 
                    : "Les étudiants inscrits apparaîtront ici une fois ajoutés"}
                </p>
                {(search || filiereFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFiliereFilter("all");
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Réinitialiser tous les filtres
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pied de tableau */}
          {filteredStudents.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 rounded-b-xl border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de <span className="font-medium">{filteredStudents.length}</span> sur <span className="font-medium">{students.length}</span> étudiants inscrits
                  {filiereFilter !== "all" && (
                    <span className="ml-2 text-blue-600">
                      (Filtré par: {filiereFilter})
                    </span>
                  )}
                </p>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  {(search || filiereFilter !== "all") && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                      <FontAwesomeIcon icon={faFilter} className="mr-1" />
                      Filtre actif
                    </span>
                  )}
                  <span>Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}