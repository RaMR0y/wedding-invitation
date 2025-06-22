// Google Apps Script code to handle RSVP form submissions
function doPost(e) {
  // This part of the script handles CORS, allowing your website to talk to the script.
  if (e.postData.type === "application/json") {
    try {
      var doc = SpreadsheetApp.getActiveSpreadsheet();
      var sheetName = "RSVPs";
      var sheet = doc.getSheetByName(sheetName);

      // If the sheet doesn't exist, create it with new headers.
      if (!sheet) {
        sheet = doc.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, 5).setValues([["Timestamp", "First Name", "Last Name", "Attendance", "Guests"]]);
        // Freeze the header row
        sheet.setFrozenRows(1);
      }
      
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var nextRow = sheet.getLastRow() + 1;
      
      var data = JSON.parse(e.postData.contents);
      
      var newRow = headers.map(function(header) {
        // convert header to lowercase and remove spaces to match form data keys
        var key = header.toLowerCase().replace(/ /g, '');
        if (key === 'timestamp') {
          return new Date();
        }
        return data[key] || ""; // Match form data to sheet headers
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