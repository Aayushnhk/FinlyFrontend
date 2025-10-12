import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './index.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Auth from './pages/Auth';

import { AuthProvider } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { TransactionProvider } from './contexts/TransactionContext';

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <BudgetProvider>
          <TransactionProvider>
            <Router>
              <Navbar />
              <div className="App px-4 py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/auth" element={<Auth />} />
                </Routes>
              </div>
            </Router>
          </TransactionProvider>
        </BudgetProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;