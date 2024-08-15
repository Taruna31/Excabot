const xlsx = require('xlsx');
const fs = require('fs');

// Replace with your Excel file name
const excelFile = 'EX3011.xlsx';

// Read the Excel file
const workbook = xlsx.readFile(excelFile);

// Get the first sheet name
const sheetName = workbook.SheetNames[0];

// Convert the sheet to JSON
const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Write the JSON data to a file
fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));

console.log('Excel file has been converted to output.json');
