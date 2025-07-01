import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from '../services/transactionsService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import "./TransactionModal.css";

// --- Definições de Tipos ---
type TransactionType = 'entrada' | 'saida';

interface TransactionForm {
  title: string;
  amount: string; // Mantido como string para o formulário
  type: TransactionType;
  department: string;
  date: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<TransactionForm> & { id?: string };
  transactionId?: string | null;
}

export default function TransactionModal({ isOpen, onClose, initialData = {}, transactionId = null }: TransactionModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TransactionForm>({
    title: '',
    amount: '',
    type: 'entrada',
    department: '',
    date: '',
  });

  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      setForm({
        title: initialData.title || '',
        amount: String(initialData.amount || ''),
        type: initialData.type || 'entrada',
        department: initialData.department || '',
        date: initialData.date ? initialData.date.split('T')[0] : '',
      });
    } else if (isOpen) {
      setForm({ title: '', amount: '', type: 'entrada', department: '', date: '' });
    }
  }, [initialData, isOpen]);

  const mutation = useMutation({
    mutationFn: (formData: TransactionForm) => {
      const dataToSend = { ...formData, amount: Number(formData.amount) };
      return transactionId
        ? updateTransaction(transactionId, dataToSend)
        : createTransaction(dataToSend);
    },
    onSuccess: () => {
      toast.success('Transação salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Erro ao salvar transação.';
      toast.error(errorMessage);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(form);
  };

return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dialog-content" id='new-form'> {/* Estilo principal do modal */}
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">
            {transactionId ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            Preencha os detalhes para organizar suas finanças.
          </DialogDescription>
        </DialogHeader>

        {/* Adicionei um wrapper para o form para aplicar o padding */}
        <div className="dialog-form">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo Descrição */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Ex: Salário, Aluguel"
                value={form.title}
                onChange={handleChange}
                required
                disabled={mutation.isPending}
                className="form-input" 
              />
            </div>
            
            {/* Campo Valor */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
              <input
                id="amount"
                type="number"
                name="amount"
                placeholder="R$ 0,00"
                value={form.amount}
                onChange={handleChange}
                required
                disabled={mutation.isPending}
                className="form-input"
              />
            </div>

            {/* Agrupando Tipo e Departamento lado a lado (Opcional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  disabled={mutation.isPending}
                  className="form-input"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento</label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  placeholder="Ex: Trabalho, Casa"
                  value={form.department}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                  className="form-input"
                />
              </div>
            </div>
            
            {/* Campo Data */}
            <div>
               <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                  className="form-input"
                />
            </div>

          </form>
        </div>

        <DialogFooter className="dialog-footer">
          <Button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="btn-secondary" // Botão secundário
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="transaction-form" // O form precisa de um ID para o botão funcionar fora dele
            disabled={mutation.isPending}
            className="btn-primary" // Botão primário
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar Transação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


