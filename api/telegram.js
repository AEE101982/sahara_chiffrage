// api/telegram.js - Version simplifiée
const TELEGRAM_BOT_TOKEN = '8583534519:AAF0bJg-Aniz0wDLjoDbeui6fOE7BmsA-sA';
const CHEF_TELEGRAM_IDS = ['8054238662', '7903997817']; // Deux IDs

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    // Envoyer le message à tous les chefs
    const promises = CHEF_TELEGRAM_IDS.map(chefId => 
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chefId,
          text: message,
          parse_mode: 'Markdown'
        })
      })
    );

    await Promise.all(promises);
    
    res.status(200).json({ 
      success: true, 
      sentTo: CHEF_TELEGRAM_IDS.length,
      message: `Notification envoyée à ${CHEF_TELEGRAM_IDS.length} chef(s)`
    });
    
  } catch (error) {
    console.error('Erreur Telegram:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification' });
  }
}
