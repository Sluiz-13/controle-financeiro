import React, { useEffect, useState } from 'react';
import axios from 'axios';

const formatCurrency = (value) => {
  if (isNaN(value) || value === null) {
    return "R$ 0,00";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const SummaryCards = () => {
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/transactions/financial-summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSummary(response.data);
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-header revenue">
          <span>Entradas</span>
        </div>
        <div className="card-body">
          {formatCurrency(summary.total_entrada)}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header expense">
          <span>Saídas</span>
        </div>
        <div className="card-body">
          {formatCurrency(summary.total_saida)}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header balance">
          <span>Saldo</span>
        </div>
        <div className="card-body">
          {formatCurrency(summary.saldo)}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
