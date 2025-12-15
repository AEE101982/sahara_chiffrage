// api/telegram.js - Vercel Serverless Function pour Telegram

const TELEGRAM_BOT_TOKEN = '8583534519:AAF0bJg-Aniz0wDLjoDbeui6fOE7BmsA-sA';

// Mapping des chefs par usine
const CHEFS_BY_USINE = {
  'bois': '8054238662',        // Chef usine Bois
  'metal': '7903997817',       // Chef usine Metal
  'semi-metal': '7392016731'   // Chef usine Semi-Métallique
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, usine } = req.body;
    
    // Vérifier si l'usine est valide
    const chefTelegramId = CHEFS_BY_USINE[usine];
    
    if (!chefTelegramId) {
      return res.status(400).json({ 
        error: 'Usine non valide',
        usinesDisponibles: Object.keys(CHEFS_BY_USINE)
      });
    }
    
    // Envoyer le message au chef de l'usine sélectionnée
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chefTelegramId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return res.status(500).json({ 
        error: 'Failed to send notification',
        telegramError: data.description 
      });
    }

    res.status(200).json({ 
      success: true,
      usine: usine,
      chefId: chefTelegramId,
      message: `Notification envoyée au chef de l'usine ${usine}`
    });
    
  } catch (error) {
    console.error('Erreur Telegram:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification' });
  }
}
