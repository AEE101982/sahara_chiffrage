// Alternative dans App.jsx si l'API Vercel ne fonctionne pas

const sendTelegramNotification = async (quote, selectedUsine) => {
  try {
    const TELEGRAM_BOT_TOKEN = '8583534519:AAF0bJg-Aniz0wDLjoDbeui6fOE7BmsA-sA';
    const CHEFS_BY_USINE = {
      'bois': '8054238662',
      'metal': '7903997817',
      'semi-metal': '7392016731'
    };

    const chefId = CHEFS_BY_USINE[selectedUsine];
    if (!chefId) {
      console.error('ID Telegram non trouvé pour l\'usine:', selectedUsine);
      return;
    }

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

    // Envoi direct à l'API Telegram
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chefId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Erreur Telegram:', data);
    } else {
      console.log('Notification Telegram envoyée avec succès');
    }
    
  } catch (error) {
    console.error('Erreur envoi Telegram:', error);
  }
};
