import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: number;
  description: string;
  category: string;
  value: number;
  date: string;
  status: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver: string;
  status: string;
  lastMaintenance: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface CTE {
  id: number;
  noteNumber: string;
  series: string;
  companyName: string;
  grossValue: number;
  netValue: number;
  date: string;
  file?: string;
  status: 'Emitido' | 'Cancelado' | 'Autorizado';
}

interface DataContextType {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: number) => void;
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  ctes: CTE[];
  addCTE: (cte: CTE) => void;
  deleteCTE: (id: number) => void;
  notifications: Notification[];
  markAllNotificationsAsRead: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  { id: 1, description: 'Manutenção Caminhão Volvo FH', category: 'Manutenção', value: -2500.00, date: '2026-02-20', status: 'Pago' },
  { id: 2, description: 'Frete São Paulo - Rio', category: 'Serviço', value: 4500.00, date: '2026-02-19', status: 'Recebido' },
  { id: 3, description: 'Abastecimento Frota', category: 'Combustível', value: -1200.00, date: '2026-02-18', status: 'Pendente' },
  { id: 4, description: 'Frete Curitiba - Florianópolis', category: 'Serviço', value: 3200.00, date: '2026-02-18', status: 'Recebido' },
  { id: 5, description: 'Seguro Frota Mensal', category: 'Seguros', value: -5000.00, date: '2026-02-15', status: 'Pago' },
  { id: 6, description: 'Frete Minas - SP', category: 'Serviço', value: 5500.00, date: '2026-02-21', status: 'Recebido' },
  { id: 7, description: 'Troca de Pneus', category: 'Manutenção', value: -3200.00, date: '2026-02-22', status: 'Pendente' },
];

const initialVehicles: Vehicle[] = [
  { id: 'V001', plate: 'ABC-1234', model: 'Volvo FH 540', driver: 'João Silva', status: 'Em Viagem', lastMaintenance: '2026-01-15' },
  { id: 'V002', plate: 'DEF-5678', model: 'Scania R450', driver: 'Pedro Santos', status: 'Disponível', lastMaintenance: '2026-02-10' },
  { id: 'V003', plate: 'GHI-9012', model: 'Mercedes Actros', driver: 'Carlos Oliveira', status: 'Manutenção', lastMaintenance: '2025-12-20' },
  { id: 'V004', plate: 'JKL-3456', model: 'DAF XF', driver: 'Marcos Souza', status: 'Em Viagem', lastMaintenance: '2026-01-30' },
];

const initialNotifications: Notification[] = [
  { id: 1, title: 'Novo Frete Disponível', message: 'Carga para São Paulo aguardando confirmação.', time: '5 min atrás', read: false },
  { id: 2, title: 'Manutenção Próxima', message: 'Veículo ABC-1234 precisa de revisão em 500km.', time: '1 hora atrás', read: false },
  { id: 3, title: 'Pagamento Recebido', message: 'Fatura #4521 foi compensada com sucesso.', time: '2 horas atrás', read: false },
  { id: 4, title: 'Reunião de Diretoria', message: 'Lembrete: Reunião mensal às 14h.', time: '3 horas atrás', read: false },
];

const initialCTEs: CTE[] = [
  { id: 1, noteNumber: '001234', series: '1', companyName: 'Indústria ABC Ltda', grossValue: 5000.00, netValue: 4800.00, date: '2026-02-20', status: 'Autorizado', file: 'cte_1234.xml' },
  { id: 2, noteNumber: '001235', series: '1', companyName: 'Comércio XYZ S.A.', grossValue: 3200.00, netValue: 3050.00, date: '2026-02-21', status: 'Emitido' },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [ctes, setCtes] = useState<CTE[]>(initialCTEs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');

  const addTransaction = (t: Transaction) => setTransactions(prev => [t, ...prev]);
  const updateTransaction = (t: Transaction) => setTransactions(prev => prev.map(item => item.id === t.id ? t : item));
  const deleteTransaction = (id: number) => setTransactions(prev => prev.filter(item => item.id !== id));
  
  const addVehicle = (v: Vehicle) => setVehicles(prev => [v, ...prev]);
  const updateVehicle = (v: Vehicle) => setVehicles(prev => prev.map(item => item.id === v.id ? v : item));
  const deleteVehicle = (id: string) => setVehicles(prev => prev.filter(item => item.id !== id));

  const addCTE = (cte: CTE) => setCtes(prev => [cte, ...prev]);
  const deleteCTE = (id: number) => setCtes(prev => prev.filter(item => item.id !== id));

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DataContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      ctes,
      addCTE,
      deleteCTE,
      notifications,
      markAllNotificationsAsRead,
      searchTerm,
      setSearchTerm
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
