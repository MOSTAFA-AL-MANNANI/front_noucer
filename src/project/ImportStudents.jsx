import React, { useState, useEffect } from "react";
import api from "./api";
import Sidebar from "./sidebar";
import "./import.css";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileUpload, 
  faCloudUploadAlt, 
  faCheckCircle, 
  faExclamationTriangle, 
  faSpinner, 
  faGraduationCap,
  faFileExcel,
  faFileCsv,
  faUsers,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';

function ImportStudents() {
  const [file, setFile] = useState(null);
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const res = await api.get("/filieres");
        setFilieres(res.data);
      } catch (err) {
        console.error(err);
        showAlert("Erreur lors du chargement des filières", "error");
      }
    };
    fetchFilieres();
  }, []);

  // Fonction d'alerte avec SweetAlert2
  const showAlert = (message, type = "success") => {
    Swal.fire({
      title: type === "success" ? "Succès" : 
             type === "error" ? "Erreur" : 
             type === "warning" ? "Attention" : "Information",
      text: message,
      icon: type,
      timer: 4000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérifier le type de fichier
      const allowedTypes = ['.xlsx', '.xls', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension) && !allowedTypes.includes(selectedFile.type)) {
        showAlert("Veuillez choisir un fichier Excel (.xlsx, .xls) ou CSV", "error");
        e.target.value = '';
        return;
      }

      // Vérifier la taille du fichier (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        showAlert("Le fichier est trop volumineux. Taille maximale: 10MB", "error");
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      showAlert(`Fichier "${selectedFile.name}" sélectionné avec succès`, "success");
    }
  };

  const handleFiliereChange = (e) => {
    setSelectedFiliere(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      showAlert("Veuillez choisir un fichier", "warning");
      return;
    }
    if (!selectedFiliere) {
      showAlert("Veuillez choisir une filière", "warning");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filiere", selectedFiliere);

    try {
      const res = await api.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Afficher un message de succès détaillé
      Swal.fire({
        title: "Importation réussie !",
        text: res.data.message,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981"
      });
      
      // Réinitialiser le formulaire
      setFile(null);
      setSelectedFiliere("");
      document.querySelector('input[type="file"]').value = '';
      
    } catch (err) {
      console.error(err);
      let errorMessage = "Erreur lors de l'importation";
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      
      Swal.fire({
        title: "Erreur d'importation",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-3/12">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-9/12 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <FontAwesomeIcon icon={faFileUpload} className="w-8 h-8 mr-3 text-blue-600" />
            Importer des étudiants
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl border border-gray-100">
            {/* Filiere Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-blue-600" />
                Sélectionner la filière
              </label>
              <select
                value={selectedFiliere}
                onChange={handleFiliereChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              >
                <option value="">Choisir une filière</option>
                {filieres.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2 text-green-600" />
                Choisir le fichier
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-all duration-300 hover:bg-blue-50 group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FontAwesomeIcon 
                      icon={faCloudUploadAlt} 
                      className="w-8 h-8 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" 
                    />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FontAwesomeIcon icon={faFileExcel} className="text-green-500" />
                      <FontAwesomeIcon icon={faFileCsv} className="text-blue-500" />
                      XLSX, XLS, CSV (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                  />
                </label>
              </div>
              {file && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                  <p className="text-sm text-green-600 flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                    Fichier sélectionné: <span className="font-semibold ml-1">{file.name}</span>
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    Taille: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isLoading || !file || !selectedFiliere}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center ${
                isLoading || !file || !selectedFiliere
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
              }`}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3 h-5 w-5 text-white" />
                  <span>Importation en cours...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowUp} className="mr-2" />
                  <span>Importer les étudiants</span>
                </>
              )}
            </button>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                Instructions d'importation
              </h3>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Le fichier doit être au format Excel (.xlsx, .xls) ou CSV</li>
                <li>• Taille maximale: 10MB</li>
                <li>• Assurez-vous que la filière sélectionnée correspond aux étudiants</li>
                <li>• Les colonnes doivent inclure: Nom, Prénom, Email, Téléphone</li>
              </ul>
            </div>
          </div>

          {/* Statut de préparation */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${
              selectedFiliere 
                ? 'bg-green-50 border-green-200 text-green-600' 
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={selectedFiliere ? faCheckCircle : faGraduationCap} 
                  className="mr-2" 
                />
                <span className="text-sm font-medium">
                  {selectedFiliere ? `Filière: ${selectedFiliere}` : "Filière non sélectionnée"}
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              file 
                ? 'bg-green-50 border-green-200 text-green-600' 
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={file ? faCheckCircle : faFileExcel} 
                  className="mr-2" 
                />
                <span className="text-sm font-medium">
                  {file ? `Fichier: ${file.name}` : "Aucun fichier sélectionné"}
                </span>
              </div>
            </div>
          </div>

          {/* Indicateur de prêt */}
          {file && selectedFiliere && (
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span className="font-semibold">Prêt pour l'importation !</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportStudents;