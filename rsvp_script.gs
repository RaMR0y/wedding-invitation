// Google Apps Script code to handle RSVP form submissions
function doPost(e) {
  // This part of the script handles CORS, allowing your website to talk to the script.
  if (e.postData.type === "application/json") {
    try {
      var doc = SpreadsheetApp.getActiveSpreadsheet();
      var sheetName = "RSVPs";
      var sheet = doc.getSheetByName(sheetName);

      // If the sheet doesn't exist, create it with headers.
      if (!sheet) {
        sheet = doc.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, 7).setValues([["Timestamp", "Name", "Email", "Attendance", "Guests", "Dietary", "Message"]]);
        // Freeze the header row
        sheet.setFrozenRows(1);
      }
      
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var nextRow = sheet.getLastRow() + 1;
      
      var data = JSON.parse(e.postData.contents);
      
      var newRow = headers.map(function(header) {
        var a = header.toLowerCase();
        if (a === 'timestamp') {
          return new Date();
        }
        return data[a] || ""; // Match form data to sheet headers
      });
      
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // This is for a different type of request, we can ignore it for now.
  return ContentService.createTextOutput("Unsupported content type");
} 