//========================================================================
// CONFIG
//========================================================================
const SPREADSHEET_ID = '1Jb9KRBDcyIkLo5yWEYlIkB1_L6kQIPD615YVumvbmRM';  // ✅ Replace with your actual Spreadsheet ID

//========================================================================
// PUBLIC ENTRY POINTS
//========================================================================
function doGet(e) {
  return jsonResponse({ result: 'ok' });
}

function doPost(e) {
  try {
    Logger.log('doPost payload → %s', JSON.stringify(e.postData));

    // 1) Validate content type
    const ct = e.postData.type || e.postData.mimeType;
    if (!ct || !/application\/json/.test(ct)) {
      return jsonResponse({ result: 'error', error: 'Content-Type must be application/json' });
    }

    // 2) Parse JSON
    const data = JSON.parse(e.postData.contents);

    // Ensure fallback value for optional fields
    data.guests = data.guests || '0';

    // 3) Open sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('RSVPs');
    if (!sheet) {
      sheet = createRSVPSheet(ss);
    }

    // 4) Match headers to data
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(hdr => {
      const key = hdr.toLowerCase().replace(/\s+/g, '');
      if (key === 'timestamp') return new Date();
      return data[key] != null ? data[key] : '';
    });

    sheet.appendRow(newRow);

    // 5) Return success
    return jsonResponse({ result: 'success', row: sheet.getLastRow() });

  } catch (err) {
    Logger.log('Error → %s', err.toString());
    return jsonResponse({ result: 'error', error: err.message });
  }
}

//========================================================================
// HELPERS
//========================================================================
function createRSVPSheet(ss) {
  const sh = ss.insertSheet('RSVPs');
  sh.getRange(1, 1, 1, 5).setValues([
    ['Timestamp', 'First Name', 'Last Name', 'Attendance', 'Guests']
  ]);
  sh.setFrozenRows(1);
  return sh;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
