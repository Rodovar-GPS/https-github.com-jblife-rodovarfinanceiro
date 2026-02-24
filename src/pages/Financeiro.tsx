import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Filter, Download, MoreHorizontal, Trash2, Edit2, X } from 'lucide-react';
import { useData, Transaction } from '../contexts/DataContext';

export default function Financeiro() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, searchTerm } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Form State
  const [currentTransaction, setCurrentTransaction] = useState<Partial<Transaction>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formValue, setFormValue] = useState<string>('');

  // Actions Menu State
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const categories = ['Todas', 'Manutenção', 'Serviço', 'Combustível', 'Seguros', 'Pessoal', 'Outros'];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterCategory === 'Todas' || t.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchTerm, filterCategory]);

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Descrição', 'Categoria', 'Data', 'Valor', 'Status'],
      ...filteredTransactions.map(t => [
        t.id,
        `"${t.description}"`,
        t.category,
        t.date,
        t.value,
        t.status
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'financeiro_rodovar.csv';
    link.click();
  };

  const handleDelete = (id: number) => {
    deleteTransaction(id);
    setActiveMenu(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setFormValue(transaction.value.toString());
    setIsEditing(true);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleAddNew = () => {
    setCurrentTransaction({});
    setFormValue('');
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newTransaction: Transaction = {
      id: isEditing ? currentTransaction.id! : Date.now(),
      description: formData.get('description') as string,
      value: Number(formData.get('value')),
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as string,
    };

    if (isEditing) {
      updateTransaction(newTransaction);
    } else {
      addTransaction(newTransaction);
    }
    
    setIsModalOpen(false);
  };

  return (
    <Layout title="Financeiro">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen ? 'bg-zinc-100 border-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
          >
            <Filter className="w-4 h-4" />
            {filterCategory === 'Todas' ? 'Filtrar' : filterCategory}
          </button>
          
          {isFilterOpen && (
            <div className="absolute top-12 left-0 bg-white border border-zinc-200 rounded-lg shadow-lg py-2 w-48 z-20">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCategory(cat);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 ${filterCategory === cat ? 'text-yellow-600 font-medium' : 'text-zinc-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-visible min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{transaction.description}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    <span className="px-2 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${transaction.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.value > 0 ? '+' : ''} R$ {Math.abs(transaction.value).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${transaction.status === 'Pago' || transaction.status === 'Recebido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === transaction.id ? null : transaction.id)}
                      className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {activeMenu === transaction.id && (
                      <div className="absolute right-8 top-8 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 w-32 z-50">
                        <button 
                          onClick={() => handleEdit(transaction)}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(transaction.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Nova/Editar Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">
              {isEditing ? 'Editar Transação' : 'Nova Transação'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
                <input 
                  name="description"
                  required
                  defaultValue={currentTransaction.description}
                  type="text" 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all" 
                  placeholder="Ex: Manutenção Caminhão" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Valor (R$)</label>
                  <input 
                    name="value"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all" 
                    placeholder="0.00" 
                  />
                  <p className="text-xs text-zinc-500 mt-1">Use negativo para despesas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Data</label>
                  <input 
                    name="date"
                    required
                    defaultValue={currentTransaction.date}
                    type="date" 
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
                  <select 
                    name="category"
                    required
                    defaultValue={currentTransaction.category}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Serviço">Serviço (Receita)</option>
                    <option value="Combustível">Combustível</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Seguros">Seguros</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                  <select 
                    name="status"
                    required
                    defaultValue={currentTransaction.status}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Recebido" disabled={Number(formValue) < 0}>Recebido</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
