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
import ProtectedRoute from './project/ProtectedRoute'

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
              <Top12 />
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
      </Routes>
    </div>
  )
}

export default App