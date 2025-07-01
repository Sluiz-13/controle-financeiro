import React from "react";
import "./Dashboard.css";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import RevenueExpenseChart from "../components/charts/RevenueExpenseChart";
import CategoryChart from "../components/charts/CategoryChart";

export default function Dashboard() {
  return (
    <div className="app-container">
      <Header />
      <main className="dashboard-main">
        <SummaryCards />

        <div className="charts-grid">
          <div className="chart-container">
            <h2 className="chart-title">Receitas vs Despesas</h2>
            <div className="chart-content">
              <RevenueExpenseChart />
            </div>
          </div>

          <div className="chart-container">
            <h2 className="chart-title">Despesas por Categoria</h2>
            <div className="chart-content">
              <CategoryChart />
            </div>
          </div>

          {/* Gráfico de Saldo Mensal (ocupando a largura total) - A ser implementado */}
          <div className="chart-container min-w-full">
            <h2 className="chart-title">Saldo Mensal</h2>
            <div className="chart-content">
              <p style={{ textAlign: 'center', padding: '20px' }}>Área do Gráfico de Linha (A ser implementado)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
