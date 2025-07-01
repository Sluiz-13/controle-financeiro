// src/components/Header.js
import React, { useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal";
import Transactions from '../pages/Transactions';
import Transacoes from '../pages/Transacoes';

const Header = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="logo">
        Controle Financeiro
      </div>
      <nav>
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/transactions" className="nav-link">Transações</Link>
        <Link to="/dashboard" className="nav-link">Economias</Link>
        <Link onClick={handleLogout} className="nav-link">Logout</Link>
      </nav>
    </header>
  );
};

export default Header;
