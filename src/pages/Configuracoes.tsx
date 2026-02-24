import React from 'react';
import { Layout } from '../components/Layout';
import { User, Bell, Shield, CreditCard } from 'lucide-react';

export default function Configuracoes() {
  return (
    <Layout title="Configurações">
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900">Perfil da Empresa</h3>
            <p className="text-sm text-zinc-500">Gerencie as informações da sua transportadora.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome da Empresa</label>
                <input type="text" defaultValue="Rodovar Transportadora e Logística" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">CNPJ</label>
                <input type="text" defaultValue="12.345.678/0001-90" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-50 px-6 py-4 flex justify-end">
            <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="font-medium text-zinc-900 mb-2">Notificações</h4>
            <p className="text-sm text-zinc-500 mb-4">Configure como você recebe alertas sobre a frota e financeiro.</p>
            <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">Gerenciar</button>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-zinc-900 mb-2">Segurança</h4>
            <p className="text-sm text-zinc-500 mb-4">Altere senhas e configure autenticação de dois fatores.</p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Gerenciar</button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-zinc-900 mb-2">Faturamento</h4>
            <p className="text-sm text-zinc-500 mb-4">Gerencie métodos de pagamento e dados bancários.</p>
            <button className="text-sm font-medium text-green-600 hover:text-green-700">Gerenciar</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
