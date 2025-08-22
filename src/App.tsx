import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SearchMember from './pages/SearchMember';
import AddEditMember from './pages/AddEditMember';
import Supporters from './pages/Supporters';
import EventManagement from './pages/EventManagement';
import EventResponse from './pages/EventResponse';
import Login from './pages/Login';
import './App.css';

// Protected Route Component
const ProtectedApp = () => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchMember />} />
          <Route path="/add" element={<AddEditMember />} />
          <Route path="/edit/:id" element={<AddEditMember />} />
          <Route path="/supporters" element={<Supporters />} />
          <Route path="/events" element={<EventManagement />} />
          <Route path="/event-response" element={<EventResponse />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ProtectedApp />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
