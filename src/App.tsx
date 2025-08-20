import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SearchMember from './pages/SearchMember';
import AddEditMember from './pages/AddEditMember';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<SearchMember />} />
              <Route path="/add" element={<AddEditMember />} />
              <Route path="/edit/:id" element={<AddEditMember />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
