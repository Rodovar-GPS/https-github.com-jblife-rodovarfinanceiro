import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Truck, User, AlertCircle, CheckCircle, Plus, Search, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import { useData, Vehicle } from '../contexts/DataContext';

export default function Frota() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, searchTerm } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'Disponível').length,
      maintenance: vehicles.filter(v => v.status === 'Manutenção').length,
      traveling: vehicles.filter(v => v.status === 'Em Viagem').length
    };
  }, [vehicles]);

  const handleAddNew = () => {
    setCurrentVehicle({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditing(true);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      deleteVehicle(id);
      setActiveMenu(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newVehicle: Vehicle = {
      id: isEditing ? currentVehicle.id! : `V${Date.now()}`,
      plate: formData.get('plate') as string,
      model: formData.get('model') as string,
      driver: formData.get('driver') as string,
      status: formData.get('status') as string,
      lastMaintenance: formData.get('lastMaintenance') as string,
    };

    if (isEditing) {
      updateVehicle(newVehicle);
    } else {
      addVehicle(newVehicle);
    }
    setIsModalOpen(false);
  };

  return (
    <Layout title="Gestão de Frota">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Total de Veículos</p>
            <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Disponíveis</p>
            <p className="text-2xl font-bold text-zinc-900">{stats.available}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Em Manutenção</p>
            <p className="text-2xl font-bold text-zinc-900">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-visible min-h-[400px]">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-zinc-900">Veículos Cadastrados</h3>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Veículo
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Placa</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Modelo</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Motorista</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Última Manutenção</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  Nenhum veículo encontrado.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{vehicle.plate}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{vehicle.model}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    {vehicle.driver}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${vehicle.status === 'Disponível' ? 'bg-green-100 text-green-700' : 
                        vehicle.status === 'Em Viagem' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{new Date(vehicle.lastMaintenance).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500 relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === vehicle.id ? null : vehicle.id)}
                      className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {activeMenu === vehicle.id && (
                      <div className="absolute right-8 top-8 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 w-32 z-10">
                        <button 
                          onClick={() => handleEdit(vehicle)}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(vehicle.id)}
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
              {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Placa</label>
                  <input 
                    name="plate"
                    required
                    defaultValue={currentVehicle.plate}
                    type="text" 
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                    placeholder="ABC-1234" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Modelo</label>
                  <input 
                    name="model"
                    required
                    defaultValue={currentVehicle.model}
                    type="text" 
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                    placeholder="Ex: Volvo FH" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Motorista</label>
                <input 
                  name="driver"
                  required
                  defaultValue={currentVehicle.driver}
                  type="text" 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                  placeholder="Nome do Motorista" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                  <select 
                    name="status"
                    required
                    defaultValue={currentVehicle.status}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Em Viagem">Em Viagem</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Última Manutenção</label>
                  <input 
                    name="lastMaintenance"
                    required
                    defaultValue={currentVehicle.lastMaintenance}
                    type="date" 
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                  />
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
