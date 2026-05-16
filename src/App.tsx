import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import Home from '@/pages/Home'
import StatePage from '@/pages/StatePage'
import CountyPage from '@/pages/CountyPage'
import SourcesPage from '@/pages/SourcesPage'
import { ProfileProvider } from '@/context/ProfileContext'
import './App.css'

export default function App() {
  return (
    <ProfileProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/state" element={<StatePage />} />
          <Route path="/county" element={<CountyPage />} />
          <Route path="/sources" element={<SourcesPage />} />
        </Routes>
      </Router>
    </ProfileProvider>
  )
}
