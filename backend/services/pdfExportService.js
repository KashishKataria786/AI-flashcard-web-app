import PDFDocument from 'pdfkit';

/**
 * Generates a branded PDF for a flashcard deck.
 * @param {Object} deck - The deck document.
 * @param {Array} cards - The array of flashcard documents.
 * @param {Stream} res - The Express response stream.
 */
export const generateDeckPDF = (deck, cards, res) => {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true,
  });

  // Pipe the PDF to the response
  doc.pipe(res);

  // --- Header / Branding ---
  // Yellow top accent
  doc.rect(0, 0, doc.page.width, 15).fill('#ffb800');

  doc.moveDown(2);

  // App Title
  doc
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('CUEMATH AI FLASHCARDS', { characterSpacing: 2 });

  doc.moveDown(1);

  // Deck Title
  doc
    .fontSize(32)
    .text(deck.title.toUpperCase(), {
      lineGap: 10
    });

  // Stats / Metadata
  doc
    .fontSize(10)
    .fillColor('#666666')
    .font('Helvetica')
    .text(`Created on: ${new Date(deck.createdAt).toLocaleDateString()}`)
    .text(`Total Cards: ${cards.length}`)
    .moveDown(2);

  // Horizontal Divider
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor('#000000')
    .lineWidth(2)
    .stroke();

  doc.moveDown(2);

  // --- Flashcards List ---
  cards.forEach((card, index) => {
    // Check for page break
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
      // Add yellow top accent on new pages too
      doc.rect(0, 0, doc.page.width, 15).fill('#ffb800');
      doc.moveDown(2);
    }

    const startY = doc.y;

    // Card Number & Type
    doc
      .fillColor('#ffb800')
      .rect(50, startY, doc.page.width - 100, 20)
      .fill();

    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(`${index + 1}. ${card.type.toUpperCase()}`, 60, startY + 6);

    doc.moveDown(1.5);

    // Front / Question
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('QUESTION/FRONT:', 50);
    
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(card.front, {
        indent: 10,
        lineGap: 4
      });

    doc.moveDown(1);

    // Back / Answer
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('ANSWER/BACK:', 50);

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#333333')
      .text(card.back, {
        indent: 10,
        lineGap: 4
      });

    doc.moveDown(3);

    // Subtle divider between cards
    doc
      .moveTo(50, doc.y - 15)
      .lineTo(doc.page.width - 50, doc.y - 15)
      .strokeColor('#eeeeee')
      .lineWidth(1)
      .stroke();
  });

  // --- Footer ---
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('#aaaaaa')
      .text(
        `Page ${i + 1} of ${pages.count}`,
        0,
        doc.page.height - 30,
        { align: 'center' }
      );
  }

  doc.end();
};
