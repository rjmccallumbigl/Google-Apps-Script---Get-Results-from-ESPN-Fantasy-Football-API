
/****************************************************************************************************************************************
*
* Return Fantasy Football stats from https://fantasy.espn.com/football/leaders?leagueId=1707014.
*
 * https://github.com/rjmccallumbigl/Google-Apps-Script---Get-Results-from-ESPN-Fantasy-Football-API
*
* References
* https://old.reddit.com/r/sheets/comments/z3140z/is_there_a_way_to_scrape_this_link_to_google/
*
****************************************************************************************************************************************/

function returnFFStats() {

// Declare variables
var playerArray = [];
  var queryResponse = UrlFetchApp.fetch("https://fantasy.espn.com/apis/v3/games/ffl/seasons/2022/segments/0/leagues/1707014?view=kona_player_info", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9",
      "if-none-match": "W/\"09da97426078ae160bcc0aa37bfd51dda\"",
      "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-fantasy-filter": "{\"players\":{\"filterSlotIds\":{\"value\":[0,7,2,23,4,6]},\"filterStatsForCurrentSeasonScoringPeriodId\":{\"value\":[12]},\"sortAppliedStatTotal\":null,\"sortAppliedStatTotalForScoringPeriodId\":{\"sortAsc\":false,\"sortPriority\":2,\"value\":12},\"sortStatId\":null,\"sortStatIdForScoringPeriodId\":null,\"sortPercOwned\":{\"sortPriority\":3,\"sortAsc\":false},\"filterRanksForSlotIds\":{\"value\":[0,2,4,6,17,16]}}}",
      "x-fantasy-platform": "kona-PROD-c5a4b52a3bbc4ae2e97584929001cb32b02b9371",
      "x-fantasy-source": "kona"
    },
    "referrer": "https://fantasy.espn.com/football/leaders?leagueId=1707014",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  });

  var queryResponseText = queryResponse.getContentText();
  var queryResponseTextJSON = JSON.parse(queryResponseText);
  for (athlete of queryResponseTextJSON.players){
    var playerStats = athlete.player;
    delete athlete.player;
    playerArray.push(Object.assign(playerStats, athlete));
  }
  setArraySheet(playerArray, "PlayerSheet", SpreadsheetApp.getActiveSpreadsheet());
  debugger;
}

/******************************************************************************************************
 * 
 * Convert array into sheet.
 * 
 * @param {Array} array The array that we need to map to a sheet
 * @param {String} sheetName The name of the sheet the array is being mapped to
 * @param {Object} spreadsheet The source spreadsheet
 * @param {String} param The name of the parameter we need for the returned API object, optional
 * @param {String} ogColHeader The name of the column header getting replaced for readability, optional
 * @param {String} replacementColHeader The new name of the replaced column header, optional
 * 
 ******************************************************************************************************/

function setArraySheet(array, sheetName, spreadsheet, param, ogColHeader, replacementColHeader) {

  // Declare variables
  var spreadsheet = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  var keyArray = [];
  var memberArray = [];
  var sheetRange = "";
  var index = -1;
  var ogColHeader = ogColHeader || "";
  var replacementColHeader = replacementColHeader || "";

  // Define an array of all the returned object's keys to act as the Header Row
  keyArray.length = 0;
  if (param) {
    keyArray = Object.keys(array[0]).concat("draftRanksByRankType").concat("outlooks").concat("ownership").concat("rankings").concat("stats").concat("ratings");

    index = keyArray.indexOf(ogColHeader);

    if (index !== -1) {
      keyArray[index] = replacementColHeader;
    }

  }
  else {
    keyArray = Object.keys(array[0]);
  }
  memberArray.length = 0;
  memberArray.push(keyArray);

  //  Capture members from returned data
  for (var x = 0; x < array.length; x++) {
    memberArray.push(keyArray.map(function (key) {
      if (key == replacementColHeader) {
        return array[x][ogColHeader][param];
      } else {
        return array[x][key];
      }
    }));
  }

  // Select or create the sheet
  try {
    sheet = spreadsheet.insertSheet(sheetName);
  } catch (e) {
    sheet = spreadsheet.getSheetByName(sheetName).clear();
  }

  // Set values  
  sheetRange = sheet.getRange(1, 1, memberArray.length, memberArray[0].length);
  sheetRange.setValues(memberArray);
}
