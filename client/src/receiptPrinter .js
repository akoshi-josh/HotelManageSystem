const PAY_LABEL = {
  cash:            "Cash",
  card:            "Credit / Debit Card",
  gcash:           "GCash",
  bank_transfer:   "Bank Transfer",
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

/**
 * Shared CSS
 *
 * Bond paper: 216mm × 279mm (portrait)
 * Receipt occupies LEFT HALF: 108mm wide × 279mm tall
 * Right half (108mm × 279mm) is completely blank — reusable
 *
 * A dashed vertical line at x=108mm marks the cut boundary.
 *
 * Auto-scale: if .receipt content is taller than 279mm,
 * JS shrinks it via transform:scale() so nothing is clipped.
 */
const RECEIPT_CSS = `
  @page { size: 216mm 279mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, sans-serif;
    color: #222;
    font-size: 11px;
    background: #fff;
    width: 216mm;
    height: 279mm;
    overflow: hidden;
    position: relative;
  }

  /* Dashed vertical cut line in the center */
  body::after {
    content: '';
    position: absolute;
    top: 0; left: 108mm;
    width: 0; height: 279mm;
    border-left: 1px dashed #bbb;
    pointer-events: none;
  }

  /* LEFT half — the receipt slot: 108mm wide × 279mm tall */
  .receipt-wrapper {
    position: absolute;
    top: 0; left: 0;
    width: 108mm;
    height: 279mm;
    overflow: hidden;
  }

  /* Scalable content box — width locked to 108mm, height natural */
  .receipt {
    width: 108mm;
    padding: 6mm 7mm;
    transform-origin: top left;
    /* JS applies transform:scale(N) only when content overflows 279mm */
  }

  /* Header */
  .hotel-header {
    text-align: center;
    padding-bottom: 6px;
    border-bottom: 2px solid #07713c;
    margin-bottom: 7px;
  }
  .hotel-name    { font-size: 15px; font-weight: 700; color: #07713c; letter-spacing: .5px; }
  .hotel-tagline { font-size: 8px; color: #888; margin-top: 1px; }

  /* Receipt title band */
  .receipt-band {
    background: #07713c;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 5px;
    margin-bottom: 7px;
  }
  .receipt-band.checkin  { background: #1565c0; }
  .receipt-band.checkout { background: #07713c; }
  .receipt-band.inhouse  { background: #e65100; }
  .receipt-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .receipt-meta  { font-size: 8px; color: rgba(255,255,255,.75); margin-top: 1px; }

  /* Info grid — 2 columns within 108mm */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin: 6px 0;
  }
  .info-grid .span2 { grid-column: span 2; }
  .info-box { background: #f8f9fa; border-radius: 4px; padding: 4px 6px; border: 1px solid #eee; }
  .info-lbl { font-size: 7.5px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; }
  .info-val { font-size: 9.5px; font-weight: 600; color: #222; }

  /* Section label */
  .sec-lbl {
    font-size: 7.5px; font-weight: 700; color: #888;
    text-transform: uppercase; letter-spacing: .08em;
    margin: 7px 0 3px;
    border-bottom: 1px solid #f0f0f0; padding-bottom: 2px;
  }

  /* Charges table */
  table.charges { width: 100%; border-collapse: collapse; }
  table.charges td { padding: 2px 0; font-size: 9.5px; vertical-align: top; }
  table.charges td:last-child { text-align: right; white-space: nowrap; }
  .cat-header td {
    font-size: 7.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .06em; padding: 4px 0 2px;
  }
  .indent { padding-left: 10px !important; color: #555; }
  .total-row td { font-size: 11px; font-weight: 700; border-top: 2px solid #333; padding: 4px 0 2px; }
  .deduct-row td { font-size: 9.5px; color: #4caf50; font-weight: 600; padding: 1px 0; }
  .balance-row td { font-size: 10px; font-weight: 700; color: #07713c; padding: 2px 0; }
  .balance-row.checkin  td { color: #1565c0; }
  .balance-row.checkout td { color: #07713c; }
  .balance-row.inhouse  td { color: #e65100; }

  /* Payment row */
  .pay-row {
    display: flex; justify-content: space-between; align-items: center;
    background: #f0fdf4; border: 1px solid #a7f3d0;
    border-radius: 5px; padding: 5px 7px; margin: 7px 0;
  }
  .pay-row.checkin  { background: #eff6ff; border-color: #bfdbfe; }
  .pay-row.checkout { background: #f0fdf4; border-color: #a7f3d0; }
  .pay-row.inhouse  { background: #fff3e0; border-color: #ffcc80; }
  .pay-lbl { font-size: 7.5px; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 1px; }
  .pay-val { font-size: 9.5px; font-weight: 700; color: #07713c; }
  .pay-val.checkin  { color: #1565c0; }
  .pay-val.checkout { color: #07713c; }
  .pay-val.inhouse  { color: #e65100; }
  .badge {
    display: inline-block; font-size: 7.5px; font-weight: 700;
    padding: 2px 6px; border-radius: 10px;
    text-transform: uppercase; letter-spacing: .05em;
  }
  .badge-green  { background: #07713c; color: #fff; }
  .badge-blue   { background: #1565c0; color: #fff; }
  .badge-yellow { background: #f57f17; color: #fff; }
  .badge-orange { background: #e65100; color: #fff; }

  /* Issued by */
  .issued-box {
    background: #f8f9fa; border: 1px solid #eee; border-radius: 5px;
    padding: 5px 7px; margin: 6px 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .issued-lbl  { font-size: 7.5px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 1px; }
  .issued-val  { font-size: 9.5px; font-weight: 600; color: #333; }
  .issued-role { font-size: 8px; color: #888; }

  /* Notes */
  .notes-box {
    background: #fffde7; border: 1px solid #ffe082; border-radius: 5px;
    padding: 5px 7px; font-size: 8.5px; color: #555; line-height: 1.4;
    margin: 6px 0;
  }

  /* Footer */
  .footer { text-align: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #ccc; }
  .footer-msg   { font-size: 10px; font-weight: 700; color: #07713c; margin-bottom: 2px; }
  .footer-sub   { font-size: 7.5px; color: #aaa; line-height: 1.5; }
  .footer-legal { font-size: 7.5px; color: #ccc; margin-top: 4px; }

  hr.div { border: none; border-top: 1px solid #e0e0e0; margin: 5px 0; }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .no-print { display: none; }
  }
`;

/**
 * Auto-scale script:
 * Measures .receipt natural scrollHeight vs the 279mm wrapper.
 * If content is taller, scales down uniformly so everything fits.
 * Does nothing if content fits normally.
 */
const AUTO_SCALE_SCRIPT = `
<script>
  window.addEventListener('DOMContentLoaded', function () {
    var wrapper = document.querySelector('.receipt-wrapper');
    var receipt = document.querySelector('.receipt');
    if (!wrapper || !receipt) return;

    requestAnimationFrame(function () {
      var maxH  = wrapper.getBoundingClientRect().height;
      var contH = receipt.scrollHeight;

      if (contH > maxH) {
        var scale = maxH / contH;
        receipt.style.transform = 'scale(' + scale + ')';
        receipt.style.transformOrigin = 'top left';
      }
    });
  });
</script>
`;

/** Open a print window with given HTML */
const openPrintWindow = (title, html) => {
  const win = window.open("", "_blank", "width=900,height=960");
  if (!win) {
    alert("Pop-up blocked! Please allow pop-ups for this site to print receipts.");
    return;
  }
  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>` +
    `<style>${RECEIPT_CSS}</style></head><body>${html}${AUTO_SCALE_SCRIPT}</body></html>`
  );
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 900);
};

/**
 * Print Check-Out Receipt
 *
 * data shape — mirrors CheckOutModal's bill breakdown exactly:
 * {
 *   guestName, roomNumber, checkInDate, checkOutDate, nights, guestPhone,
 *
 *   // Bill rows (same as modal)
 *   displayRoomRate,      // room rate only (no bundled extras)
 *   resCharges,           // [{ name, amount }]  — reservation included charges
 *   inHouseCharges,       // [{ name, amount }]  — in-house / restaurant charges
 *   historyCharges,       // [{ note, amount, type }]  — date_change_charge / room_transfer_charge
 *   historyDeductions,    // [{ note, amount, date, type }] — inhouse_payment / date_change_refund / room_transfer_refund
 *   inspCharges,          // [{ name, amount, tbd }]  — damage charges
 *   extraAmt,             // extra at checkout
 *   extraNote,
 *
 *   // Totals (same as modal)
 *   displaySubtotal,      // subtotal shown in modal
 *   grandTotal,           // remaining balance (what's collected now)
 *   reservationDP,        // downpayment from reservation
 *   checkinPayment,       // amount_paid at checkin
 *   totalPaid,            // reservationDP + checkinPayment
 *   balanceCollected,     // actual amount collected at checkout
 *
 *   payMethod,
 *   guestNotes,
 * }
 */
export const printCheckOutReceipt = (data, issuedBy = {}) => {
  const now       = new Date();
  const printDate = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const printTime = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const receiptNo = genReceiptNo("COR");

  const lineRow = (label, amount, color = "#333", indent = false) =>
    `<tr>
      <td class="${indent ? "indent" : ""}" style="color:${color}">${label}</td>
      <td style="font-weight:600;color:${color}">${php(amount)}</td>
    </tr>`;

  const deductRow = (label, amount, color = "#4caf50") =>
    `<tr>
      <td style="color:${color}">${label}</td>
      <td style="font-weight:600;color:${color}">&#8722; ${php(amount)}</td>
    </tr>`;

  const resCharges       = data.resCharges       || [];
  const inHouseCharges   = data.inHouseCharges   || [];
  const historyCharges   = (data.historyCharges  || []).filter(h =>
    h.type === "date_change_charge" || h.type === "room_transfer_charge"
  );
  const historyDeductions = (data.historyDeductions || []).filter(h =>
    h.type === "inhouse_payment" || h.type === "date_change_refund" || h.type === "room_transfer_refund"
  );
  const inspCharges = (data.inspCharges || []).filter(c => !c.tbd);

  const extraNow = parseFloat(data.extraAmt || 0);

  // Use displayRoomRate exactly as computed in CheckOutModal — pass it directly,
  // don't re-derive it here since it depends on getAdditionalCharges() internals
  const displayRoomRate = parseFloat(data.displayRoomRate || 0);

  const historyDeductionMeta = {
    inhouse_payment:      { label: "Cash Payment (In-House)", color: "#07713c" },
    date_change_refund:   { label: "Date Shortening Refund",  color: "#1565c0" },
    room_transfer_refund: { label: "Room Transfer Refund",    color: "#1565c0" },
  };

  // ── Build charge rows (mirrors modal order exactly) ──
  const rows = [
    // Room rate
    lineRow("Room Rate", displayRoomRate),

    // Reservation charges
    ...(resCharges.length > 0 ? [
      `<tr class="cat-header"><td colspan="2" style="color:#888">Reservation Charges</td></tr>`,
      ...resCharges.map(c =>
        `<tr><td class="indent" style="color:#999">${c.name} <span style="font-size:7.5px">(included)</span></td><td style="color:#999;font-weight:600">${php(c.amount)}</td></tr>`
      ),
    ] : []),

    // In-house / restaurant charges
    ...(inHouseCharges.length > 0 || historyCharges.length > 0 ? [
      `<tr class="cat-header"><td colspan="2" style="color:#6a1b9a">In-House / Check-In Charges</td></tr>`,
      ...inHouseCharges.map(c =>
        lineRow(c.name.replace(/^\[Restaurant\] /, ""), c.amount, "#6a1b9a", true)
      ),
      ...historyCharges.map(h =>
        lineRow(
          `${h.type === "date_change_charge" ? "📅" : "🔄"} ${h.note}`,
          h.amount,
          h.type === "date_change_charge" ? "#e65100" : "#6a1b9a",
          true
        )
      ),
    ] : []),

    // Damage / inspection
    ...(inspCharges.length > 0 ? [
      `<tr class="cat-header"><td colspan="2" style="color:#c62828">Damage / Inspection</td></tr>`,
      ...inspCharges.map(c => lineRow(c.name, c.amount, "#c62828", true)),
    ] : []),

    // Extra at checkout
    ...(extraNow > 0 ? [
      lineRow(`Extra at Check-Out${data.extraNote ? " — " + data.extraNote : ""}`, extraNow),
    ] : []),

  ].join("");

  // ── Subtotal row ──
  const displaySubtotal = parseFloat(data.displaySubtotal || 0);

  // ── Already-paid deductions (mirrors modal) ──
  const checkinPayment = parseFloat(data.checkinPayment || 0);
  const totalPaid      = parseFloat(data.totalPaid      || 0);

  const paidInFullAtCheckIn = checkinPayment > 0 && checkinPayment >= parseFloat(data.displaySubtotal || 0);
  const partialAtCheckIn    = checkinPayment > 0 && !paidInFullAtCheckIn;

  const balanceCollected = parseFloat(data.balanceCollected || data.grandTotal || 0);

  const html = `
<div class="receipt-wrapper">
<div class="receipt">

  <div class="hotel-header">
    <div class="hotel-name">&#127968; Hotel Management</div>
    <div class="hotel-tagline">Your comfort is our priority</div>
  </div>

  <div class="receipt-band checkout">
    <div class="receipt-title">Check-Out Receipt</div>
    <div class="receipt-meta">${receiptNo} &nbsp;&#183;&nbsp; ${printDate} &nbsp;&#183;&nbsp; ${printTime}</div>
  </div>

  <div class="info-grid">
    <div class="info-box"><div class="info-lbl">Guest Name</div><div class="info-val">${data.guestName}</div></div>
    <div class="info-box"><div class="info-lbl">Room</div><div class="info-val">Room ${data.roomNumber}</div></div>
    <div class="info-box"><div class="info-lbl">Check-In</div><div class="info-val">${data.checkInDate || "—"}</div></div>
    <div class="info-box"><div class="info-lbl">Check-Out</div><div class="info-val">${data.checkOutDate || printDate}</div></div>
    ${data.nights
      ? `<div class="info-box span2"><div class="info-lbl">Duration</div><div class="info-val">${data.nights} night${data.nights !== 1 ? "s" : ""}</div></div>`
      : ""}
    ${data.guestPhone
      ? `<div class="info-box span2"><div class="info-lbl">Phone</div><div class="info-val">${data.guestPhone}</div></div>`
      : ""}
  </div>

  <hr class="div">

  <div class="sec-lbl">Charges Breakdown</div>
  <table class="charges">
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <!-- Subtotal -->
      <tr style="border-top:1.5px solid #e0e0e0">
        <td style="font-size:10px;font-weight:700;padding-top:5px">Subtotal</td>
        <td style="font-size:10px;font-weight:700;padding-top:5px;text-align:right">${php(displaySubtotal)}</td>
      </tr>

      <!-- Already paid deductions -->
      ${paidInFullAtCheckIn
        ? deductRow("Paid in Full at Check-In", checkinPayment, "#07713c")
        : ""}
      ${partialAtCheckIn
        ? deductRow("Partial Payment at Check-In", checkinPayment, "#07713c")
        : ""}

      <!-- Payment history deductions (in-house payments, refunds) -->
      ${historyDeductions.map(h => {
        const meta = historyDeductionMeta[h.type] || { label: h.type, color: "#07713c" };
        return deductRow(`${meta.label}${h.note ? " — " + h.note : ""}`, h.amount, meta.color);
      }).join("")}

      <!-- Grand total separator -->
      <tr class="total-row">
        <td>Grand Total</td>
        <td>${php(displaySubtotal - totalPaid - historyDeductions.reduce((s,h)=>s+parseFloat(h.amount||0),0))}</td>
      </tr>

      <!-- Balance collected now -->
      <tr class="balance-row checkout">
        <td>Balance Collected</td>
        <td>${php(balanceCollected)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="pay-row checkout">
    <div>
      <div class="pay-lbl">Total Balance</div>
      <div class="pay-val checkout">${php(0)}</div>
    </div>
    <span class="badge badge-green">&#10003; Paid</span>
  </div>

  ${data.guestNotes
    ? `<div class="notes-box"><strong>Guest Notes:</strong> ${data.guestNotes}</div>`
    : ""}

  <div class="sec-lbl">Serviced By</div>
  <div class="issued-box">
    <div>
      <div class="issued-lbl">Staff</div>
      <div class="issued-val">${issuedBy.name || "Staff"}</div>
      <div class="issued-role">${issuedBy.role
        ? issuedBy.role.charAt(0).toUpperCase() + issuedBy.role.slice(1)
        : ""}</div>
    </div>
    <div style="text-align:right">
      <div class="issued-lbl">Processed on</div>
      <div class="issued-val" style="font-size:8.5px">${printDate}</div>
      <div class="issued-role">${printTime}</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-msg">Thank you for staying with us!</div>
    <div class="footer-sub">
      We hope you had a wonderful experience.<br>
      We look forward to welcoming you back.<br>
      @akuxhijosh
    </div>
    <div class="footer-legal">Official receipt &nbsp;&#183;&nbsp; ${receiptNo}</div>
  </div>

</div>
</div>`;

  openPrintWindow("Check-Out Receipt", html);
};

/**
 * Print Check-In Receipt / Booking Confirmation
 */
export const printCheckInReceipt = (data, issuedBy = {}) => {
  const now       = new Date();
  const printDate = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const printTime = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const receiptNo = genReceiptNo("CIR");

  const lineRow = (label, amount, color = "#333", indent = false) =>
    `<tr>
      <td class="${indent ? "indent" : ""}" style="color:${color}">${label}</td>
      <td style="font-weight:600;color:${color}">${php(amount)}</td>
    </tr>`;

  const resCharges    = data.resCharges    || [];
  const walkInCharges = data.walkInCharges || [];

  const rows = [
    lineRow("Room Charge", data.roomCharge),
    ...(resCharges.length > 0 ? [
      `<tr class="cat-header"><td colspan="2" style="color:#888">Reservation Charges</td></tr>`,
      ...resCharges.map(c => lineRow(c.name, c.amount, "#999", true)),
    ] : []),
    ...(walkInCharges.length > 0 ? [
      `<tr class="cat-header"><td colspan="2" style="color:#1565c0">Additional Charges</td></tr>`,
      ...walkInCharges.map(c => lineRow(c.name, c.amount, "#1565c0", true)),
    ] : []),
  ].join("");

  const isPayLater = data.payMethod === "pay_at_checkout";
  const paidNow    = parseFloat(data.amountPaid  || 0);
  const totalBill  = parseFloat(data.grandTotal  || 0);
  const balanceDue = Math.max(0, totalBill - paidNow);

  const html = `
<div class="receipt-wrapper">
<div class="receipt">

  <div class="hotel-header">
    <div class="hotel-name">&#127968; Hotel Management</div>
    <div class="hotel-tagline">Your comfort is our priority</div>
  </div>

  <div class="receipt-band checkin">
    <div class="receipt-title">Check-In Confirmation</div>
    <div class="receipt-meta">${receiptNo} &nbsp;&#183;&nbsp; ${printDate} &nbsp;&#183;&nbsp; ${printTime}</div>
  </div>

  <div class="info-grid">
    <div class="info-box"><div class="info-lbl">Guest Name</div><div class="info-val">${data.guestName}</div></div>
    <div class="info-box"><div class="info-lbl">Room</div><div class="info-val">Room ${data.roomNumber}</div></div>
    <div class="info-box"><div class="info-lbl">Check-In</div><div class="info-val">${data.checkInDate || printDate}</div></div>
    <div class="info-box"><div class="info-lbl">Check-Out</div><div class="info-val">${data.checkOutDate || "Open Stay"}</div></div>
    ${data.nights
      ? `<div class="info-box span2"><div class="info-lbl">Duration</div><div class="info-val">${data.nights} night${data.nights !== 1 ? "s" : ""}</div></div>`
      : ""}
    ${data.guestPhone
      ? `<div class="info-box span2"><div class="info-lbl">Phone</div><div class="info-val">${data.guestPhone}</div></div>`
      : ""}
  </div>

  <hr class="div">

  <div class="sec-lbl">Charges Summary</div>
  <table class="charges">
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td>Total Amount</td><td>${php(totalBill)}</td>
      </tr>
      ${paidNow > 0
        ? `<tr class="deduct-row" style="color:#1565c0"><td>Paid at Check-In</td><td>&#8722; ${php(paidNow)}</td></tr>`
        : ""}
      ${balanceDue > 0
        ? `<tr class="balance-row checkin"><td>Balance Due at Check-Out</td><td>${php(balanceDue)}</td></tr>`
        : `<tr class="balance-row" style="color:#07713c"><td>Fully Paid</td><td>&#10003; ${php(totalBill)}</td></tr>`}
    </tfoot>
  </table>

  <div class="pay-row checkin">
    <div>
      <div class="pay-lbl">Payment Method</div>
      <div class="pay-val checkin">${PAY_LABEL[data.payMethod] || data.payMethod || "—"}</div>
    </div>
    <span class="badge ${isPayLater ? "badge-yellow" : "badge-blue"}">
      ${isPayLater ? "&#9888; Pay Later" : "&#10003; Paid"}
    </span>
  </div>

  ${data.guestNotes
    ? `<div class="notes-box"><strong>Special Requests:</strong> ${data.guestNotes}</div>`
    : ""}

  <div class="sec-lbl">Processed By</div>
  <div class="issued-box">
    <div>
      <div class="issued-lbl">Staff</div>
      <div class="issued-val">${issuedBy.name || "Staff"}</div>
      <div class="issued-role">${issuedBy.role
        ? issuedBy.role.charAt(0).toUpperCase() + issuedBy.role.slice(1)
        : ""}</div>
    </div>
    <div style="text-align:right">
      <div class="issued-lbl">Processed on</div>
      <div class="issued-val" style="font-size:8.5px">${printDate}</div>
      <div class="issued-role">${printTime}</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-msg">Welcome to Hotel Management!</div>
    <div class="footer-sub">
      We hope you enjoy your stay.<br>
      Please keep this as your check-in confirmation.<br>
      @akuxhijosh
    </div>
    <div class="footer-legal">Official receipt &nbsp;&#183;&nbsp; ${receiptNo}</div>
  </div>

</div>
</div>`;

  openPrintWindow("Check-In Confirmation", html);
};

/**
 * Print In-House Payment Receipt
 * Issued when a guest pays for something (room service, add-on, damage, etc.)
 * while still checked in — before checkout.
 *
 * @param {object} data - {
 *   guestName, roomNumber,
 *   checkInDate, checkOutDate,        // optional context
 *   charges: [{ name, amount }],      // list of items being paid now
 *   amountPaid,                       // total collected this transaction
 *   payMethod,                        // key from PAY_LABEL
 *   notes,                            // optional
 * }
 * @param {object} issuedBy - { name, role }
 */
export const printInHouseReceipt = (data, issuedBy = {}) => {
  const now       = new Date();
  const printDate = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const printTime = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const receiptNo = genReceiptNo("IHR");

  const lineRow = (label, amount, color = "#333", indent = false) =>
    `<tr>
      <td class="${indent ? "indent" : ""}" style="color:${color}">${label}</td>
      <td style="font-weight:600;color:${color}">${php(amount)}</td>
    </tr>`;

  const charges = data.charges || [];
  const rows = charges.map(c => lineRow(c.name, c.amount, "#e65100", true)).join("");
  const amountPaid = parseFloat(data.amountPaid || 0);

  const html = `
<div class="receipt-wrapper">
<div class="receipt">

  <div class="hotel-header">
    <div class="hotel-name">&#127968; Hotel Management</div>
    <div class="hotel-tagline">Your comfort is our priority</div>
  </div>

  <div class="receipt-band inhouse">
    <div class="receipt-title">In-House Payment</div>
    <div class="receipt-meta">${receiptNo} &nbsp;&#183;&nbsp; ${printDate} &nbsp;&#183;&nbsp; ${printTime}</div>
  </div>

  <div class="info-grid">
    <div class="info-box"><div class="info-lbl">Guest Name</div><div class="info-val">${data.guestName}</div></div>
    <div class="info-box"><div class="info-lbl">Room</div><div class="info-val">Room ${data.roomNumber}</div></div>
    ${data.checkInDate
      ? `<div class="info-box"><div class="info-lbl">Check-In</div><div class="info-val">${data.checkInDate}</div></div>`
      : ""}
    ${data.checkOutDate
      ? `<div class="info-box"><div class="info-lbl">Check-Out</div><div class="info-val">${data.checkOutDate}</div></div>`
      : ""}
  </div>

  <hr class="div">

  <div class="sec-lbl">Items Paid</div>
  <table class="charges">
    <tbody>
      <tr class="cat-header"><td colspan="2" style="color:#e65100">In-House Charges</td></tr>
      ${rows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td>Total Paid</td><td>${php(amountPaid)}</td>
      </tr>
      <tr class="balance-row inhouse">
        <td>Amount Collected</td><td>${php(amountPaid)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="pay-row inhouse">
    <div>
      <div class="pay-lbl">Payment Method</div>
      <div class="pay-val inhouse">${PAY_LABEL[data.payMethod] || data.payMethod || "—"}</div>
    </div>
    <span class="badge badge-orange">&#10003; Paid</span>
  </div>

  ${data.notes
    ? `<div class="notes-box"><strong>Notes:</strong> ${data.notes}</div>`
    : ""}

  <div class="sec-lbl">Serviced By</div>
  <div class="issued-box">
    <div>
      <div class="issued-lbl">Staff</div>
      <div class="issued-val">${issuedBy.name || "Staff"}</div>
      <div class="issued-role">${issuedBy.role
        ? issuedBy.role.charAt(0).toUpperCase() + issuedBy.role.slice(1)
        : ""}</div>
    </div>
    <div style="text-align:right">
      <div class="issued-lbl">Processed on</div>
      <div class="issued-val" style="font-size:8.5px">${printDate}</div>
      <div class="issued-role">${printTime}</div>
    </div>
  </div>
    <div class="footer-sub">
      This is an official in-house payment receipt.<br>
      Please keep this for your records.<br>
      @akuxhijosh
    </div>
    <div class="footer-legal">Official receipt &nbsp;&#183;&nbsp; ${receiptNo}</div>
  </div>

</div>
</div>`;

  openPrintWindow("In-House Payment Receipt", html);
};