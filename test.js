const XLSX = require('xlsx');
const fs = require('fs');

// Path ke file Excel
const filePath = 'sample.xlsx';

// Membaca file Excel
const workbook = XLSX.readFile(filePath);

// Mendapatkan nama sheet pertama
const sheetName = workbook.SheetNames[0];

// Mengambil data dari sheet pertama
const sheet = workbook.Sheets[sheetName];

// Mengonversi sheet ke format JSON dengan header sebagai kunci
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Fungsi untuk mengonversi serial Excel ke format tanggal
function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;
    const total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor((total_seconds - (hours * 60 * 60)) / 60);

    const year = date_info.getFullYear();
    const month = ("0" + (date_info.getMonth() + 1)).slice(-2);
    const day = ("0" + date_info.getDate()).slice(-2);
    const time = ("0" + hours).slice(-2) + ':' + ("0" + minutes).slice(-2) + ':' + ("0" + seconds).slice(-2);

    return day + '/' + month + '/' + year + ' ' + time;
}

// Menentukan jumlah kolom yang ingin diambil (misalnya, 3 kolom terakhir dan kolom pertama)
const numColumns = 3;

// Menyaring data untuk hanya mengambil kolom pertama dan 3 kolom terakhir dari setiap baris
const filteredData = data.map(row => {
    // Mengambil kolom pertama
    let firstColumn = row[0];

    // Jika kolom pertama adalah serial Excel, ubah ke format tanggal
    if (typeof firstColumn === 'number') {
        firstColumn = excelDateToJSDate(firstColumn);
    }
    
    // Mengambil 3 kolom terakhir tanpa mengubahnya
    const lastColumns = row.slice(-numColumns);

    // Menggabungkan kolom pertama dan 3 kolom terakhir
    return [firstColumn, ...lastColumns];
});

// Menyimpan JSON ke file
fs.writeFileSync('output.json', JSON.stringify(filteredData, null, 2), 'utf-8');

console.log('Data kolom pertama dan tiga kolom terakhir telah dikonversi menjadi JSON dan disimpan ke output.json');
