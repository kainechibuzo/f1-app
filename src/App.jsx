import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Transfers from './pages/Transfers.jsx'
import News from './pages/News.jsx'
import F1Page from './pages/F1Page.jsx'
import Analysis from './pages/Analysis.jsx'
import Contact from './pages/Contact.jsx'
import Matches from './pages/Matches.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import PlayerProfile from './pages/PlayerProfile.jsx'
import DriverProfile from './pages/DriverProfile.jsx'
import Favorites from './pages/Favorites.jsx'
import './App.css'

export default function App() {
  return (
    <>
      <a id="top" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/news" element={<News />} />
          <Route path="/f1" element={<F1Page />} />
          <Route path="/drivers/:driverId" element={<DriverProfile />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
