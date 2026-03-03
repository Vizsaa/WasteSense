const fs = require('fs');
const path = require('path');
const pdfModule = require('pdf-parse');
const { PDFParse } = pdfModule;

async function main() {
  const pdfPath = process.argv[2] || path.join(__dirname, '..', 'WasteSense - Functional Requirements (1).pdf');
  const outPath = process.argv[3] || path.join(__dirname, '..', 'WasteSense - Functional Requirements (1).txt');

  const dataBuffer = fs.readFileSync(pdfPath);
  if (typeof PDFParse !== 'function') {
    throw new Error('pdf-parse did not export PDFParse');
  }

  const parser = new PDFParse({ data: dataBuffer });
  const textResult = await parser.getText();
  const text = (textResult && textResult.text) ? textResult.text : '';

  fs.writeFileSync(outPath, text, 'utf8');

  const preview = text.slice(0, 800).replace(/\r/g, '');
  console.log(`Extracted ${text.length} chars to: ${outPath}`);
  console.log('--- preview ---');
  console.log(preview);
}

main().catch((err) => {
  console.error('Failed to extract PDF text:', err);
  process.exit(1);
});
