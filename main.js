//const endpoint = url
//const apiCall =  await fetch(endpoint)
//const response = await apiCall.json()
const token = "7450619219:AAGHQNH7S1V4HVLu0x3ppeJTv-6yRDKsa";
const TelegramBot = require("node-telegram-bot-api");
const path = require('path');
const fs = require('fs');

const prefix = '/';
const excel = new RegExp(`^${prefix}excelDom$`);
const msg = new RegExp(`^${prefix}message$`);

const options = {
    polling: true
};

const excaBot = new TelegramBot(token, options);

// Menambahkan menu utama dengan tombol inline
const menu = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'Kirim Excel', callback_data: 'excel' },
                { text: 'Kirim Pesan', callback_data: 'message' }
            ]
        ]
    }
};

// Mengirim menu kepada pengguna
excaBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    excaBot.sendMessage(chatId, 'Silakan pilih opsi untuk format laporan:', menu);
});

// Menangani tombol inline
excaBot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;
    //console.log(callbackQuery)
    
    if (action === 'excel') {
        excaBot.sendDocument(chatId, 'sample.xlsx');
    } else if (action === 'message') {
        const jsonFilePath = path.join(__dirname, 'output.json');

        // Baca file JSON dan kirimkan kontennya sebagai pesan teks
        const sendInChunks = (chatId, text, chunkSize = 4000) => {
            for (let i = 0; i < text.length; i += chunkSize) {
                excaBot.sendMessage(chatId, text.substring(i, i + chunkSize))
                    .catch((error) => {
                        console.error('Error sending message chunk:', error);
                    });
            }
        };
        
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                excaBot.sendMessage(chatId, 'Terjadi kesalahan saat membaca file JSON.');
                return;
            }
             // Parsing JSON dan memformat pesan
             let jsonData = JSON.parse(data);
             let formattedMessage = jsonData.map(item => {
                 return `[
                    date: ${item[0]}
                    Avg.Relief: ${item[1]}
                    Arm in or bucket curl: ${item[2]}
                    Karakteristik Material: ${item[3]}
                    ]`;
             }).join('\n');
            sendInChunks(chatId, formattedMessage);
        });
    }

    // Mengirimkan feedback ke pengguna bahwa perintah telah diproses
    excaBot.answerCallbackQuery(callbackQuery.id, { text: 'Perintah diproses' });
});

console.log('Bot running');