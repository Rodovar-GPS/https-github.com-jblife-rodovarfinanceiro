import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Clock, Calendar, Filter, ChevronDown, FileText, Download, MoreHorizontal } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { format, parseISO, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatCard = ({ title, value, trend, trendUp, icon: Icon, subtext }: any) => (
  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-zinc-100 rounded-lg">
        <Icon className="w-6 h-6 text-zinc-700" />
      </div>
      <span className={`text-sm font-medium px-2 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trend === 'Pendente' ? <Clock className="w-3 h-3" /> : (trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
        {trend}
      </span>
    </div>
    <h3 className="text-zinc-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
    {subtext && <p className="text-xs text-zinc-400 mt-2">{subtext}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-xl border border-zinc-800">
        <p className="font-medium mb-2 capitalize">{payload[0].payload.fullName}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-mono font-medium">
              R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { transactions, searchTerm } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => getYear(parseISO(t.date))));
    years.add(new Date().getFullYear());
    // Filter to only include 2026 and onwards
    return Array.from(years)
      .filter(year => year >= 2026)
      .sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by year
    filtered = filtered.filter(t => getYear(parseISO(t.date)) === selectedYear);

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(t => getMonth(parseISO(t.date)) === parseInt(selectedMonth));
    }

    // Filter by View Mode (Income/Expense)
    if (viewMode === 'income') {
      filtered = filtered.filter(t => t.value > 0);
    } else if (viewMode === 'expense') {
      filtered = filtered.filter(t => t.value < 0);
    }

    // Filter by Status
    if (statusFilter === 'pending') {
      filtered = filtered.filter(t => t.status === 'Pendente');
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'Pago' || t.status === 'Recebido');
    }

    return filtered;
  }, [transactions, searchTerm, selectedYear, viewMode, statusFilter]);

  const pendingTransactions = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Pendente')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const stats = useMemo(() => {
    const receita = filteredTransactions.filter(t => t.value > 0).reduce((acc, t) => acc + t.value, 0);
    const despesa = filteredTransactions.filter(t => t.value < 0).reduce((acc, t) => acc + Math.abs(t.value), 0);
    const lucro = receita - despesa;
    const entregas = filteredTransactions.filter(t => t.category === 'Serviço').length;
    const pendente = filteredTransactions.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.value, 0);

    return { receita, despesa, lucro, entregas, pendente };
  }, [filteredTransactions]);

  // Generate chart data aggregated by month
  const chartData = useMemo(() => {
    const data = Array(12).fill(0).map((_, index) => ({
      name: format(new Date(selectedYear, index, 1), 'MMM', { locale: ptBR }),
      fullName: format(new Date(selectedYear, index, 1), 'MMMM yyyy', { locale: ptBR }),
      receita: 0,
      despesa: 0,
      saldo: 0,
      monthIndex: index
    }));

    filteredTransactions.forEach(t => {
      const date = parseISO(t.date);
      const month = getMonth(date);
      if (t.value > 0) {
        data[month].receita += t.value;
      } else {
        data[month].despesa += Math.abs(t.value);
      }
    });

    // Calculate balance
    data.forEach(item => {
      item.saldo = item.receita - item.despesa;
    });

    return data;
  }, [filteredTransactions, selectedYear]);

  // Recent Transactions (Last 5)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  // Dynamic Reports based on data
  const generatedReports = useMemo(() => {
    const months = new Set(filteredTransactions.map(t => t.date.substring(0, 7))); // YYYY-MM
    return Array.from(months).sort().reverse().slice(0, 4).map(monthStr => {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        title: `Relatório Financeiro - ${format(date, 'MMMM yyyy', { locale: ptBR })}`,
        date: format(date, 'MMM yyyy', { locale: ptBR }),
        size: '2.4 MB' // Mock size
      };
    });
  }, [filteredTransactions]);

  return (
    <Layout title="Visão Geral">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Período:</span>
          <div className="relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pr-8 font-medium cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 text-zinc-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pr-8 font-medium cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              <option value="all">Todos os Meses</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {format(new Date(selectedYear, i, 1), 'MMMM', { locale: ptBR }).charAt(0).toUpperCase() + format(new Date(selectedYear, i, 1), 'MMMM', { locale: ptBR }).slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Geral
          </button>
          <button 
            onClick={() => setViewMode('income')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Entradas
          </button>
          <button 
            onClick={() => setViewMode('expense')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Saídas
          </button>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Todos Status
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'pending' ? 'bg-white text-yellow-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Pendentes
          </button>
          <button 
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'completed' ? 'bg-white text-green-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Concluídos
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Receita Total" 
          value={`R$ ${stats.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={selectedYear.toString()}
          trendUp={true} 
          icon={DollarSign}
          subtext="Total acumulado no ano"
        />
        <StatCard 
          title="Despesas" 
          value={`R$ ${stats.despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={selectedYear.toString()}
          trendUp={false} 
          icon={ArrowDownRight}
          subtext="Total acumulado no ano"
        />
        <StatCard 
          title="Lucro Líquido" 
          value={`R$ ${stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={stats.lucro >= 0 ? "Positivo" : "Negativo"}
          trendUp={stats.lucro >= 0} 
          icon={TrendingUp}
          subtext="Receitas - Despesas"
        />
        <StatCard 
          title="Aguardando Pagamento" 
          value={`R$ ${stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="Pendente" 
          trendUp={stats.pendente >= 0} 
          icon={Clock}
          subtext="Valores a compensar"
        />
        <StatCard 
          title="Entregas Realizadas" 
          value={stats.entregas}
          trend="Serviços"
          trendUp={true} 
          icon={TrendingUp}
          subtext="Total de fretes no ano"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Fluxo de Caixa Chart */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">Fluxo de Caixa - {selectedYear}</h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Receita</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-900"></div>Despesa</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717A', fontSize: 12}} 
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717A', fontSize: 12}} 
                  tickFormatter={(value) => `R$${value/1000}k`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#F4F4F5'}} />
                {(viewMode === 'all' || viewMode === 'income') && (
                  <Bar dataKey="receita" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Receita" maxBarSize={50} />
                )}
                {(viewMode === 'all' || viewMode === 'expense') && (
                  <Bar dataKey="despesa" fill="#18181B" radius={[4, 4, 0, 0]} name="Despesa" maxBarSize={50} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desempenho Mensal Chart */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Evolução Financeira - {selectedYear}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717A', fontSize: 12}}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717A', fontSize: 12}}
                  tickFormatter={(value) => `R$${value/1000}k`} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(viewMode === 'all' || viewMode === 'income') && (
                  <Line 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#FBBF24" 
                    strokeWidth={3} 
                    dot={{fill: '#FBBF24', strokeWidth: 2, r: 4}} 
                    activeDot={{r: 6}}
                    name="Receita"
                  />
                )}
                {(viewMode === 'all' || viewMode === 'expense') && (
                  <Line 
                    type="monotone" 
                    dataKey="despesa" 
                    stroke="#18181B" 
                    strokeWidth={3} 
                    dot={{fill: '#18181B', strokeWidth: 2, r: 4}} 
                    activeDot={{r: 6}}
                    name="Despesa"
                  />
                )}
                {viewMode === 'all' && (
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{fill: '#22c55e', strokeWidth: 2, r: 3}} 
                    name="Saldo Líquido"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Transactions Section */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-yellow-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-zinc-900">Aguardando Pagamento / Recebimento</h3>
            </div>
            <span className="text-sm font-medium text-zinc-600">
              Total Pendente: <span className="text-zinc-900 font-bold">R$ {stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pendingTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      Nenhuma pendência encontrada.
                    </td>
                  </tr>
                ) : (
                  pendingTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{t.description}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{format(parseISO(t.date), 'dd/MM/yyyy')}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${t.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.value > 0 ? '+' : ''} R$ {Math.abs(t.value).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.value > 0 ? 'A Receber' : 'A Pagar'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-zinc-900">Últimas Movimentações</h3>
            <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">Ver todas</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Nenhuma movimentação recente.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-zinc-900">{transaction.description}</p>
                      <p className="text-xs text-zinc-500">{transaction.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${transaction.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.value > 0 ? '+' : ''} R$ {Math.abs(transaction.value).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${transaction.status === 'Pago' || transaction.status === 'Recebido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Generated Reports */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900">Relatórios Recentes</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {generatedReports.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                Nenhum relatório disponível.
              </div>
            ) : (
              generatedReports.map((report, index) => (
                <div key={index} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-yellow-100 group-hover:text-yellow-700 transition-colors">
                      <FileText className="w-5 h-5 text-zinc-500 group-hover:text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-900">{report.title}</h4>
                      <p className="text-xs text-zinc-500 capitalize">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center">
            <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Ver todos os relatórios</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
