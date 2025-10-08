// App.js
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import Login from './project/login'
import StudentsList from './project/studentsList'
import Entretien from './project/entretien'
import Top12 from './project/top'
import WaitingStudents from './project/attende'
import Personel from './project/personel'
import Technique from './project/technique'
import Students from './project/students'
import FiliereStudents from './project/FiliereStudents'
import ProtectedRoute from './project/ProtectedRoute'
import FiliereCRUD from './project/filiere'
import SectionCRUD from './project/section'
import AssignStudents from './project/EnrollStudent'
import MarkAttendance from './project/MarkAttendance'
import DocumentsManager from './project/DocumentsManager'


function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Login Page - Centered */}
        <Route path="/" element={<Login setToken={setToken} />} />

        {/* Protected Routes with RTL support */}
        <Route path="/studentlist" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <StudentsList />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/entretien/:id" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <Entretien />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/top" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <FiliereStudents />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/attende" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <WaitingStudents />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/personel" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <Personel />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/technique" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <Technique />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/students" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <Students />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/filiere" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <FiliereCRUD />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/section" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <SectionCRUD />
            </div>
          </ProtectedRoute>
        } />

          <Route path="/EnrollStudent" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <AssignStudents />
            </div>
          </ProtectedRoute>
        } />



          <Route path="/absence" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <MarkAttendance />
            </div>
          </ProtectedRoute>
        } />

                  <Route path="/document" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50" dir="ltr">
              <DocumentsManager />
            </div>
          </ProtectedRoute>
        } />

      </Routes>
    </div>
  )
}

export default App