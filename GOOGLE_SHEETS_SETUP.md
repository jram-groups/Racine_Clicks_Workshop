# How to Automatically Save Form Registrations into Google Sheets

This guide explains how to store form submissions from your live Vercel website directly into your own **Google Sheet** for free in under 3 minutes using **Google Apps Script**.

---

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name the sheet: **Racine Clicks Workshop Registrations**.
3. In **Row 1**, set up your column headers in the exact order of the registration form:

| Column | Header Name | Matches Field |
| :--- | :--- | :--- |
| **A** | Full Name | 01. Full Name |
| **B** | WhatsApp Number | 02. WhatsApp Number |
| **C** | Email Address | 03. Email Address |
| **D** | City / Location | 04. Location / City |
| **E** | Photo Studio Name | 05. Photo Studio Name |
| **F** | Photography Experience | 06. Photography Experience |
| **G** | Role | 07. Role |
| **H** | Photoshop Experience | 08. Photoshop Experience |
| **I** | Design Albums | 09. Do you design albums? |
| **J** | Referral Source | 10. Where did you find us? |
| **K** | UPI Ref / UTR | Payment UTR Reference |
| **L** | Amount Paid | ₹249 |
| **M** | Payment Status | PAID / PENDING |
| **N** | Registration ID | e.g. RC-WAW-XXXX |
| **O** | Timestamp | Date & Time Submitted |

> 💡 **Smart Script**: The script below **automatically detects your column headers** in Row 1. Even if your columns are in a different order or you rearrange them, the data will always land under the correct matching header!

---

## Step 2: Add Google Apps Script

1. In the Google Sheet menu bar, click **Extensions** > **Apps Script**.
2. Delete whatever code is inside `Code.gs`.
3. Paste the following smart script:

```javascript
// Handles GET requests (checks status & returns current sheet headers)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss ? (ss.getActiveSheet() || ss.getSheets()[0]) : null;
    if (sheet) {
      var lastCol = sheet.getLastColumn() || 1;
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      return ContentService.createTextOutput(JSON.stringify({
        status: "active",
        headers: headers
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {}
  return ContentService.createTextOutput("✅ Racine Clicks Registration Webhook is active and running!")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Handles POST requests - Smart Column Mapping based on Row 1 Headers
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss ? (ss.getActiveSheet() || ss.getSheets()[0]) : null;
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: 'Spreadsheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Read headers from Row 1
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) lastCol = 1;
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Dynamically map each column by its header name
    var row = [];
    for (var i = 0; i < headers.length; i++) {
      var h = (headers[i] || '').toString().toLowerCase().trim();

      if (h.indexOf('name') !== -1 && h.indexOf('studio') === -1) {
        row.push(data.fullName || '');
      } else if (h.indexOf('mobile') !== -1 || h.indexOf('phone') !== -1 || h.indexOf('whatsapp') !== -1) {
        row.push("'" + (data.mobileNumber || ''));
      } else if (h.indexOf('email') !== -1) {
        row.push(data.email || '');
      } else if (h.indexOf('city') !== -1 || h.indexOf('location') !== -1) {
        row.push(data.cityLocation || '');
      } else if (h.indexOf('studio') !== -1) {
        row.push(data.studioName || 'N/A');
      } else if (h.indexOf('photo') !== -1 && (h.indexOf('exp') !== -1 || h.indexOf('graphy') !== -1) && h.indexOf('shop') === -1) {
        row.push(data.photographyExp || '');
      } else if (h.indexOf('role') !== -1 || h.indexOf('profession') !== -1) {
        row.push(data.role || '');
      } else if (h.indexOf('photoshop') !== -1) {
        row.push(data.photoshopExp || '');
      } else if (h.indexOf('album') !== -1) {
        row.push(data.designAlbums || '');
      } else if (h.indexOf('referral') !== -1 || h.indexOf('source') !== -1 || h.indexOf('find') !== -1) {
        row.push(data.referralSource || '');
      } else if (h.indexOf('utr') !== -1 || h.indexOf('upi') !== -1 || h.indexOf('ref') !== -1) {
        row.push("'" + (data.upiUtr || 'Paid via UPI QR'));
      } else if (h.indexOf('reg') !== -1) {
        row.push(data.registrationId || '');
      } else if (h.indexOf('amount') !== -1 || h.indexOf('fee') !== -1 || h.indexOf('price') !== -1) {
        row.push(data.amountPaid || '₹249');
      } else if (h.indexOf('status') !== -1) {
        row.push(data.status || 'PENDING_PAYMENT');
      } else if (h.indexOf('time') !== -1 || h.indexOf('date') !== -1) {
        row.push(data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
      } else if (h.indexOf('payment') !== -1) {
        row.push(data.paymentId || '');
      } else {
        row.push('');
      }
    }

    // Default fallback row if headers row was empty
    if (row.length === 0 || row.every(function(val) { return val === ''; })) {
      row = [
        data.fullName || '',
        "'" + (data.mobileNumber || ''),
        data.email || '',
        data.cityLocation || '',
        data.studioName || '',
        data.photographyExp || '',
        data.role || '',
        data.photoshopExp || '',
        data.designAlbums || '',
        data.referralSource || '',
        "'" + (data.upiUtr || 'Paid via UPI QR'),
        data.amountPaid || '₹249',
        data.status || 'PENDING_PAYMENT',
        data.registrationId || '',
        data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      ];
    }

    // Check if Registration ID already exists to prevent duplicate entries
    var regColIdx = -1;
    var utrColIdx = -1;
    var statusColIdx = -1;
    for (var k = 0; k < headers.length; k++) {
      var colName = (headers[k] || '').toString().toLowerCase();
      if (colName.indexOf('reg') !== -1) regColIdx = k + 1;
      if (colName.indexOf('utr') !== -1 || colName.indexOf('upi') !== -1 || colName.indexOf('ref') !== -1) utrColIdx = k + 1;
      if (colName.indexOf('status') !== -1) statusColIdx = k + 1;
    }

    if (regColIdx !== -1 && data.registrationId && sheet.getLastRow() > 1) {
      var existingRegIds = sheet.getRange(2, regColIdx, sheet.getLastRow() - 1, 1).getValues();
      for (var r = 0; r < existingRegIds.length; r++) {
        if (existingRegIds[r][0] == data.registrationId) {
          var targetRow = r + 2;
          if (utrColIdx !== -1 && data.upiUtr) {
            sheet.getRange(targetRow, utrColIdx).setValue("'" + data.upiUtr);
          }
          if (statusColIdx !== -1 && data.status) {
            sheet.getRange(targetRow, statusColIdx).setValue(data.status);
          }
          return ContentService.createTextOutput(JSON.stringify({ result: 'success', action: 'updated' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success', action: 'created' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click the **Save** icon (💾).

---

## Step 3: Deploy as Web App

1. Click the blue **Deploy** button in the top right > select **New deployment**.
2. Next to *Select type*, click the **gear icon (⚙️)** > select **Web app**.
3. Fill in the fields:
   - **Description**: `Racine Clicks Registration Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **`Anyone`** *(Important: Must be "Anyone" so Vercel can submit to it)*
