import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Send, Paperclip, MoreVertical, Phone, Video, Users, Search } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  user?: string;
}

const initialMessages: Message[] = [
  { id: 1, text: 'Bom dia, equipe! Como estão os números deste mês?', sender: 'other', time: '09:00', user: 'Roberto (CEO)' },
  { id: 2, text: 'Bom dia, Roberto. Estamos fechando o relatório, mas a previsão é positiva.', sender: 'me', time: '09:05' },
  { id: 3, text: 'Ótimo. Precisamos alinhar a expansão da frota para o próximo trimestre.', sender: 'other', time: '09:10', user: 'Roberto (CEO)' },
  { id: 4, text: 'Já tenho os orçamentos da Volvo e Scania.', sender: 'other', time: '09:12', user: 'Ana (Logística)' },
  { id: 5, text: 'Perfeito. Vamos marcar uma reunião para apresentar isso?', sender: 'me', time: '09:15' },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simular resposta
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        text: 'Ok, anotado.',
        sender: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Roberto (CEO)'
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <Layout title="Sala de Reunião - Diretoria">
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Sidebar do Chat */}
        <div className="w-80 border-r border-zinc-200 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-zinc-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Buscar conversas..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-zinc-900">Diretoria Geral</h4>
                <span className="text-xs text-zinc-500">09:15</span>
              </div>
              <p className="text-sm text-zinc-600 truncate">Você: Perfeito. Vamos marcar...</p>
            </div>
            <div className="p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-zinc-900">Financeiro</h4>
                <span className="text-xs text-zinc-500">Ontem</span>
              </div>
              <p className="text-sm text-zinc-500 truncate">Ana: O relatório está pronto.</p>
            </div>
            <div className="p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-zinc-900">Logística</h4>
                <span className="text-xs text-zinc-500">Seg</span>
              </div>
              <p className="text-sm text-zinc-500 truncate">Carlos: Caminhão V004 chegou.</p>
            </div>
          </div>
        </div>

        {/* Área Principal do Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header do Chat */}
          <div className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">Diretoria Geral</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  4 online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-400">
              <button className="hover:text-zinc-600 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="hover:text-zinc-600 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="hover:text-zinc-600 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.sender === 'me' ? 'bg-yellow-500 text-zinc-900' : 'bg-white border border-zinc-200 text-zinc-800'} rounded-2xl px-4 py-3 shadow-sm`}>
                  {msg.sender === 'other' && (
                    <p className="text-xs font-bold text-zinc-500 mb-1">{msg.user}</p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-yellow-800/70' : 'text-zinc-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-zinc-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button type="button" className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-2.5 bg-yellow-500 text-zinc-900 rounded-full hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
