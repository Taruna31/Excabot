//const endpoint = url
//const apiCall =  await fetch(endpoint)
//const response = await apiCall.json()
const token = "7450619219:AAGHQNH7S1V4HVLu0x3ppeJTv-6yRDKsaZQ";
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
                { text: 'Kirim Pesan', callback_data: 'message' },
                { text: 'Kirim Raw Excel', callback_data: 'rawExcel'}
            ]
        ]
    }
};

// Mengirim menu kepada pengguna
excaBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    excaBot.sendMessage(chatId, 'Silakan pilih opsi untuk format laporan:', menu);
});

// Fungsi untuk mengonversi tanggal Excel ke format 0X/0X/20XX
function convertExcelDateToPlaceholder(serial) {
    // Konversi serial number ke tanggal JavaScript
    const date = new Date((serial - 25569) * 86400 * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // Mengubah format menjadi 0X/0X/20XX
    return `0${day[1]}/0${month[1]}/20XX`;
}

// Menangani tombol inline
excaBot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;
    
    if (action === 'excel') {
        excaBot.sendDocument(chatId, 'EX3011.xlsx');
    } else if (action === 'message') {
        const jsonFilePath = path.join(__dirname, 'output.json');

        // Baca file JSON dan kirimkan kontennya sebagai pesan teks
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                excaBot.sendMessage(chatId, 'Terjadi kesalahan saat membaca file JSON.');
                return;
            }

            // Parsing JSON dan memformat pesan
            const jsonData = JSON.parse(data);
            const excelDate = jsonData[0]["__EMPTY"];
            const formattedDate = convertExcelDateToPlaceholder(excelDate);

            const formattedMessage = `
Nama unit: EX3011
Tanggal: ${formattedDate}
Jumlah Material Normal: ${jsonData[2]["__EMPTY"]}
Jumlah Material Keras: ${jsonData[3]["__EMPTY"]}
            `;

            excaBot.sendMessage(chatId, formattedMessage)
                .catch((error) => {
                    console.error('Error sending message:', error);
                });
        });
    } else if (action === 'rawExcel') {
        excaBot.sendDocument(chatId, 'RAW_EX3011.xlsx');
    }

    // Mengirimkan feedback ke pengguna bahwa perintah telah diproses
    excaBot.answerCallbackQuery(callbackQuery.id, { text: 'Perintah diproses' });
});

console.log('Bot running');

