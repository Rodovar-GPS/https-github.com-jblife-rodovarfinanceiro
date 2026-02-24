import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Filter, Download, MoreHorizontal, FileText, Cloud, Upload, Trash2, CheckCircle, AlertCircle, ExternalLink, X } from 'lucide-react';
import { useData, CTE } from '../contexts/DataContext';

export default function CtePage() {
  const { ctes, addCTE, deleteCTE, searchTerm } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigHelpOpen, setIsConfigHelpOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
    return sessionStorage.getItem('google_access_token');
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.token) {
        setGoogleToken(event.data.token);
        sessionStorage.setItem('google_access_token', event.data.token);
        alert('Google Drive conectado com sucesso!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectDrive = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      
      // Check if Client ID is configured
      if (url.includes('client_id=&')) {
        setIsConfigHelpOpen(true);
        return;
      }
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        url,
        'google_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Erro ao conectar com Google Drive. Verifique a configuração.');
    }
  };

  const uploadToDrive = async (file: File): Promise<string | null> => {
    if (!googleToken) return null;

    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    try {
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.webViewLink;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload para o Google Drive.');
      return null;
    }
  };

  const filteredCtes = useMemo(() => {
    return ctes.filter(cte => 
      cte.noteNumber.includes(searchTerm) || 
      cte.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ctes, searchTerm]);

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este CTE?')) {
      deleteCTE(id);
      setActiveMenu(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const file = formData.get('file') as File;
    let driveLink = null;

    if (file.name && googleToken) {
      setIsUploading(true);
      driveLink = await uploadToDrive(file);
      setIsUploading(false);
    } else if (file.name && !googleToken) {
      alert('Conecte ao Google Drive para salvar o arquivo na nuvem.');
      return;
    }

    finalizeSave(formData, file.name, driveLink);
  };

  const finalizeSave = (formData: FormData, fileName?: string, driveLink?: string | null) => {
    const newCTE: CTE = {
      id: Date.now(),
      noteNumber: formData.get('noteNumber') as string,
      series: formData.get('series') as string,
      companyName: formData.get('companyName') as string,
      grossValue: Number(formData.get('grossValue')),
      netValue: Number(formData.get('netValue')),
      date: formData.get('date') as string,
      status: 'Emitido',
      file: driveLink || fileName // Store the link if available, else filename
    };

    addCTE(newCTE);
    setIsModalOpen(false);
  };

  return (
    <Layout title="Emissão de CTE">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button 
            onClick={handleConnectDrive}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${googleToken ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
          >
            <Cloud className={`w-4 h-4 ${googleToken ? 'text-green-600' : 'text-blue-500'}`} />
            {googleToken ? 'Drive Conectado' : 'Conectar Drive'}
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo CTE
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Número / Série</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valores</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Arquivo</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredCtes.map((cte) => (
              <tr key={cte.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{cte.noteNumber}</p>
                      <p className="text-xs text-zinc-500">Série {cte.series}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-700">{cte.companyName}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{new Date(cte.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-zinc-900">Líq: R$ {cte.netValue.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">Bruto: R$ {cte.grossValue.toFixed(2)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${cte.status === 'Autorizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {cte.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {cte.file ? (
                    cte.file.startsWith('http') ? (
                      <a href={cte.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-xs">Ver no Drive</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-1 text-zinc-500">
                        <FileText className="w-3 h-3" />
                        <span className="text-xs">{cte.file}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-zinc-400">Pendente</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500 relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === cte.id ? null : cte.id)}
                    className="p-1 hover:bg-zinc-100 rounded-full"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {activeMenu === cte.id && (
                    <div className="absolute right-8 top-8 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 w-32 z-10">
                      <button 
                        onClick={() => handleDelete(cte.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Novo Conhecimento de Transporte (CTE)</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Número da Nota</label>
                    <input name="noteNumber" required type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Ex: 001234" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Série</label>
                    <input name="series" required type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Emissão</label>
                    <input name="date" required type="date" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nome da Empresa</label>
                    <input name="companyName" required type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Razão Social" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Valor Bruto</label>
                      <input name="grossValue" required type="number" step="0.01" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Valor Líquido</label>
                      <input name="netValue" required type="number" step="0.01" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Armazenamento em Nuvem</label>
                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative ${googleToken ? 'border-green-300 bg-green-50 hover:bg-green-100' : 'border-zinc-300 hover:bg-zinc-50'}`}>
                  <input type="file" name="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Cloud className={`w-8 h-8 mb-2 ${googleToken ? 'text-green-500' : 'text-blue-500'}`} />
                  <p className="text-sm font-medium text-zinc-900">
                    {googleToken ? 'Clique para selecionar o arquivo' : 'Conecte ao Drive para fazer upload'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {googleToken ? 'Será salvo automaticamente no Google Drive' : 'Necessário autenticação'}
                  </p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">rodovartransportadora@gmail.com</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isUploading ? (
                    <>
                      <Upload className="w-4 h-4 animate-bounce" />
                      Enviando para Drive...
                    </>
                  ) : (
                    'Emitir e Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isConfigHelpOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setIsConfigHelpOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Configuração Necessária
            </h3>
            <div className="space-y-4 text-sm text-zinc-600">
              <p>Para conectar ao Google Drive, você precisa configurar o <strong>GOOGLE_CLIENT_ID</strong>.</p>
              
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <p className="font-medium text-zinc-900 mb-2">Passo a Passo:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.</li>
                  <li>Crie um projeto e habilite a <strong>Google Drive API</strong>.</li>
                  <li>Em "Credenciais", crie um <strong>ID do cliente OAuth</strong>.</li>
                  <li>Adicione a seguinte URL em <strong>Origens JavaScript autorizadas</strong>:
                    <code className="block mt-1 bg-white p-1 rounded border border-zinc-200 text-xs">{window.location.origin}</code>
                  </li>
                  <li>Adicione a seguinte URL em <strong>URIs de redirecionamento autorizados</strong>:
                    <code className="block mt-1 bg-white p-1 rounded border border-zinc-200 text-xs">{window.location.origin}/auth/callback</code>
                  </li>
                  <li>Copie o "ID do cliente" e adicione à variável de ambiente <code>GOOGLE_CLIENT_ID</code> no painel de segredos do AI Studio.</li>
                </ol>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsConfigHelpOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
