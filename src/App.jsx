import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Send, CheckCircle, XCircle, Eye, LogOut, Users, ImagePlus, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - REMPLACER PAR VOS CLÉS
const supabaseUrl = 'https://kvvcuainxntgtaykehyq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dmN1YWlueG50Z3RheWtlaHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjkwMDcsImV4cCI6MjA4MTMwNTAwN30.ZuZFl0on9s5Sa8hLwevUq6ksIJuO7hKIzH1Pft20oC8';
const supabase = createClient(supabaseUrl, supabaseKey);

const TELEGRAM_BOT_TOKEN = '8583534519:AAF0bJg-Aniz0wDLjoDbeui6fOE7BmsA-sA';
const CHEF_TELEGRAM_ID = '7903997817';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  const sendTelegramNotification = async (quote) => {
    try {
      const message = `🔔 *Nouvelle demande de chiffrage*
      
👤 Commercial: ${quote.commercial_name}
📅 Date: ${new Date(quote.date).toLocaleString('fr-FR')}
📋 Nombre de lignes: ${quote.lines.length}

Détails:
${quote.lines.map((line, idx) => `${idx + 1}. ${line.text}`).join('\n')}`;

      // Appeler notre API Vercel serverless function
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          images: quote.images || []
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
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
            Gestion des Chiffrages
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
      name: ''
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
        setNewUser({ username: '', password: '', role: 'commercial', name: '' });
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
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-4">Créer un nouvel utilisateur</h3>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <button
                onClick={addUser}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Créer l'utilisateur
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Utilisateurs existants</h3>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        @{user.username} • {user.role === 'commercial' ? 'Commercial' : user.role === 'chef' ? 'Chef de Méthodes' : 'Directeur'}
                      </div>
                    </div>
                    {user.username !== 'admin' && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
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
    const [lines, setLines] = useState([{ id: 1, text: '' }]);
    const [images, setImages] = useState([]);
    const [sentQuotes, setSentQuotes] = useState([]);

    useEffect(() => {
      setSentQuotes(quotes.filter(q => q.commercial_name === currentUser.name));
    }, [quotes]);

    const addLine = () => {
      setLines([...lines, { id: Date.now(), text: '' }]);
    };

    const removeLine = (id) => {
      if (lines.length > 1) {
        setLines(lines.filter(line => line.id !== id));
      }
    };

    const updateLine = (id, text) => {
      setLines(lines.map(line => line.id === id ? { ...line, text } : line));
    };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    };

    const removeImage = (index) => {
      setImages(images.filter((_, idx) => idx !== index));
    };

    const sendQuote = async () => {
      const validLines = lines.filter(l => l.text.trim());
      if (validLines.length === 0) {
        alert('Veuillez ajouter au moins une ligne');
        return;
      }

      const newQuote = {
        commercial_name: currentUser.name,
        lines: validLines,
        images: images,
        status: 'en_attente'
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select()
        .single();

      if (error) {
        alert('Erreur: ' + error.message);
      } else {
        await sendTelegramNotification(data);
        setLines([{ id: Date.now(), text: '' }]);
        setImages([]);
        alert('Demande envoyée avec succès!');
        loadData();
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nouvelle Demande de Chiffrage</h2>
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={line.id} className="flex gap-2">
                <input
                  type="text"
                  value={line.text}
                  onChange={(e) => updateLine(line.id, e.target.value)}
                  placeholder={`Ligne ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Images (optionnel)</label>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <ImagePlus size={20} />
                Ajouter des images
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
              <span className="text-sm text-gray-600">{images.length} image(s)</span>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={addLine}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={20} />
              Ajouter une ligne
            </button>
            <button
              onClick={sendQuote}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ml-auto"
            >
              <Send size={20} />
              Envoyer pour Chiffrage
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes Demandes</h2>
          <div className="space-y-3">
            {sentQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune demande envoyée</p>
            ) : (
              sentQuotes.map(quote => (
                <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-600">
                      {new Date(quote.date).toLocaleString('fr-FR')}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      quote.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {quote.status === 'en_attente' ? 'En Attente' : 'Traitée'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {quote.lines.map((line, idx) => (
                      <div key={idx} className="text-gray-700">• {line.text}</div>
                    ))}
                  </div>
                  {quote.images && quote.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {quote.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                  {quote.status === 'traite' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        {quote.realisable ? (
                          <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-green-700 font-semibold">Réalisable</span>
                            <span className="ml-auto text-indigo-600 font-bold">{quote.prix_ttc} DH TTC</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-red-600" />
                            <span className="text-red-700 font-semibold">Non Réalisable</span>
                          </>
                        )}
                      </div>
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

    const pendingQuotes = quotes
      .filter(q => q.status === 'en_attente')
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

      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'traite',
          realisable,
          prix_ttc: realisable ? parseFloat(prixTTC) : null
        })
        .eq('id', selectedQuote.id);

      if (error) {
        alert('Erreur: ' + error.message);
      } else {
        alert('Demande traitée avec succès!');
        setSelectedQuote(null);
        setRealisable(null);
        setPrixTTC('');
        loadData();
      }
    };

    if (selectedQuote) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <button onClick={() => setSelectedQuote(null)} className="mb-4 text-indigo-600 hover:text-indigo-800">
            ← Retour à la liste
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Détails de la Demande</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                Commercial: <span className="font-semibold">{selectedQuote.commercial_name}</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Date: {new Date(selectedQuote.date).toLocaleString('fr-FR')}
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Lignes de la demande:</div>
                {selectedQuote.lines.map((line, idx) => (
                  <div key={idx} className="text-gray-700 pl-2">• {line.text}</div>
                ))}
              </div>
              {selectedQuote.images && selectedQuote.images.length > 0 && (
                <div className="mt-3">
                  <div className="font-semibold text-gray-700 mb-2">Images jointes:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedQuote.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Statut de Réalisation</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={realisable === true}
                      onChange={() => setRealisable(true)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">Réalisable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={realisable === false}
                      onChange={() => setRealisable(false)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">Non Réalisable</span>
                  </label>
                </div>
              </div>

              {realisable && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix de vente à Sahara Mobilier (TTC)
                  </label>
                  <input
                    type="number"
                    value={prixTTC}
                    onChange={(e) => setPrixTTC(e.target.value)}
                    placeholder="Entrez le prix TTC"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Valider le Traitement
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Demandes en Attente</h2>
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <Bell size={16} />
            <span className="font-semibold">{pendingQuotes.length}</span>
          </div>
        </div>
        <div className="space-y-3">
          {pendingQuotes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande en attente</p>
          ) : (
            pendingQuotes.map(quote => (
              <div
                key={quote.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => setSelectedQuote(quote)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{quote.commercial_name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(quote.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <Eye size={20} className="text-indigo-600" />
                </div>
                <div className="text-sm text-gray-600">
                  {quote.lines.length} ligne(s)
                  {quote.images && quote.images.length > 0 && ` • ${quote.images.length} image(s)`}
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
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showUserManagement, setShowUserManagement] = useState(false);

    const filteredQuotes = quotes
      .filter(q => {
        if (filter === 'all') return true;
        if (filter === 'traite') return q.status === 'traite';
        if (filter === 'en_attente') return q.status === 'en_attente';
        return true;
      })
      .sort((a), b) => new Date(b.date) - new Date(a.date));

    if (selectedQuote) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <button onClick={() => setSelectedQuote(null)} className="mb-4 text-indigo-600 hover:text-indigo-800">
            ← Retour à la liste
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Détails de la Demande</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Commercial</div>
                  <div className="font-semibold">{selectedQuote.commercial_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-semibold">{new Date(selectedQuote.date).toLocaleString('fr-FR')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Statut</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedQuote.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedQuote.status === 'en_attente' ? 'En Attente' : 'Traitée'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Lignes de la demande:</div>
                {selectedQuote.lines.map((line, idx) => (
                  <div key={idx} className="text-gray-700 pl-2">• {line.text}</div>
                ))}
              </div>
              {selectedQuote.images && selectedQuote.images.length > 0 && (
                <div className="mt-3">
                  <div className="font-semibold text-gray-700 mb-2">Images jointes:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedQuote.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover rounded-lg cursor-pointer" onClick={() => window.open(img)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedQuote.status === 'traite' && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="font-semibold text-gray-800 mb-2">Résultat du Chiffrage</div>
                <div className="flex items-center gap-2">
                  {selectedQuote.realisable ? (
                    <>
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-green-700 font-semibold">Réalisable</span>
                      <span className="ml-auto text-indigo-600 font-bold text-xl">{selectedQuote.prix_ttc} DH TTC</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="text-red-600" />
                      <span className="text-red-700 font-semibold">Non Réalisable</span>
                    </>
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
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Toutes les Demandes</h2>
              <button
                onClick={() => setShowUserManagement(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Users size={20} />
                Gérer les Utilisateurs
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes ({quotes.length})
              </button>
              <button
                onClick={() => setFilter('en_attente')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'en_attente' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Attente ({quotes.filter(q => q.status === 'en_attente').length})
              </button>
              <button
                onClick={() => setFilter('traite')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'traite' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Traitées ({quotes.filter(q => q.status === 'traite').length})
              </button>
            </div>
            <div className="space-y-3">
              {filteredQuotes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune demande</p>
              ) : (
                filteredQuotes.map(quote => (
                  <div
                    key={quote.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-800">{quote.commercial_name}</div>
                        <div className="text-sm text-gray-600">{new Date(quote.date).toLocaleString('fr-FR')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          quote.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {quote.status === 'en_attente' ? 'En Attente' : 'Traitée'}
                        </span>
                        <Eye size={20} className="text-indigo-600" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {quote.lines.length} ligne(s)
                      {quote.images && quote.images.length > 0 && ` • ${quote.images.length} image(s)`}
                    </div>
                    {quote.status === 'traite' && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          {quote.realisable ? (
                            <>
                              <CheckCircle size={14} className="text-green-600" />
                              <span className="text-green-700">Réalisable</span>
                              <span className="ml-auto text-indigo-600 font-bold">{quote.prix_ttc} DH TTC</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="text-red-600" />
                              <span className="text-red-700">Non Réalisable</span>
                            </>
                          )}
                        </div>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Gestion des Chiffrages</h1>
            <p className="text-sm text-gray-600">{currentUser.name}</p>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <>
            {currentUser.role === 'commercial' && <CommercialDashboard />}
            {currentUser.role === 'chef' && <ChefDashboard />}
            {currentUser.role === 'directeur' && <DirecteurDashboard />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;