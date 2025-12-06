import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Plus, FileText, Trash2, List, TrendingUp, Sparkles, Loader 
} from 'lucide-react';
import { Edital, ViewState, Topic } from './types';
import { parseEditalWithAI } from './services/gemini';
import { ConfirmationModal, InputModal, AITutorModal, AnalysisModal } from './components/Modals';
import { SubjectCard } from './components/StudyComponents';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [editals, setEditals] = useState<Edital[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('edital_app_data');
    if (saved) {
      try {
        setEditals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('edital_app_data', JSON.stringify(editals));
  }, [editals]);

  const handleDelete = () => {
    if (deleteId) {
      setEditals(prev => prev.filter(e => e.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleUpdateEdital = (updated: Edital) => {
    setEditals(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2"><List className="text-indigo-600"/> Meus Editais</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <button onClick={() => setView('import')} className="p-8 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex flex-col items-center justify-center font-bold transition-all hover:scale-[1.02]">
          <Plus size={24} className="mb-2"/> Novo Edital
        </button>
        {editals.map(e => (
          <div key={e.id} className="bg-white p-6 rounded-xl shadow border border-slate-200 hover:shadow-md transition-all relative">
            <h3 className="font-bold text-xl text-slate-800 mb-2 flex items-center gap-2 truncate">
              <FileText size={20} className="text-slate-400"/> {e.title}
            </h3>
            <div className="text-xs text-slate-400 mb-4">Criado em: {new Date(e.createdAt).toLocaleDateString()}</div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setCurrentId(e.id); setView('study'); }} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded font-medium transition-colors">Abrir</button>
              <button onClick={(ev) => { ev.stopPropagation(); setDeleteId(e.id); }} className="px-3 text-red-500 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir Edital?" message="Esta ação não pode ser desfeita. Todo o progresso será perdido." />
    </div>
  );

  const ImportScreen = () => {
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('Conectando com a IA...');

    // Efeito para rotacionar mensagens de carregamento
    useEffect(() => {
      if (!loading) return;
      
      const messages = [
        "Lendo o conteúdo do edital...",
        "Identificando as matérias...",
        "Separando os tópicos...",
        "Organizando a hierarquia...",
        "Finalizando a estruturação...",
        "Quase pronto..."
      ];
      
      let index = 0;
      setLoadingMessage(messages[0]);
      
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 2500);

      return () => clearInterval(interval);
    }, [loading]);

    const handleImport = async () => {
      if (!text.trim() || !title.trim()) return setError("Preencha todos os campos.");
      setLoading(true);
      setError('');
      try {
        const newEdital = await parseEditalWithAI(text, title);
        setEditals(prev => [...prev, newEdital]);
        setView('dashboard');
      } catch (err: any) {
        setError(err.message || "Erro ao processar.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
        <button onClick={() => setView('dashboard')} className="mb-4 flex items-center text-slate-500 hover:text-slate-800 font-medium"><ArrowLeft size={18} className="mr-2"/> Voltar</button>
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center text-center p-4">
              <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
              <p className="text-indigo-900 font-extrabold text-xl animate-pulse mb-2">{loadingMessage}</p>
              <p className="text-slate-500 text-sm">Otimizamos o processo para ser mais rápido!</p>
            </div>
          )}
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2"><Sparkles className="text-indigo-500"/> Importar com IA</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Concurso/Edital</label>
              <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: Receita Federal 2024" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Conteúdo do Edital (Copie e Cole)</label>
              <textarea className="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cole aqui a lista de matérias do PDF..." value={text} onChange={e => setText(e.target.value)}></textarea>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 text-sm rounded-lg font-medium flex items-center gap-2"><Trash2 size={16}/> {error}</div>}
            <button onClick={handleImport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold flex justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"><Sparkles size={18}/> Gerar Edital Verticalizado</button>
          </div>
        </div>
      </div>
    );
  };

  const StudyScreen = () => {
    const edital = editals.find(e => e.id === currentId);
    const [activeTab, setActiveTab] = useState(0);
    const [aiModal, setAiModal] = useState({ open: false, topic: '', subject: '' });
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [inputModal, setInputModal] = useState({ isOpen: false, title: '', onConfirm: (v: string) => {}, placeholder: '', initialValue: '' });

    if (!edital) return null;

    // Helper to deeply update topics
    const updateTopic = (topics: Topic[], id: string, fn: (t: Topic) => Topic): Topic[] => {
      return topics.map(t => {
        if (t.id === id) return fn(t);
        if (t.children) return { ...t, children: updateTopic(t.children, id, fn) };
        return t;
      });
    };

    const handleUpdate = (catId: string, subId: string, topicId: string, fn: (t: Topic) => Topic) => {
      const updated = {
        ...edital,
        categories: edital.categories.map(c => c.id !== catId ? c : {
          ...c,
          subjects: c.subjects.map(s => s.id !== subId ? s : { ...s, topics: updateTopic(s.topics, topicId, fn) })
        })
      };
      handleUpdateEdital(updated);
    };

    const toggleSeen = (catId: string, subId: string, tId: string) => handleUpdate(catId, subId, tId, t => ({ ...t, seen: !t.seen }));
    
    const addReview = (catId: string, subId: string, tId: string, stats: any) => handleUpdate(catId, subId, tId, t => ({
      ...t, seen: true, nextReview: stats.nextReview, reviews: [...(t.reviews || []), { date: new Date().toISOString(), total: stats.total, hits: stats.hits, notes: stats.notes }]
    }));

    const deleteReview = (catId: string, subId: string, tId: string, idx: number) => handleUpdate(catId, subId, tId, t => {
      const r = [...t.reviews]; r.splice(idx, 1); return { ...t, reviews: r };
    });

    const addTopic = (catId: string, subId: string, text: string) => {
       const newTopic: Topic = { id: `u_${Date.now()}`, text, seen: false, reviews: [] };
       const updated = { ...edital, categories: edital.categories.map(c => c.id !== catId ? c : { ...c, subjects: c.subjects.map(s => s.id !== subId ? s : { ...s, topics: [...s.topics, newTopic] }) }) };
       handleUpdateEdital(updated);
       setInputModal(p => ({ ...p, isOpen: false }));
    };

    return (
      <div className="min-h-screen bg-slate-100 pb-20 animate-fadeIn">
        <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setView('dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
              <h1 className="text-lg font-bold text-slate-800 truncate flex-1 ml-4">{edital.title}</h1>
              <button onClick={() => setAnalysisOpen(true)} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-200"><TrendingUp size={16}/> Análise</button>
            </div>
          </div>
          <div className="flex overflow-x-auto border-t border-slate-200 bg-slate-50 hide-scrollbar px-4">
            {edital.categories.map((cat, idx) => (
              <button key={cat.id} onClick={() => setActiveTab(idx)} className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === idx ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>{cat.title}</button>
            ))}
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          {edital.categories[activeTab]?.subjects.map(subject => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              catId={edital.categories[activeTab].id}
              onToggleSeen={toggleSeen}
              onAddReview={addReview}
              onDeleteReview={deleteReview}
              onDeleteTopic={(c, s, t) => handleUpdate(c, s, t, () => ({} as any))} 
              onDeleteSubject={() => {}}
              onAddTopic={() => setInputModal({ isOpen: true, title: 'Novo Tópico', placeholder: 'Nome', initialValue: '', onConfirm: (val) => addTopic(edital.categories[activeTab].id, subject.id, val) })}
              onAddSubtopic={(pId) => handleUpdate(edital.categories[activeTab].id, subject.id, pId, t => ({ ...t, children: [...(t.children || []), { id: `s_${Date.now()}`, text: 'Novo Subtópico', seen: false, reviews: [] }] }))}
              onOpenAI={(text) => setAiModal({ open: true, topic: text, subject: subject.title })}
              onReorder={() => {}} 
              onEditTopic={(id, text) => handleUpdate(edital.categories[activeTab].id, subject.id, id, t => ({...t, text}))}
            />
          ))}
        </main>
        <AITutorModal isOpen={aiModal.open} onClose={() => setAiModal({ ...aiModal, open: false })} topicText={aiModal.topic} subjectTitle={aiModal.subject} />
        <AnalysisModal isOpen={analysisOpen} onClose={() => setAnalysisOpen(false)} data={edital} />
        <InputModal {...inputModal} onClose={() => setInputModal(p => ({ ...p, isOpen: false }))} />
      </div>
    );
  };

  return view === 'dashboard' ? renderDashboard() : view === 'import' ? <ImportScreen /> : <StudyScreen />;
}