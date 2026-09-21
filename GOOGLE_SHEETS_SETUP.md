# How to Automatically Save Form Registrations into Google Sheets

This guide explains how to store form submissions from your live Vercel website directly into your own **Google Sheet** for free in under 3 minutes using **Google Apps Script**.

---

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name the sheet: **Racine Clicks Workshop Registrations**.
3. In **Row 1**, set up the following column headers (one per column from A to P):

| Column | Header Name |
| :--- | :--- |
| **A** | Timestamp |
| **B** | Registration ID |
| **C** | Payment ID |
| **D** | UPI Ref / UTR |
| **E** | Full Name |
| **F** | WhatsApp Number |
| **G** | Email |
| **H** | City / Location |
| **I** | Photo Studio Name |
| **J** | Photography Experience |
| **K** | Role |
| **L** | Photoshop Experience |
| **M** | Design Albums |
| **N** | Referral Source |
| **O** | Amount Paid |
| **P** | Status |

---

## Step 2: Add Google Apps Script

1. In the Google Sheet menu bar, click **Extensions** > **Apps Script**.
2. Delete whatever code is inside `Code.gs`.
3. Paste the following script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Append a new row with the registration details
    sheet.appendRow([
      data.timestamp || new Date(),
      data.registrationId || '',
      data.paymentId || '',
      "'" + (data.upiUtr || 'Paid via UPI QR'),
      data.fullName || '',
      "'" + (data.mobileNumber || ''), // Prefix with quote to preserve leading zero
      data.email || '',
      data.cityLocation || '',
      data.studioName || '',
      data.photographyExp || '',
      data.role || '',
      data.photoshopExp || '',
      data.designAlbums || '',
      data.referralSource || '',
      data.amountPaid || '₹249',
      data.status || 'SUCCESS'
    ]);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
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
