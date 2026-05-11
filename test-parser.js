const fs = require('fs');

// Read the parser module
const parserCode = fs.readFileSync('./src/features/data-import/lib/noteParser.ts', 'utf8');
console.log('Parser code check - looking for join operation:');
console.log(parserCode.includes("noteArray.map(note => note.TEXT || '').join") ? '✓ Join operation found' : '✗ Join operation NOT found');

// Test data - Chromium NOTE array
const chromiumNote = [
  { TEXT: "[f( var rv=''; " },
  { TEXT: "var WT=parseFloat(me.getValue('DoseWeightKG'))" },
  { TEXT: "if (WT ===0){rv='Enter a Weight'}" },
  { TEXT: "else" },
  { TEXT: "if( WT < 25 ){ rv = '0.2 mcg/kg/day'} " },
  { TEXT: "else" },
  { TEXT: "{  rv =" },
  { TEXT: "(me.maxP(5/WT, 2)) " },
  { TEXT: "+ ' - ' " },
  { TEXT: "+ (me.maxP(15/WT,2 ))" },
  { TEXT: "+ ' mcg/kg/day \\n'" },
  { TEXT: "+ ' (Daily Dose: 5 - 15 mcg/day)'" },
  { TEXT: "}" },
  { TEXT: "return rv; )]" }
];

// Manual test of what the parser SHOULD do
const fullText = chromiumNote.map(note => note.TEXT || '').join('\n');
console.log('\nFull joined text:');
console.log(fullText);

console.log('\nSearching for delimiters:');
const startIdx = fullText.indexOf('[f(');
const endIdx = fullText.indexOf(')]');
console.log('Start delimiter [f( at index:', startIdx);
console.log('End delimiter )] at index:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const dynamicContent = fullText.substring(startIdx + 3, endIdx).trim();
  console.log('\nExtracted dynamic content:');
  console.log(dynamicContent);
  console.log('\nThis should result in 1 dynamic section, not 14 sections!');
}
