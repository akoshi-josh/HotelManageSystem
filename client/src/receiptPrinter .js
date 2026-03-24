/**
 * receiptPrinter.js
 * Shared receipt printing utility for CheckIn and CheckOut pages.
 * Usage:
 *   import { printCheckOutReceipt, printCheckInReceipt } from "../receiptPrinter";
 *   printCheckOutReceipt(data, issuedBy);
 *   printCheckInReceipt(data, issuedBy);
 */

const PAY_LABEL = {
  cash:          "Cash",
  card:          "Credit / Debit Card",
  gcash:         "GCash",
  bank_transfer: "Bank Transfer",
  pay_at_checkout: "To be paid at Check-Out",
};

/** Format PHP currency */
const php = (amount) =>
  "PHP " + parseFloat(amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

/** Generate receipt number */
const genReceiptNo = (prefix) => {
  const now = new Date();
  return `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
};

/** Shared CSS for both receipt types */
const RECEIPT_CSS = `
  @page { size: 210mm 297mm; margin: 16mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #222; font-size: 13px; background: #fff; }
  .receipt { max-width: 580px; margin: 0 auto; }

  /* Header */
  .hotel-header { text-align: center; padding-bottom: 14px; border-bottom: 2px solid #07713c; margin-bottom: 14px; }
  .hotel-name { font-size: 24px; font-weight: 700; color: #07713c; letter-spacing: .5px; }
  .hotel-tagline { font-size: 11px; color: #888; margin-top: 3px; }

  /* Receipt title band */
  .receipt-band { background: #07713c; color: #fff; text-align: center; padding: 9px 0; border-radius: 8px; margin-bottom: 10px; }
  .receipt-band.checkin { background: #1565c0; }
  .receipt-title { font-size: 15px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .receipt-meta  { font-size: 11px; color: rgba(255,255,255,.75); margin-top: 3px; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
  .info-box  { background: #f8f9fa; border-radius: 8px; padding: 9px 12px; border: 1px solid #eee; }
  .info-lbl  { font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3px; }
  .info-val  { font-size: 13px; font-weight: 600; color: #222; }

  /* Section label */
  .sec-lbl { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: .08em; margin: 14px 0 7px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }

  /* Charges table */
  table.charges { width: 100%; border-collapse: collapse; }
  table.charges td { padding: 5px 0; font-size: 13px; vertical-align: top; }
  table.charges td:last-child { text-align: right; white-space: nowrap; }
  .cat-header td { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 8px 0 3px; }
  .indent { padding-left: 14px !important; color: #555; }
  .subtotal-row td { font-size: 13px; font-weight: 600; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 4px; }
  .total-row td  { font-size: 16px; font-weight: 700; border-top: 2.5px solid #333; padding: 10px 0 5px; }
  .deduct-row td { font-size: 13px; color: #4caf50; font-weight: 600; padding: 3px 0; }
  .balance-row td{ font-size: 15px; font-weight: 700; color: #07713c; padding: 5px 0; }
  .balance-row.checkin td { color: #1565c0; }

  /* Payment badge */
  .pay-row { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 14px; margin: 14px 0; }
  .pay-row.checkin { background: #eff6ff; border-color: #bfdbfe; }
  .pay-lbl { font-size: 10px; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
  .pay-val { font-size: 13px; font-weight: 700; color: #07713c; }
  .pay-val.checkin { color: #1565c0; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: .05em; }
  .badge-green { background: #07713c; color: #fff; }
  .badge-blue  { background: #1565c0; color: #fff; }
  .badge-yellow{ background: #f57f17; color: #fff; }

  /* Issued by */
  .issued-box { background: #f8f9fa; border: 1px solid #eee; border-radius: 8px; padding: 9px 14px; margin: 14px 0; display: flex; justify-content: space-between; align-items: center; }
  .issued-lbl { font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
  .issued-val { font-size: 13px; font-weight: 600; color: #333; }
  .issued-role { font-size: 11px; color: #888; }

  /* Notes */
  .notes-box { background: #fffde7; border: 1px solid #ffe082; border-radius: 8px; padding: 9px 12px; font-size: 12px; color: #555; line-height: 1.5; margin: 10px 0; }

  /* Footer */
  .footer { text-align: center; margin-top: 22px; padding-top: 14px; border-top: 1px dashed #ccc; }
  .footer-msg { font-size: 14px; font-weight: 700; color: #07713c; margin-bottom: 5px; }
  .footer-sub { font-size: 11px; color: #aaa; line-height: 1.6; }
  .footer-legal { font-size: 10px; color: #ccc; margin-top: 10px; }

  /* Divider */
  hr.div  { border: none; border-top: 1px solid #e0e0e0; margin: 12px 0; }
  hr.div2 { border: none; border-top: 2px solid #333; margin: 12px 0; }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .no-print { display: none; }
  }
`;

/** Open a print window with given HTML */
const openPrintWindow = (title, html) => {
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) {
    alert("Pop-up blocked! Please allow pop-ups for this site to print receipts.");
    return;
  }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>${RECEIPT_CSS}</style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  // Print button + auto-print
  setTimeout(() => { win.print(); }, 700);
};

/**
 * Print Check-Out Receipt
 * @param {object} data  - checkout billing data
 * @param {object} issuedBy - { name, role } of the staff who processed checkout
 */
export const printCheckOutReceipt = (data, issuedBy = {}) => {
  const now        = new Date();
  const printDate  = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const printTime  = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const receiptNo  = genReceiptNo("COR");

  // Build charge rows
  const lineRow = (label, amount, colorClass = "", indent = false) =>
    `<tr>
      <td class="${indent ? "indent" : ""}" style="color:${colorClass || "#333"}">${label}</td>
      <td style="font-weight:600;color:${colorClass || "#333"}">${php(amount)}</td>
    </tr>`;

  const rows = [
    lineRow("Room Charge", data.roomCharge),
    ...(data.resCharges || []).map(c => lineRow(`  ${c.name}  (reservation)`, c.amount, "#999", true)),
    ...(data.inHouseCharges || []).length > 0
      ? [`<tr class="cat-header"><td colspan="2" style="color:#6a1b9a">In-House Charges</td></tr>`,
         ...(data.inHouseCharges || []).map(c => lineRow(`${c.name}`, c.amount, "#6a1b9a", true))]
      : [],
    ...(data.inspCharges || []).filter(c => !c.tbd).length > 0
      ? [`<tr class="cat-header"><td colspan="2" style="color:#c62828">Damage / Inspection Charges</td></tr>`,
         ...(data.inspCharges || []).filter(c => !c.tbd).map(c => lineRow(`${c.name}`, c.amount, "#c62828", true))]
      : [],
    ...(parseFloat(data.extraAmt || 0) > 0
      ? [lineRow(`Extra Charges${data.extraNote ? " — " + data.extraNote : ""}`, data.extraAmt)]
      : []),
  ].join("");

  const balanceDue = Math.max(0, parseFloat(data.grandTotal || 0) - parseFloat(data.alreadyPaid || 0));

  const html = `
<div class="receipt">

  <!-- Hotel Header -->
  <div class="hotel-header">
    <div class="hotel-name">&#127968; Hotel Management</div>
    <div class="hotel-tagline">Your comfort is our priority</div>
  </div>

  <!-- Receipt Band -->
  <div class="receipt-band">
    <div class="receipt-title">Check-Out Receipt</div>
    <div class="receipt-meta">${receiptNo} &nbsp;&#183;&nbsp; ${printDate} &nbsp;&#183;&nbsp; ${printTime}</div>
  </div>

  <!-- Guest Info -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-lbl">Guest Name</div>
      <div class="info-val">${data.guestName}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Room Number</div>
      <div class="info-val">Room ${data.roomNumber}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Check-In Date</div>
      <div class="info-val">${data.checkInDate || "—"}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Check-Out Date</div>
      <div class="info-val">${data.checkOutDate || printDate}</div>
    </div>
  </div>

  <hr class="div">

  <!-- Charges -->
  <div class="sec-lbl">Charges Breakdown</div>
  <table class="charges">
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td>Grand Total</td>
        <td>${php(data.grandTotal)}</td>
      </tr>
      ${parseFloat(data.alreadyPaid || 0) > 0
        ? `<tr class="deduct-row">
             <td>Paid at Check-In</td>
             <td>&#8722; ${php(data.alreadyPaid)}</td>
           </tr>`
        : ""}
      <tr class="balance-row">
        <td>Balance Collected</td>
        <td>${php(balanceDue)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Payment Method -->
  <div class="pay-row">
    <div>
      <div class="pay-lbl">Payment Method</div>
      <div class="pay-val">${PAY_LABEL[data.payMethod] || data.payMethod || "—"}</div>
    </div>
    <span class="badge badge-green">&#10003; Settled</span>
  </div>

  <!-- Guest Notes -->
  ${data.guestNotes ? `<div class="notes-box"><strong>Guest Notes:</strong> ${data.guestNotes}</div>` : ""}

  <!-- Issued By -->
  <div class="issued-box">
    <div>
      <div class="issued-lbl">Issued by</div>
      <div class="issued-val">${issuedBy.name || "Staff"}</div>
      <div class="issued-role">${issuedBy.role ? issuedBy.role.charAt(0).toUpperCase() + issuedBy.role.slice(1) : ""}</div>
    </div>
    <div style="text-align:right">
      <div class="issued-lbl">Processed on</div>
      <div class="issued-val" style="font-size:12px">${printDate}</div>
      <div class="issued-role">${printTime}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-msg">Thank you for staying with us!</div>
    <div class="footer-sub">
      We hope you had a wonderful experience.<br>
      We look forward to welcoming you back.
    </div>
    <div class="footer-legal">This is an official receipt. Please keep for your records. &nbsp;&#183;&nbsp; ${receiptNo}</div>
  </div>

</div>`;

  openPrintWindow("Check-Out Receipt", html);
};

/**
 * Print Check-In Receipt / Booking Confirmation
 * @param {object} data  - checkin data
 * @param {object} issuedBy - { name, role } of the staff who processed check-in
 */
export const printCheckInReceipt = (data, issuedBy = {}) => {
  const now        = new Date();
  const printDate  = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const printTime  = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const receiptNo  = genReceiptNo("CIR");

  const lineRow = (label, amount, colorStyle = "#333", indent = false) =>
    `<tr>
      <td class="${indent ? "indent" : ""}" style="color:${colorStyle}">${label}</td>
      <td style="font-weight:600;color:${colorStyle}">${php(amount)}</td>
    </tr>`;

  const resCharges = (data.resCharges || []);
  const walkInCharges = (data.walkInCharges || []);

  const rows = [
    lineRow("Room Charge", data.roomCharge),
    ...(resCharges.length > 0
      ? [`<tr class="cat-header"><td colspan="2" style="color:#888">Reservation Charges (included)</td></tr>`,
         ...resCharges.map(c => lineRow(c.name, c.amount, "#999", true))]
      : []),
    ...(walkInCharges.length > 0
      ? [`<tr class="cat-header"><td colspan="2" style="color:#1565c0">Additional Charges</td></tr>`,
         ...walkInCharges.map(c => lineRow(c.name, c.amount, "#1565c0", true))]
      : []),
  ].join("");

  const isPayLater = data.payMethod === "pay_at_checkout";
  const paidNow    = parseFloat(data.amountPaid || 0);
  const totalBill  = parseFloat(data.grandTotal || 0);
  const balanceDue = Math.max(0, totalBill - paidNow);

  const html = `
<div class="receipt">

  <!-- Hotel Header -->
  <div class="hotel-header">
    <div class="hotel-name">&#127968; Hotel Management</div>
    <div class="hotel-tagline">Your comfort is our priority</div>
  </div>

  <!-- Receipt Band -->
  <div class="receipt-band checkin">
    <div class="receipt-title">Check-In Confirmation</div>
    <div class="receipt-meta">${receiptNo} &nbsp;&#183;&nbsp; ${printDate} &nbsp;&#183;&nbsp; ${printTime}</div>
  </div>

  <!-- Guest Info -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-lbl">Guest Name</div>
      <div class="info-val">${data.guestName}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Room Number</div>
      <div class="info-val">Room ${data.roomNumber}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Check-In Date</div>
      <div class="info-val">${data.checkInDate || printDate}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Check-Out Date</div>
      <div class="info-val">${data.checkOutDate || "Open Stay"}</div>
    </div>
    ${data.nights ? `<div class="info-box" style="grid-column:span 2">
      <div class="info-lbl">Duration</div>
      <div class="info-val">${data.nights} night${data.nights !== 1 ? "s" : ""}</div>
    </div>` : ""}
    ${data.guestPhone ? `<div class="info-box" style="grid-column:span 2">
      <div class="info-lbl">Phone</div>
      <div class="info-val">${data.guestPhone}</div>
    </div>` : ""}
  </div>

  <hr class="div">

  <!-- Charges -->
  <div class="sec-lbl">Charges Summary</div>
  <table class="charges">
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td>Total Amount</td>
        <td>${php(totalBill)}</td>
      </tr>
      ${paidNow > 0
        ? `<tr class="deduct-row" style="color:#1565c0">
             <td>Paid at Check-In</td>
             <td>&#8722; ${php(paidNow)}</td>
           </tr>`
        : ""}
      ${balanceDue > 0
        ? `<tr class="balance-row checkin">
             <td>Balance Due at Check-Out</td>
             <td>${php(balanceDue)}</td>
           </tr>`
        : `<tr class="balance-row" style="color:#07713c">
             <td>Fully Paid</td>
             <td>&#10003; ${php(totalBill)}</td>
           </tr>`}
    </tfoot>
  </table>

  <!-- Payment Method -->
  <div class="pay-row checkin">
    <div>
      <div class="pay-lbl">Payment</div>
      <div class="pay-val checkin">${PAY_LABEL[data.payMethod] || data.payMethod || "—"}</div>
    </div>
    <span class="badge ${isPayLater ? "badge-yellow" : "badge-blue"}">${isPayLater ? "&#9888; Pay at Checkout" : "&#10003; Paid"}</span>
  </div>

  <!-- Guest Notes -->
  ${data.guestNotes ? `<div class="notes-box"><strong>Special Requests:</strong> ${data.guestNotes}</div>` : ""}

  <!-- Issued By -->
  <div class="issued-box">
    <div>
      <div class="issued-lbl">Processed by</div>
      <div class="issued-val">${issuedBy.name || "Staff"}</div>
      <div class="issued-role">${issuedBy.role ? issuedBy.role.charAt(0).toUpperCase() + issuedBy.role.slice(1) : ""}</div>
    </div>
    <div style="text-align:right">
      <div class="issued-lbl">Check-In Processed</div>
      <div class="issued-val" style="font-size:12px">${printDate}</div>
      <div class="issued-role">${printTime}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-msg">Welcome to Hotel Management!</div>
    <div class="footer-sub">
      We hope you enjoy your stay.<br>
      Please keep this as your check-in confirmation.
    </div>
    <div class="footer-legal">This is an official receipt. Please keep for your records. &nbsp;&#183;&nbsp; ${receiptNo}</div>
  </div>

</div>`;

  openPrintWindow("Check-In Confirmation", html);
};