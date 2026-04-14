const exceljs = require('exceljs');
const Policy = require('../models/Policy');
const Installment = require('../models/Installment');

exports.exportPolicyExcel = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.policyId).populate('userId');

    if (!policy || policy.userId.adminId.toString() !== req.admin.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const installments = await Installment.find({
      policyId: req.params.policyId
    }).sort({ year: 1, month: 1 });

    const user = policy.userId;

    const workbook = new exceljs.Workbook();
    workbook.creator = 'Policy Management System';
    workbook.lastModifiedBy = req.admin.email || 'System';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Policy Report', {
      properties: { tabColor: { argb: 'FF2C3E50' } },
      pageSetup: { 
        paperSize: 9, 
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      },
      views: [{
        showGridLines: false,
        zoomScale: 100
      }]
    });

    // Professional color palette - Corporate theme
    const colors = {
      primary: { argb: 'FF2C3E50' },      // Dark slate
      secondary: { argb: 'FF34495E' },     // Medium slate
      accent: { argb: 'FF3498DB' },         // Professional blue
      lightBg: { argb: 'FFF8F9FA' },        // Light gray background
      white: { argb: 'FFFFFFFF' },
      border: { argb: 'FFE0E0E0' },          // Light gray border
      success: { argb: 'FF27AE60' },         // Professional green
      warning: { argb: 'FFE67E22' },          // Professional orange
      info: { argb: 'FF3498DB' },             // Info blue
      textDark: { argb: 'FF2C3E50' },         // Dark text
      textLight: { argb: 'FF7F8C8D' },        // Light text
      headerText: { argb: 'FFFFFFFF' }        // White text for headers
    };

    const styleCell = (cell, options = {}) => {
      // Font styling
      cell.font = {
        name: 'Calibri',
        size: options.fontSize || 11,
        bold: options.bold || false,
        italic: options.italic || false,
        color: { argb: options.fontColor || colors.textDark.argb }
      };

      // Fill styling
      if (options.bgColor) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: options.bgColor }
        };
      }

      // Alignment
      cell.alignment = {
        vertical: 'middle',
        horizontal: options.align || 'left',
        wrapText: options.wrapText || false,
        indent: options.indent || 0
      };

      // Border styling - subtle and professional
      if (options.border !== false) {
        cell.border = {
          top: { style: 'thin', color: { argb: colors.border.argb } },
          left: { style: 'thin', color: { argb: colors.border.argb } },
          bottom: { style: 'thin', color: { argb: colors.border.argb } },
          right: { style: 'thin', color: { argb: colors.border.argb } }
        };
      }
    };

    // Set column widths for optimal display
    sheet.columns = [
      { width: 22 },  // A - Field
      { width: 28 },  // B - Value
      { width: 22 },  // C - Field
      { width: 28 }   // D - Value
    ];

    let currentRow = 1;

    // --- COMPANY HEADER ---
    const companyRow = sheet.addRow(['POLICY MANAGEMENT SYSTEM']);
    sheet.mergeCells(`A${companyRow.number}:D${companyRow.number}`);
    styleCell(companyRow.getCell(1), {
      fontSize: 16,
      bold: true,
      bgColor: colors.primary.argb,
      fontColor: colors.headerText.argb,
      align: 'center'
    });

    // --- REPORT TITLE ---
    currentRow = sheet.lastRow.number + 1;
    const titleRow = sheet.addRow(['Policy Detailed Report']);
    sheet.mergeCells(`A${titleRow.number}:D${titleRow.number}`);
    styleCell(titleRow.getCell(1), {
      fontSize: 20,
      bold: true,
      bgColor: colors.white.argb,
      fontColor: colors.primary.argb,
      align: 'center'
    });

    // --- REPORT METADATA ---
    currentRow = sheet.lastRow.number + 1;
    const reportId = `REPORT-${policy._id.toString().slice(-8).toUpperCase()}`;
    const metaData = [
      [`Report ID: ${reportId}`, `Generated: ${new Date().toLocaleString()}`]
    ];
    
    metaData.forEach((data, index) => {
      const row = sheet.addRow(data);
      styleCell(row.getCell(1), { fontSize: 9, fontColor: colors.textLight.argb, border: false });
      styleCell(row.getCell(2), { fontSize: 9, fontColor: colors.textLight.argb, border: false, align: 'right' });
      sheet.mergeCells(`A${row.number}:B${row.number}`);
      sheet.mergeCells(`C${row.number}:D${row.number}`);
    });

    sheet.addRow([]); // Spacer

    // --- SECTION 1: CLIENT INFORMATION ---
    const section1Row = sheet.addRow(['CLIENT INFORMATION']);
    sheet.mergeCells(`A${section1Row.number}:D${section1Row.number}`);
    styleCell(section1Row.getCell(1), {
      fontSize: 14,
      bold: true,
      bgColor: colors.secondary.argb,
      fontColor: colors.headerText.argb,
      align: 'left'
    });

    // Client info in elegant two-column layout
    const clientInfo = [
      ['Full Name', `${user.firstName} ${user.secondName || ''}`.trim(), 'Account Type', user.accountType],
      ['Primary Account', user.accountNumber1 || '—', 'CIF Number', user.cifNumber1 || '—']
    ];

    if (user.accountNumber2) {
      clientInfo.push(['Secondary Account', user.accountNumber2 || '—', 'CIF Number', user.cifNumber2 || '—']);
    }

    clientInfo.push(
      ['Mobile Number', user.mobileNumber || '—', 'Nominee', user.nomineeName || '—']
    );

    clientInfo.forEach((info, index) => {
      const row = sheet.addRow(info);
      // Style field labels (odd columns)
      styleCell(row.getCell(1), { bold: true, bgColor: colors.lightBg.argb, fontColor: colors.primary.argb });
      styleCell(row.getCell(2), { bgColor: colors.white.argb });
      styleCell(row.getCell(3), { bold: true, bgColor: colors.lightBg.argb, fontColor: colors.primary.argb });
      styleCell(row.getCell(4), { bgColor: colors.white.argb });
    });

    sheet.addRow([]); // Spacer

    // --- SECTION 2: POLICY DETAILS ---
    const section2Row = sheet.addRow(['POLICY DETAILS']);
    sheet.mergeCells(`A${section2Row.number}:D${section2Row.number}`);
    styleCell(section2Row.getCell(1), {
      fontSize: 14,
      bold: true,
      bgColor: colors.secondary.argb,
      fontColor: colors.headerText.argb,
      align: 'left'
    });

    const policyInfo = [
      ['Policy Number', policy._id.toString(), 'Status', 'Active'],
      ['Issue Date', new Date(policy.policyOpendate).toLocaleDateString(), 'Maturity Date', policy.PolicyCloseDate ? new Date(policy.PolicyCloseDate).toLocaleDateString() : '—'],
      ['Monthly Premium', policy.monthlyAmount, 'Maturity Amount', policy.maturityAmount],
      ['Total Investment', policy.totalInvestmentAmount, 'Remaining', policy.leftInvestmentAmount || 0]
    ];

    policyInfo.forEach((info, index) => {
      const row = sheet.addRow(info);
      styleCell(row.getCell(1), { bold: true, bgColor: colors.lightBg.argb, fontColor: colors.primary.argb });
      styleCell(row.getCell(2), { bgColor: colors.white.argb, numFmt: index >= 2 ? '"₹"#,##0.00' : null });
      styleCell(row.getCell(3), { bold: true, bgColor: colors.lightBg.argb, fontColor: colors.primary.argb });
      styleCell(row.getCell(4), { bgColor: colors.white.argb, numFmt: index >= 2 ? '"₹"#,##0.00' : null });
    });

    sheet.addRow([]); // Spacer

    // --- SECTION 3: INSTALLMENT SCHEDULE ---
    const section3Row = sheet.addRow(['INSTALLMENT SCHEDULE']);
    sheet.mergeCells(`A${section3Row.number}:D${section3Row.number}`);
    styleCell(section3Row.getCell(1), {
      fontSize: 14,
      bold: true,
      bgColor: colors.secondary.argb,
      fontColor: colors.headerText.argb,
      align: 'left'
    });

    // Table headers with professional styling
    const tableHeader = sheet.addRow(['Month', 'Year', 'Amount (₹)', 'Payment Status']);
    ['A', 'B', 'C', 'D'].forEach((col, index) => {
      const cell = tableHeader.getCell(index + 1);
      styleCell(cell, {
        bold: true,
        bgColor: colors.primary.argb,
        fontColor: colors.headerText.argb,
        align: 'center'
      });
    });

    let totalPaid = 0;
    let paidCount = 0;
    let onTimeCount = 0;
    let delayedCount = 0;

    // Process installments with subtle, professional indicators
    installments.forEach((inst, index) => {
      const row = sheet.addRow([
        inst.month,
        inst.year,
        inst.amount,
        inst.paid ? 'PAID' : 'PENDING'
      ]);

      if (inst.paid) {
        totalPaid += inst.amount;
        paidCount++;
        
        // Subtle green dot indicator for paid (just the status cell)
        styleCell(row.getCell(4), {
          bgColor: colors.success.argb + '10', // Very light green
          fontColor: colors.success.argb,
          bold: true,
          align: 'center'
        });
      } else {
        // Subtle orange dot indicator for pending
        styleCell(row.getCell(4), {
          bgColor: colors.warning.argb + '10', // Very light orange
          fontColor: colors.warning.argb,
          bold: true,
          align: 'center'
        });
      }

      // Style other cells consistently
      styleCell(row.getCell(1), { bgColor: index % 2 === 0 ? colors.lightBg.argb : colors.white.argb, align: 'center' });
      styleCell(row.getCell(2), { bgColor: index % 2 === 0 ? colors.lightBg.argb : colors.white.argb, align: 'center' });
      styleCell(row.getCell(3), { 
        bgColor: index % 2 === 0 ? colors.lightBg.argb : colors.white.argb, 
        align: 'right',
        numFmt: '"₹"#,##0.00'
      });
    });

    // Add summary statistics after installments
    sheet.addRow([]); // Small spacer
    
    const statsRow = sheet.addRow([
      'SUMMARY',
      `Total Installments: ${installments.length}`,
      `Paid: ${paidCount}`,
      `Pending: ${installments.length - paidCount}`
    ]);
    
    statsRow.eachCell((cell, colNumber) => {
      styleCell(cell, {
        bold: colNumber === 1,
        bgColor: colors.lightBg.argb,
        fontColor: colors.primary.argb,
        align: colNumber === 1 ? 'left' : 'center'
      });
    });

    sheet.addRow([]); // Spacer

    // --- SECTION 4: FINANCIAL ANALYSIS ---
    const section4Row = sheet.addRow(['FINANCIAL ANALYSIS']);
    sheet.mergeCells(`A${section4Row.number}:D${section4Row.number}`);
    styleCell(section4Row.getCell(1), {
      fontSize: 14,
      bold: true,
      bgColor: colors.secondary.argb,
      fontColor: colors.headerText.argb,
      align: 'left'
    });

    const paymentRatio = installments.length > 0 ? (paidCount / installments.length) * 100 : 0;
    const investmentProgress = policy.totalInvestmentAmount > 0 ? (totalPaid / policy.totalInvestmentAmount) * 100 : 0;

    const analysisRows = [
      ['Payment Completion', `${paymentRatio.toFixed(1)}%`, 'Investment Progress', `${investmentProgress.toFixed(1)}%`],
      ['Total Paid Amount', totalPaid, 'Remaining Investment', policy.leftInvestmentAmount || 0],
      ['Monthly Commitment', policy.monthlyAmount, 'Projected Maturity', policy.maturityAmount]
    ];

    analysisRows.forEach((row, index) => {
      const newRow = sheet.addRow(row);
      
      // Style labels
      styleCell(newRow.getCell(1), { bold: true, bgColor: colors.lightBg.argb, fontColor: colors.primary.argb });
      styleCell(newRow.getCell(3), { bold: true, bgColor: colors.lightBg.argb, fontColor: colors.primary.argb });
      
      // Style values
      [2, 4].forEach(colIndex => {
        const cell = newRow.getCell(colIndex);
        styleCell(cell, { bgColor: colors.white.argb });
        if (index > 0) { // Currency formatting for amounts
          cell.numFmt = '"₹"#,##0.00';
        } else { // Percentage formatting
          cell.value = cell.value.toString(); // Keep as string for percentages
        }
      });
    });

    // Add visual progress indicator
    sheet.addRow([]);
    const progressRow = sheet.addRow(['INVESTMENT PROGRESS TRACKER', '', '', '']);
    sheet.mergeCells(`A${progressRow.number}:D${progressRow.number}`);
    styleCell(progressRow.getCell(1), {
      fontSize: 12,
      bold: true,
      bgColor: colors.lightBg.argb,
      fontColor: colors.primary.argb,
      align: 'center'
    });

    // Create a visual progress bar
    const progressBarRow = sheet.addRow(['', '', '', '']);
    const progressWidth = 50; // Characters for visual bar
    const filledChars = Math.floor((paymentRatio / 100) * progressWidth);
    const emptyChars = progressWidth - filledChars;
    const progressBar = '█'.repeat(filledChars) + '░'.repeat(emptyChars);
    
    sheet.mergeCells(`A${progressBarRow.number}:D${progressBarRow.number}`);
    styleCell(progressBarRow.getCell(1), {
      fontColor: colors.accent.argb,
      align: 'center',
      fontSize: 12,
      border: false
    });
    progressBarRow.getCell(1).value = progressBar;

    // Add percentage below progress bar
    const percentRow = sheet.addRow(['', '', '', '']);
    sheet.mergeCells(`A${percentRow.number}:D${percentRow.number}`);
    styleCell(percentRow.getCell(1), {
      bold: true,
      fontColor: colors.primary.argb,
      align: 'center',
      fontSize: 14
    });
    percentRow.getCell(1).value = `${paymentRatio.toFixed(1)}% Complete`;

    sheet.addRow([]); // Spacer

    // --- FOOTER ---
    const footerRow = sheet.addRow([
      'This is a system-generated report. For any discrepancies, please contact your relationship manager.'
    ]);
    sheet.mergeCells(`A${footerRow.number}:D${footerRow.number}`);
    styleCell(footerRow.getCell(1), {
      fontSize: 9,
      fontColor: colors.textLight.argb,
      align: 'center',
      italic: true,
      border: false
    });

    // Add generation timestamp
    const timestampRow = sheet.addRow([
      `Report generated on ${new Date().toLocaleString()} by ${req.admin.email || 'System'}`
    ]);
    sheet.mergeCells(`A${timestampRow.number}:D${timestampRow.number}`);
    styleCell(timestampRow.getCell(1), {
      fontSize: 8,
      fontColor: colors.textLight.argb,
      align: 'center',
      border: false
    });

    // Apply consistent borders to all cells for a clean, professional look
    for (let i = 1; i <= sheet.lastRow.number; i++) {
      const row = sheet.getRow(i);
      for (let j = 1; j <= 4; j++) {
        const cell = row.getCell(j);
        if (!cell.border) {
          cell.border = {
            top: { style: 'thin', color: { argb: colors.border.argb } },
            left: { style: 'thin', color: { argb: colors.border.argb } },
            bottom: { style: 'thin', color: { argb: colors.border.argb } },
            right: { style: 'thin', color: { argb: colors.border.argb } }
          };
        }
      }
    }

    // Download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    const fileName = `Policy_Report_${policy._id.toString().slice(-8)}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: error.message });
  }
};