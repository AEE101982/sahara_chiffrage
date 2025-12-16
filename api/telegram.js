// api/telegram.js - Vercel Serverless Function pour Telegram

const TELEGRAM_BOT_TOKEN = '8583534519:AAF0bJg-Aniz0wDLjoDbeui6fOE7BmsA-sA';

// Mapping des chefs par usine
const CHEFS_BY_USINE = {
  'bois': '8054238662',        // Chef usine Bois - Ahmed
  'metal': '7903997817',       // Chef usine Metal - Youness
  'semi-metal': '7392016731'   // Chef usine Semi-Métallique - Jaouad
};

export default async function handler(req, res) {
  // Configurer les headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, usine } = req.body;
    
    console.log('📨 Requête Telegram reçue:', { usine, messageLength: message?.length });
    
    // Vérifier si l'usine est valide
    const chefTelegramId = CHEFS_BY_USINE[usine];
    
    if (!chefTelegramId) {
      console.error('❌ Usine non valide:', usine);
      return res.status(400).json({ 
        error: 'Usine non valide',
        usinesDisponibles: Object.keys(CHEFS_BY_USINE)
      });
    }
    
    if (!message) {
      console.error('❌ Message vide');
      return res.status(400).json({ error: 'Message vide' });
    }
    
    console.log(`📤 Envoi à l'usine ${usine}, chef ID: ${chefTelegramId}`);
    
    // Envoyer le message au chef de l'usine sélectionnée
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Sahara-Chiffrage-App/1.0'
      },
      body: JSON.stringify({
        chat_id: chefTelegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    const telegramData = await telegramResponse.json();
    
    console.log('📩 Réponse Telegram API:', telegramData);
    
    if (!telegramData.ok) {
      console.error('❌ Erreur Telegram API:', telegramData);
      return res.status(500).json({ 
        error: 'Failed to send notification',
        telegramError: telegramData.description,
        details: telegramData
      });
    }

    console.log('✅ Notification envoyée avec succès');
    
    res.status(200).json({ 
      success: true,
      usine: usine,
      chefId: chefTelegramId,
      message: `Notification envoyée au chef de l'usine ${usine}`,
      telegramResponse: telegramData
    });
    
  } catch (error) {
    console.error('🔥 Erreur Telegram:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de la notification',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