4. Click **Deploy**.
5. Google will ask you to *Authorize access*:
   - Click **Authorize access**
   - Select your Google account
   - Click **Advanced** > **Go to Untitled project (unsafe)**
   - Click **Allow**
6. Copy the **Web App URL** (it will look like: `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## Step 4: Paste URL in `js/app.js`

1. Open `js/app.js` in your project.
2. Find line 35:
   ```javascript
   const GOOGLE_SHEET_WEBAPP_URL = '';
   ```
3. Paste your Web App URL between the quotes:
   ```javascript
   const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. Commit and push to Git (or redeploy to Vercel).

Now, whenever a participant completes their registration on your live site, all their information will automatically appear as a new row in your Google Sheet!

---

## ⚠️ Troubleshooting: "Sorry, unable to open the file at present"

If Google Drive or Apps Script displays:
> **"Sorry, unable to open the file at present. Please check the address and try again."**

This is a well-known Google Drive multi-account session conflict. Here is how to fix it immediately:

1. **Option A (Fastest Fix — Incognito Window)**:
   - Open an **Incognito / Private Window** in your browser (`Ctrl + Shift + N` on Windows/Chrome).
   - Log into **only one Google account** (the account you want to use for the workshop sheet).
   - Open [sheets.new](https://sheets.new) or open your spreadsheet.
   - Go to **Extensions > Apps Script** and deploy. It will work smoothly without any session conflicts.

2. **Option B (Multi-Account Switch)**:
   - In your browser, click your Google profile photo in the top right.
   - Make sure you are switched to the primary account that owns the spreadsheet.
   - If you have multiple Google accounts logged in, Google tries to load the file using your default `/u/0/` account instead of the account that created the sheet.

3. **Option C (Deployment Access)**:
   - When deploying the Apps Script Web App, ensure:
     - **Execute as**: `Me`
     - **Who has access**: `Anyone` (NOT "Only myself").

