import React from 'react';

const formatCurrency = (value) => {
  if (isNaN(value) || value === null) {
    return "R$ 0,00";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const SummaryCards = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="summary-cards">
        <p>Carregando resumo...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="summary-cards">
        <p>Nenhum resumo disponível.</p>
      </div>
    );
  }

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
