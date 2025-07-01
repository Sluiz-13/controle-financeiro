import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../services/transactionsService';

// --- Tipos ---
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'entrada' | 'saida';
  department: string;
  date: string;
}

const RevenueExpenseChart = () => {
  const { data: transactions = [], isLoading } = useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: () => getTransactions().then((res) => res.data),
  });

  const processData = () => {
    if (!transactions) return [];

    const monthlyData = transactions.reduce((acc, tx) => {
      console.log("Processando transação:", tx);
      const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { name: month, receita: 0, despesa: 0 };
      }
      const amount = parseFloat(tx.amount); // Converte para número
      if (tx.type === 'entrada') {
        acc[month].receita += amount;
      } else {
        acc[month].despesa += amount;
      }
      console.log("Dados mensais após processar:", acc[month]);
      return acc;
    }, {} as Record<string, { name: string; receita: number; despesa: number }>);

    return Object.values(monthlyData);
  };

  const chartData = processData();

  if (isLoading) return <p>Carregando gráfico...</p>;
  if (chartData.length === 0) return <p>Não há dados para exibir.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <Legend />
        <Bar dataKey="receita" fill="#10b981" name="Receita" />
        <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueExpenseChart;
