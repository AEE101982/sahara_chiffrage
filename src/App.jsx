import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Send, CheckCircle, XCircle, Eye, LogOut, Users, ImagePlus, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://kvvcuainxntgtaykehyq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dmN1YWlueG50Z3RheWtlaHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjkwMDcsImV4cCI6MjA4MTMwNTAwN30.ZuZFl0on9s5Sa8hLwevUq6ksIJuO7hKIzH1Pft20oC8';
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur de parsing de l\'utilisateur:', error);
      }
    }
    
    loadData();
  }, []);

  // Sauvegarder l'utilisateur quand il change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*')
        .order('date', { ascending: false });
      
      const { data: usersData } = await supabase
        .from('users')
        .select('*');
      
      setQuotes(quotesData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    }
    setLoading(false);
  };

  // Fonction pour obtenir le label de l'usine
  const getUsineLabel = (usineKey) => {
    const usines = {
      'bois': 'Usine Bois',
      'metal': 'Usine Metal',
      'semi-metal': 'Usine Semi-Métallique'
    };
    return usines[usineKey] || usineKey;
  };

  const sendTelegramNotification = async (quote, selectedUsine) => {
    try {
      const message = `🔔 *Nouvelle demande de chiffrage*
      
🏭 *Usine:* ${getUsineLabel(selectedUsine)}
👤 *Commercial:* ${quote.commercial_name}
📅 *Date:* ${new Date(quote.date).toLocaleString('fr-FR')}
📋 *Nombre de lignes:* ${quote.lines.length}

*Détails par ligne:*
${quote.lines.map((line, idx) => {
  const lineText = `${idx + 1}. ${line.text}`;
  const imagesCount = line.images ? line.images.length : 0;
  return `${lineText} ${imagesCount > 0 ? `(${imagesCount} image${imagesCount > 1 ? 's' : ''})` : ''}`;
}).join('\n')}

📱 _Connectez-vous à l'application pour voir les images détaillées._`;

      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          usine: selectedUsine
        })
      });
      
    } catch (error) {
      console.error('Erreur notification Telegram:', error);
    }
  };

  // Composant de connexion
  const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (user) {
        setCurrentUser(user);
        setError('');
      } else {
        setError('Identifiants incorrects');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                  <span className="text-white font-bold text-2xl">SM</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-800">
              SAHARA MOBILIER
            </h1>
            <p className="text-gray-600 mt-2 text-center">Gestion des Chiffrages</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Entrez votre nom d'utilisateur"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Entrez votre mot de passe"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Se Connecter
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Gestion des utilisateurs
  const UserManagement = ({ onClose }) => {
    const [newUser, setNewUser] = useState({
      username: '',
      password: '',
      role: 'commercial',
      name: '',
      usine: 'bois'
    });

    const addUser = async () => {
      if (!newUser.username || !newUser.password || !newUser.name) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert([newUser]);

      if (error) {
        alert('Erreur : ' + error.message);
      } else {
        alert('Utilisateur créé avec succès');
        setNewUser({ username: '', password: '', role: 'commercial', name: '', usine: 'bois' });
        loadData();
      }
    };

    const deleteUser = async (userId) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        loadData();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-6 text-gray-800">Créer un nouvel utilisateur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="chef">Chef de Méthodes</option>
                    <option value="directeur">Directeur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: jdupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mot de passe"
                  />
                </div>
                {newUser.role === 'chef' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Usine attribuée</label>
                    <select
                      value={newUser.usine}
                      onChange={(e) => setNewUser({ ...newUser, usine: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="bois">Usine Bois</option>
                      <option value="metal">Usine Metal</option>
                      <option value="semi-metal">Usine Semi-Métallique</option>
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={addUser}
                className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Créer l'utilisateur
              </button>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 text-gray-800">Utilisateurs existants</h3>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-bold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          @{user.username}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                          {user.role === 'commercial' ? 'Commercial' : user.role === 'chef' ? 'Chef de Méthodes' : 'Directeur'}
                        </span>
                        {user.usine && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.usine === 'bois' ? 'bg-amber-100 text-amber-800' :
                            user.usine === 'metal' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {getUsineLabel(user.usine)}
                          </span>
                        )}
                      </div>
                    </div>
                    {user.username !== 'admin' && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profil Commercial
  const CommercialDashboard = () => {
    const [lines, setLines] = useState([{ 
      id: 1, 
      text: '', 
      images: []
    }]);
    const [usine, setUsine] = useState('bois');
    const [sentQuotes, setSentQuotes] = useState([]);

    useEffect(() => {
      setSentQuotes(quotes.filter(q => q.commercial_name === currentUser.name));
    }, [quotes]);

    const addLine = () => {
      setLines([...lines, { id: Date.now(), text: '', images: [] }]);
    };

    const removeLine = (id) => {
      if (lines.length > 1) {
        setLines(lines.filter(line => line.id !== id));
      }
    };

    const updateLine = (id, text) => {
      setLines(lines.map(line => line.id === id ? { ...line, text } : line));
    };

    const handleImageUpload = (lineId, e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLines(prev => prev.map(line => 
            line.id === lineId 
              ? { ...line, images: [...line.images, reader.result] }
              : line
          ));
        };
        reader.readAsDataURL(file);
      });
    };

    const removeImage = (lineId, imageIndex) => {
      setLines(prev => prev.map(line => 
        line.id === lineId 
          ? { ...line, images: line.images.filter((_, idx) => idx !== imageIndex) }
          : line
      ));
    };

    const sendQuote = async () => {
      const validLines = lines.filter(l => l.text.trim());
      if (validLines.length === 0) {
        alert('Veuillez ajouter au moins une ligne');
        return;
      }

      if (!usine) {
        alert('Veuillez sélectionner une usine');
        return;
      }

      const newQuote = {
        commercial_name: currentUser.name,
        lines: validLines,
        usine: usine,
        status: 'en_attente',
        date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select()
        .single();

      if (error) {
        alert('Erreur: ' + error.message);
      } else {
        await sendTelegramNotification(data, usine);
        setLines([{ id: Date.now(), text: '', images: [] }]);
        alert(`Demande envoyée avec succès à l'usine ${getUsineLabel(usine)} !`);
        loadData();
      }
    };

    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Nouvelle Demande de Chiffrage</h2>
            <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full">
              <Bell size={20} />
              <span className="font-semibold">Commercial</span>
            </div>
          </div>
          
          {/* Sélection de l'usine */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏭 Sélectionnez l'usine</h3>
            <p className="text-gray-600 mb-6">Choisissez l'usine concernée par votre demande</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Usine Bois */}
              <label className={`cursor-pointer transition-all ${usine === 'bois' ? 'transform scale-[1.02]' : ''}`}>
                <input
                  type="radio"
                  name="usine"
                  value="bois"
                  checked={usine === 'bois'}
                  onChange={(e) => setUsine(e.target.value)}
                  className="hidden"
                />
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  usine === 'bois' 
                    ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg' 
                    : 'border-gray-300 hover:border-amber-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      usine === 'bois' ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">🌲</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-800">Usine Bois</div>
                      <div className="text-sm text-gray-600">Menuiserie & Agencement</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Chef: <span className="font-semibold">M. Ahmed</span>
                  </div>
                </div>
              </label>
              
              {/* Usine Metal */}
              <label className={`cursor-pointer transition-all ${usine === 'metal' ? 'transform scale-[1.02]' : ''}`}>
                <input
                  type="radio"
                  name="usine"
                  value="metal"
                  checked={usine === 'metal'}
                  onChange={(e) => setUsine(e.target.value)}
                  className="hidden"
                />
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  usine === 'metal' 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg' 
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      usine === 'metal' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-800">Usine Metal</div>
                      <div className="text-sm text-gray-600">Métallerie & Structure</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Chef: <span className="font-semibold">M. Karim</span>
                  </div>
                </div>
              </label>
              
              {/* Usine Semi-Métallique */}
              <label className={`cursor-pointer transition-all ${usine === 'semi-metal' ? 'transform scale-[1.02]' : ''}`}>
                <input
                  type="radio"
                  name="usine"
                  value="semi-metal"
                  checked={usine === 'semi-metal'}
                  onChange={(e) => setUsine(e.target.value)}
                  className="hidden"
                />
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  usine === 'semi-metal' 
                    ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg' 
                    : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      usine === 'semi-metal' ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">🔩</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-800">Usine Semi-Métallique</div>
                      <div className="text-sm text-gray-600">Mixte Bois & Métal</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Chef: <span className="font-semibold">M. Youssef</span>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-500" />
                <span>La notification sera envoyée au chef de l'usine sélectionnée</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {lines.map((line, index) => (
              <div key={line.id} className="space-y-4 p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => updateLine(line.id, e.target.value)}
                      placeholder={`Décrivez la ligne ${index + 1}`}
                      className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="p-4 text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="ml-11">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Images pour cette ligne (optionnel)
                    </label>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {line.images.length} image(s)
                    </span>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer border-2 border-dashed border-gray-300">
                      <ImagePlus size={24} />
                      <span className="font-medium">Cliquer pour ajouter des images</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={(e) => handleImageUpload(line.id, e)} 
                        className="hidden" 
                      />
                    </label>
                    
                    {line.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {line.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                              <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <button
                              onClick={() => removeImage(line.id, idx)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={18} />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              Image {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={addLine}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Plus size={24} />
              Ajouter une ligne
            </button>
            <button
              onClick={sendQuote}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <Send size={24} />
                <div className="text-left">
                  <div className="font-bold">Envoyer pour Chiffrage</div>
                  <div className="text-sm font-normal opacity-90">
                    à l'usine {getUsineLabel(usine)}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Mes Demandes</h2>
          <div className="space-y-6">
            {sentQuotes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Bell size={48} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Aucune demande envoyée</p>
                <p className="text-gray-400 mt-2">Vos demandes de chiffrage apparaîtront ici</p>
              </div>
            ) : (
              sentQuotes.map(quote => (
                <div key={quote.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-600">
                        {new Date(quote.date).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">
                          Référence: #{quote.id.slice(0, 8)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          quote.usine === 'bois' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : quote.usine === 'metal'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {getUsineLabel(quote.usine)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-6 py-2 rounded-full text-sm font-bold ${
                      quote.status === 'en_attente' 
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200' 
                        : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {quote.status === 'en_attente' ? '⏳ En Attente' : '✅ Traitée'}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {quote.lines.map((line, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                            <span className="text-indigo-600 text-xs font-bold">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{line.text}</div>
                            {line.images && line.images.length > 0 && (
                              <div className="mt-3">
                                <div className="flex gap-2 flex-wrap">
                                  {line.images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img 
                                        src={img} 
                                        alt={`Image ${imgIdx + 1}`} 
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-400 transition-colors"
                                        onClick={() => window.open(img)}
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <Eye size={16} className="text-white" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {quote.status === 'traite' && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {quote.realisable ? (
                            <>
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={24} className="text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-bold text-emerald-700">Réalisable</div>
                                <div className="text-sm text-gray-600">Demande validée par le chef de méthodes</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle size={24} className="text-red-600" />
                              </div>
                              <div>
                                <div className="font-bold text-red-700">Non Réalisable</div>
                                <div className="text-sm text-gray-600">Demande rejetée par le chef de méthodes</div>
                              </div>
                            </>
                          )}
                        </div>
                        {quote.realisable && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Prix TTC</div>
                            <div className="text-3xl font-bold text-indigo-600">{quote.prix_ttc} DH</div>
                          </div>
                        )}
                      </div>
                      {quote.updated_at && (
                        <div className="mt-3 text-sm text-gray-500">
                          Traité le: {new Date(quote.updated_at).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Chef de Méthodes Dashboard
  const ChefDashboard = () => {
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [realisable, setRealisable] = useState(null);
    const [prixTTC, setPrixTTC] = useState('');

    // Déterminer l'usine du chef connecté
    const getChefUsine = () => {
      // Priorité: usine dans le profil utilisateur
      if (currentUser.usine) return currentUser.usine;
      
      // Fallback: basé sur le nom
      const userName = currentUser.name.toLowerCase();
      if (userName.includes('ahmed')) return 'bois';
      if (userName.includes('karim')) return 'metal';
      if (userName.includes('youssef')) return 'semi-metal';
      
      // Sinon, montrer toutes les usines
      return 'all';
    };

    const chefUsine = getChefUsine();
    
    // Filtrer les demandes selon l'usine du chef
    const pendingQuotes = quotes
      .filter(q => q.status === 'en_attente')
      .filter(q => chefUsine === 'all' || q.usine === chefUsine)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleSubmit = async () => {
      if (realisable === null) {
        alert('Veuillez indiquer si la demande est réalisable');
        return;
      }
      if (realisable && !prixTTC) {
        alert('Veuillez indiquer le prix TTC');
        return;
      }

      try {
        // Préparer les données de mise à jour avec updated_at
        const updateData = {
          status: 'traite',
          realisable,
          prix_ttc: realisable ? parseFloat(prixTTC) : null,
          updated_at: new Date().toISOString() // Option B: Utilisation de updated_at
        };

        const { error } = await supabase
          .from('quotes')
          .update(updateData)
          .eq('id', selectedQuote.id);

        if (error) {
          // Si updated_at n'existe pas, réessayer sans
          if (error.message.includes('updated_at')) {
            delete updateData.updated_at;
            const { error: retryError } = await supabase
              .from('quotes')
              .update(updateData)
              .eq('id', selectedQuote.id);
            
            if (retryError) {
              throw retryError;
            }
          } else {
            throw error;
          }
        }

        alert('Demande traitée avec succès!');
        setSelectedQuote(null);
        setRealisable(null);
        setPrixTTC('');
        loadData();
        
      } catch (error) {
        console.error('Erreur lors du traitement:', error);
        alert(`Erreur: ${error.message}`);
      }
    };

    if (selectedQuote) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
          <button 
            onClick={() => setSelectedQuote(null)} 
            className="flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-800 font-semibold group"
          >
            <div className="transform group-hover:-translate-x-1 transition-transform">←</div>
            Retour à la liste
          </button>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Détails de la Demande</h2>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full">
              <span className="font-semibold">Chef de Méthodes - {getUsineLabel(selectedQuote.usine)}</span>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Commercial</div>
                  <div className="text-xl font-bold text-gray-800">{selectedQuote.commercial_name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Date de demande</div>
                  <div className="text-xl font-bold text-gray-800">
                    {new Date(selectedQuote.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Usine</div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                    selectedQuote.usine === 'bois' 
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                      : selectedQuote.usine === 'metal'
                      ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
                      : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {getUsineLabel(selectedQuote.usine)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="font-bold text-xl text-gray-800 mb-4">Lignes de la demande:</div>
                {selectedQuote.lines.map((line, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-2">{line.text}</div>
                        {line.images && line.images.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-600 mb-3">Images associées ({line.images.length})</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {line.images.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group">
                                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-300">
                                    <img src={img} alt={`Image ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <button
                                      onClick={() => window.open(img)}
                                      className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                    >
                                      Agrandir
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Traitement de la demande</h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-4">Statut de Réalisation</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className={`flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      realisable === true 
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50' 
                        : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          realisable === true ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'
                        }`}>
                          {realisable === true && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Réalisable</div>
                          <div className="text-sm text-gray-600 mt-1">La demande peut être réalisée</div>
                        </div>
                      </div>
                      <CheckCircle size={24} className={`${realisable === true ? 'text-emerald-500' : 'text-gray-300'}`} />
                      <input
                        type="radio"
                        name="realisable"
                        checked={realisable === true}
                        onChange={() => setRealisable(true)}
                        className="hidden"
                      />
                    </label>
                    
                    <label className={`flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      realisable === false 
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          realisable === false ? 'border-red-500 bg-red-500' : 'border-gray-400'
                        }`}>
                          {realisable === false && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Non Réalisable</div>
                          <div className="text-sm text-gray-600 mt-1">La demande ne peut être réalisée</div>
                        </div>
                      </div>
                      <XCircle size={24} className={`${realisable === false ? 'text-red-500' : 'text-gray-300'}`} />
                      <input
                        type="radio"
                        name="realisable"
                        checked={realisable === false}
                        onChange={() => setRealisable(false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {realisable && (
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                      Prix de vente à Sahara Mobilier (TTC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={prixTTC}
                        onChange={(e) => setPrixTTC(e.target.value)}
                        placeholder="Entrez le prix TTC en DH"
                        className="w-full p-6 text-xl border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-indigo-500 focus:border-transparent transition-all pl-20"
                      />
                      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-600">
                        DH
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-3">
                      Prix TTC incluant toutes les taxes et frais
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={realisable === null || (realisable && !prixTTC)}
                  className="w-full p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Valider le Traitement
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Demandes en Attente</h2>
            <p className="text-gray-600 mt-2">
              {chefUsine !== 'all' 
                ? `Usine ${getUsineLabel(chefUsine)} - Vos demandes`
                : 'Toutes les usines - Toutes les demandes'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full">
              <Bell size={24} />
              <span className="font-bold">{pendingQuotes.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full">
              <span className="font-semibold">Chef de Méthodes {chefUsine !== 'all' ? `- ${getUsineLabel(chefUsine)}` : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {pendingQuotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-32 h-32 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-8">
                <CheckCircle size={64} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Toutes les demandes sont traitées !</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Aucune demande en attente. Vous serez notifié lorsque de nouvelles demandes arriveront.
              </p>
            </div>
          ) : (
            pendingQuotes.map(quote => (
              <div
                key={quote.id}
                className="group border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-400 transition-all cursor-pointer hover:shadow-lg"
                onClick={() => setSelectedQuote(quote)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600">
                          {quote.commercial_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-800">{quote.commercial_name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(quote.date).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        quote.usine === 'bois' 
                          ? 'bg-amber-100 text-amber-800'
                          : quote.usine === 'metal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {getUsineLabel(quote.usine)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quote.lines.length} ligne{quote.lines.length > 1 ? 's' : ''}
                      </span>
                      {quote.lines.some(line => line.images && line.images.length > 0) && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Avec images
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        En attente depuis {Math.floor((new Date() - new Date(quote.date)) / (1000 * 60 * 60))}h
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Référence</div>
                      <div className="font-mono font-bold text-gray-800">#{quote.id.slice(0, 8)}</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Eye size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-800 mb-3">Lignes:</div>
                  <div className="space-y-2">
                    {quote.lines.slice(0, 2).map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <div className="text-sm text-gray-700 truncate">{line.text}</div>
                      </div>
                    ))}
                    {quote.lines.length > 2 && (
                      <div className="text-sm text-gray-500">
                        + {quote.lines.length - 2} autres ligne{quote.lines.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Directeur Dashboard
  const DirecteurDashboard = () => {
    const [filter, setFilter] = useState('all');
    const [filterUsine, setFilterUsine] = useState('all');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showUserManagement, setShowUserManagement] = useState(false);

    const filteredQuotes = quotes
      .filter(q => {
        if (filter === 'all' && filterUsine === 'all') return true;
        if (filter !== 'all' && q.status !== filter) return false;
        if (filterUsine !== 'all' && q.usine !== filterUsine) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (selectedQuote) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
          <button 
            onClick={() => setSelectedQuote(null)} 
            className="flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-800 font-semibold group"
          >
            <div className="transform group-hover:-translate-x-1 transition-transform">←</div>
            Retour à la liste
          </button>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Détails de la Demande</h2>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
              <span className="font-semibold">Directeur</span>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Commercial</div>
                  <div className="text-xl font-bold text-gray-800">{selectedQuote.commercial_name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Date</div>
                  <div className="text-xl font-bold text-gray-800">
                    {new Date(selectedQuote.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Usine</div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                    selectedQuote.usine === 'bois' 
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                      : selectedQuote.usine === 'metal'
                      ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
                      : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {getUsineLabel(selectedQuote.usine)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="font-bold text-xl text-gray-800 mb-4">Lignes de la demande:</div>
                {selectedQuote.lines.map((line, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border-2 border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-2">{line.text}</div>
                        {line.images && line.images.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-600 mb-3">Images associées ({line.images.length})</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {line.images.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group">
                                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-300">
                                    <img src={img} alt={`Image ${imgIdx + 1}`} className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(img)} />
                                  </div>
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <div className="text-white text-sm font-medium">Cliquer pour agrandir</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedQuote.status === 'traite' && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border-2 border-emerald-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Résultat du Chiffrage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {selectedQuote.realisable ? (
                        <>
                          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <CheckCircle size={32} className="text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-emerald-700">Réalisable</div>
                            <div className="text-gray-600">Validé par le chef de méthodes</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                            <XCircle size={32} className="text-red-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-700">Non Réalisable</div>
                            <div className="text-gray-600">Rejeté par le chef de méthodes</div>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedQuote.updated_at && (
                      <div className="text-sm text-gray-500">
                        Traité le: {new Date(selectedQuote.updated_at).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>
                  
                  {selectedQuote.realisable && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-600">Prix de vente TTC</div>
                      <div className="text-5xl font-bold text-indigo-600">{selectedQuote.prix_ttc} DH</div>
                      <div className="text-sm text-gray-500">Prix toutes taxes comprises</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {showUserManagement && <UserManagement onClose={() => setShowUserManagement(false)} />}
        
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Tableau de Bord - Directeur</h2>
                <p className="text-gray-600 mt-2">Vue d'ensemble de toutes les demandes de chiffrage</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <Users size={24} />
                  Gérer les Utilisateurs
                </button>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
                  <span className="font-semibold">Directeur</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">{quotes.length}</div>
                <div className="text-lg font-semibold text-gray-800">Total des demandes</div>
                <div className="text-sm text-gray-600 mt-1">Toutes usines confondues</div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-amber-200">
                <div className="text-4xl font-bold text-amber-600 mb-2">{quotes.filter(q => q.status === 'en_attente').length}</div>
                <div className="text-lg font-semibold text-gray-800">En attente</div>
                <div className="text-sm text-gray-600 mt-1">Demandes non traitées</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{quotes.filter(q => q.status === 'traite').length}</div>
                <div className="text-lg font-semibold text-gray-800">Traitée</div>
                <div className="text-sm text-gray-600 mt-1">Demandes finalisées</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-2">{quotes.filter(q => q.usine === 'bois').length}</div>
                <div className="text-lg font-semibold text-gray-800">Usine Bois</div>
                <div className="text-sm text-gray-600 mt-1">Demandes menuiserie</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous les statuts
              </button>
              <button
                onClick={() => setFilter('en_attente')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'en_attente' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Attente ({quotes.filter(q => q.status === 'en_attente').length})
              </button>
              <button
                onClick={() => setFilter('traite')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'traite' 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Traitées ({quotes.filter(q => q.status === 'traite').length})
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setFilterUsine('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterUsine === 'all' 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes les usines
              </button>
              <button
                onClick={() => setFilterUsine('bois')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterUsine === 'bois' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usine Bois ({quotes.filter(q => q.usine === 'bois').length})
              </button>
              <button
                onClick={() => setFilterUsine('metal')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterUsine === 'metal' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usine Metal ({quotes.filter(q => q.usine === 'metal').length})
              </button>
              <button
                onClick={() => setFilterUsine('semi-metal')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterUsine === 'semi-metal' 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usine Semi-Métal ({quotes.filter(q => q.usine === 'semi-metal').length})
              </button>
            </div>
            
            <div className="space-y-6">
              {filteredQuotes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                    <Bell size={64} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune demande trouvée</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Aucune demande ne correspond aux filtres sélectionnés.
                  </p>
                </div>
              ) : (
                filteredQuotes.map(quote => (
                  <div
                    key={quote.id}
                    className="group border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-400 transition-all cursor-pointer hover:shadow-lg"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-indigo-600">
                              {quote.commercial_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-800">{quote.commercial_name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(quote.date).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'en_attente' 
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {quote.status === 'en_attente' ? '⏳ En Attente' : '✅ Traitée'}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            quote.usine === 'bois' 
                              ? 'bg-amber-100 text-amber-800'
                              : quote.usine === 'metal'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {getUsineLabel(quote.usine)}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quote.lines.length} ligne{quote.lines.length > 1 ? 's' : ''}
                          </span>
                          {quote.lines.some(line => line.images && line.images.length > 0) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Avec images
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="text-sm text-gray-600">Référence</div>
                          <div className="font-mono font-bold text-gray-800">#{quote.id.slice(0, 8)}</div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Eye size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {quote.status === 'traite' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {quote.realisable ? (
                              <>
                                <CheckCircle size={20} className="text-emerald-600" />
                                <span className="font-bold text-emerald-700">Réalisable</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={20} className="text-red-600" />
                                <span className="font-bold text-red-700">Non Réalisable</span>
                              </>
                            )}
                          </div>
                          {quote.realisable && (
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Prix TTC</div>
                              <div className="text-2xl font-bold text-indigo-600">{quote.prix_ttc} DH</div>
                            </div>
                          )}
                        </div>
                        {quote.updated_at && (
                          <div className="mt-2 text-xs text-gray-500">
                            Traité le: {new Date(quote.updated_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">SAHARA MOBILIER</h1>
              <p className="text-gray-600">Gestion des Chiffrages</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-gray-800">{currentUser.name}</div>
              <div className="text-sm text-gray-600">
                {currentUser.role === 'commercial' ? 'Commercial' : 
                 currentUser.role === 'chef' ? 'Chef de Méthodes' : 'Directeur'}
                {currentUser.usine && currentUser.role === 'chef' && ` - ${getUsineLabel(currentUser.usine)}`}
              </div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-2xl font-semibold text-gray-800">Chargement...</div>
            <p className="text-gray-600 mt-2">Veuillez patienter</p>
          </div>
        ) : (
          <div className="w-full">
            {currentUser.role === 'commercial' && <CommercialDashboard />}
            {currentUser.role === 'chef' && <ChefDashboard />}
            {currentUser.role === 'directeur' && <DirecteurDashboard />}
          </div>
        )}
      </main>
      
      <footer className="mt-auto py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Sahara Mobilier - Gestion des Chiffrages
          </div>
          <div className="text-gray-400 text-xs mt-2">
            Système de gestion des demandes de chiffrage - 3 usines: Bois, Métal, Semi-Métallique
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
