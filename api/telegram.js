// api/telegram.js - Vercel Serverless Function pour Telegram

const TELEGRAM_BOT_TOKEN = '8583534519:AAF0bJg-Aniz0wDLjoDbeui6fOE7BmsA-sA';
const CHEF_TELEGRAM_ID = '7903997817';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, images } = req.body;

  try {
    // Envoyer le message texte
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHEF_TELEGRAM_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    // Envoyer les images si présentes
    if (images && images.length > 0) {
      for (const image of images) {
        // Extraire la partie base64 de l'image
        const base64Data = image.split(',')[1];
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHEF_TELEGRAM_ID,
            photo: base64Data,
            caption: '📎 Image jointe à la demande'
          })
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur Telegram:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification' });
  }
}