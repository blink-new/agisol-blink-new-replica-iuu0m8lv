import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { LandingPage } from '@/pages/LandingPage'
import { ProjectEditor } from '@/pages/ProjectEditor'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/project/:projectId" element={<ProjectEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App