import React, { useMemo } from 'react';
import { Layout } from '../components/Layout';
import { FileText, Download, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { format, parseISO, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Relatorios() {
  const { transactions } = useData();

  const reports = useMemo(() => {
    // Group transactions by month
    const grouped: Record<string, { date: Date, count: number, totalValue: number }> = {};

    transactions.forEach(t => {
      const date = parseISO(t.date);
      const key = format(date, 'yyyy-MM');
      
      if (!grouped[key]) {
        grouped[key] = {
          date: date,
          count: 0,
          totalValue: 0
        };
      }
      
      grouped[key].count += 1;
      grouped[key].totalValue += t.value;
    });

    return Object.values(grouped)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(group => ({
        title: `Relatório Financeiro - ${format(group.date, 'MMMM yyyy', { locale: ptBR })}`,
        displayDate: format(group.date, 'MMM yyyy', { locale: ptBR }),
        size: `${(group.count * 0.5).toFixed(1)} KB`, // Mock size based on count
        details: `${group.count} transações`,
        rawDate: group.date
      }));
  }, [transactions]);

  const handleDownload = (report: any) => {
    // Generate CSV content for the specific month
    const monthTransactions = transactions.filter(t => {
      const tDate = parseISO(t.date);
      return getYear(tDate) === getYear(report.rawDate) && getMonth(tDate) === getMonth(report.rawDate);
    });

    const csvContent = [
      ['ID', 'Descrição', 'Categoria', 'Data', 'Valor', 'Status'],
      ...monthTransactions.map(t => [
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
    link.download = `relatorio_${format(report.rawDate, 'yyyy_MM')}.csv`;
    link.click();
  };

  return (
    <Layout title="Relatórios">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <Filter className="w-4 h-4" />
            Filtrar por Período
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p>Nenhum relatório disponível com os dados atuais.</p>
          </div>
        ) : (
          reports.map((report, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-100 rounded-lg group-hover:bg-yellow-100 group-hover:text-yellow-700 transition-colors">
                  <FileText className="w-6 h-6 text-zinc-500 group-hover:text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 capitalize">{report.title}</h3>
                  <p className="text-sm text-zinc-500 capitalize">{report.displayDate} • {report.size} • {report.details}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(report)}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Baixar CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
        
        {/* Static Mock Reports for other categories to flesh out the UI */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
              <FileText className="w-6 h-6 text-zinc-500 group-hover:text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-900">Relatório de Manutenção da Frota</h3>
              <p className="text-sm text-zinc-500">Jan 2026 • 1.8 MB • Análise Técnica</p>
            </div>
          </div>
          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
