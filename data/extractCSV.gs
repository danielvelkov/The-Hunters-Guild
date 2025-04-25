/**
 * Scripts for getting icons
 * They timeout because 6 min is the max running time.
 * So run them multiple times to extract everything
 */
function saveImagesWithIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const requests = [];

  // Filter sheets that end with 'Icons' (case insensitive)
  const iconSheets = allSheets.filter((sheet) =>
    sheet.getName().toLowerCase().endsWith('icons')
  );

  if (iconSheets.length === 0) {
    SpreadsheetApp.getUi().alert('No sheets ending with "Icons" found!');
    return;
  }

  // Check if parent folder exists or create new
  const parentFolderName = `Exported Icons_${formatDate(new Date())}`;
  let parentFolder;
  const existingParentFolders = DriveApp.getFoldersByName(parentFolderName);
  if (existingParentFolders.hasNext()) {
    parentFolder = existingParentFolders.next();
    console.log(`Using existing parent folder: ${parentFolderName}`);
  } else {
    parentFolder = DriveApp.createFolder(parentFolderName);
    console.log(`Created new parent folder: ${parentFolderName}`);
  }

  // Process each icon sheet
  iconSheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    console.log(`Processing sheet: ${sheetName}`);

    // Check if sheet folder exists or create new
    let sheetFolder;
    const existingSheetFolders = parentFolder.getFoldersByName(sheetName);
    if (existingSheetFolders.hasNext()) {
      sheetFolder = existingSheetFolders.next();
      console.log(`Using existing folder for sheet: ${sheetName}`);
    } else {
      sheetFolder = parentFolder.createFolder(sheetName);
      console.log(`Created new folder for sheet: ${sheetName}`);
    }

    // Get all data in the sheet
    const data = sheet.getDataRange().getValues();
    let idColIndex = '0';

    // Process each row
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        console.log(data[i]);
        data[i].forEach((c, ind) => {
          if (c.toString() === 'ID') idColIndex = ind;
        });
      }
      const id = data[i][idColIndex]; // First column is ID
      const cell = sheet.getRange(i + 1, idColIndex + 2); // Column afterwards is image
      const image = cell.getValue();

      // Skip if no ID or no image
      if (!id || !image) continue;

      // Check if this run has an image
      if (image.getContentUrl) {
        // Check if file already exists
        let fileExistsAlready = false;
        const existingFiles = sheetFolder.getFiles();

        while (existingFiles.hasNext()) {
          const file = existingFiles.next();

          if (file.getName().includes(id)) fileExistsAlready = true;
        }

        if (fileExistsAlready) {
          console.log(`Skipping existing file: ${sheetName}/${id}`);
          continue;
        }

        // This is an image inserted via =IMAGE() function
        const imageUrl = image.getContentUrl();

        requests.push({ id, url: imageUrl, sheetFolder });
      }
    }
  });

  /**
   * Because you cant issue a ton of requests at once, you have to do it in chunks.
   */
  const chunkSize = 100;
  // Iterate through each chunk of requests
  for (let i = 0; i < requests.length; i += chunkSize) {
    // Get the next subset of requests
    const chunk = requests.slice(i, i + chunkSize);

    // Get the response data from the subset of requests
    const responses = UrlFetchApp.fetchAll(chunk.map((item) => item.url));
    const results = chunk.map((request, index) => {
      try {
        const response = responses[index];
        const id = request.id;
        const sheetFolder = request.sheetFolder;
        return {
          value: response,
          id,
          sheetFolder,
          rowIndex: request.rowIndex,
          success: true,
        };
      } catch (e) {
        return {
          originalValue: request.originalValue,
          error: `Error: ${e.message}`,
          rowIndex: request.rowIndex,
          success: false,
        };
      }
    });

    results.forEach((result) => {
      // Download and save the image
      try {
        if (!result.success) throw Error(result.error);
        const blob = result.value.getBlob();
        result.sheetFolder
          .createFile(blob)
          .setName(`${result.id}.${blob.getContentType().split('/')[1]}`);
        console.log(`Saved image for ID: ${result.id}`);
      } catch (e) {
        console.error(`Failed to save image for ID ${result.id}: ${e}`);
      }
    });

    // Sleep for 1 second before making another call to fetchAll
    Utilities.sleep(1000);
  }

  console.log('Image export completed!');

  // Helper function to format date for folder name
  function formatDate(date) {
    return Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }
}

function downloadCSVOnlyVisible() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Get the full data range
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const numCols = dataRange.getNumColumns();
  const headers = values[0];

  // Create array to track visible columns (1-indexed in Sheets API)
  const visibleCols = [];
  for (let i = 1; i <= numCols; i++) {
    if (!sheet.isColumnHiddenByUser(i)) {
      visibleCols.push(i - 1); // Store 0-indexed for array access
    }
  }

  // Process headers to handle empty ones (inherit previous non-empty header name)
  let lastNonEmptyHeader = '';
  const processedHeaders = headers.map((header, index) => {
    if (header && header.toString().trim() !== '') {
      lastNonEmptyHeader = header;
      return header;
    } else {
      return lastNonEmptyHeader; // Empty header inherits last non-empty header
    }
  });

  // Replace first row with processed headers
  const processedValues = [...values];
  processedValues[0] = processedHeaders;

  // Create a map to remove duplicate headers (keeping first occurrence)
  const headerMap = new Map();
  visibleCols.forEach((colIdx) => {
    const headerName = processedHeaders[colIdx];
    if (!headerMap.has(headerName) || headerName === '') {
      headerMap.set(headerName, colIdx);
    }
  });

  // Get unique columns to include (removes duplicates)
  const uniqueCols = Array.from(headerMap.values());

  // Build CSV with only visible unique columns
  const visibleData = processedValues
    .map((row) => {
      return uniqueCols
        .map((colIdx) => {
          const cellValue = row[colIdx];
          // Format cell values properly for CSV
          if (cellValue === null || cellValue === undefined) {
            return '';
          } else if (typeof cellValue === 'string') {
            return `"${cellValue.replace(/"/g, '""')}"`;
          } else {
            return cellValue;
          }
        })
        .join(',');
    })
    .join('\n');

  // Create and offer the download
  const blob = Utilities.newBlob(visibleData, 'text/csv');
  const infoHtml = {
    data: `data:text/csv;base64,` + Utilities.base64Encode(blob.getBytes()),
    filename: `${sheet.getSheetName()}.csv`,
  };

  const html = HtmlService.createHtmlOutput(
    `<a href="${infoHtml.data}" download="${infoHtml.filename}">${infoHtml.filename}</a>`
  )
    .setWidth(420)
    .setHeight(100);
  SpreadsheetApp.getUi().showModalDialog(html, 'Download your file ...');
}

function downloadAllSheetsCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();

  // Filter sheets that end with 'Icons' (case insensitive)
  const iconSheets = allSheets
    .filter((sheet) => sheet.getName().toLowerCase().endsWith('icons'))
    .map((sheet) => sheet.getName());

  // List of sheet names to include (without .csv extension)
  let allowedSheetNames = [
    'Monsters', // Monster ids and Names, Locale, Weakness, Base health, Special attacks
    'Locales', // Places in the world

    // Regarding monster part resistances
    'Monster Parts', // unique parts. each monster has atleast one of those parts
    'Monster Meat Array', // each monster with all its part with resistances
    'Monster Parts Array', // basically the relationship between the last two sheets
    'Monster Ailment Resistances', // status effectiveness in STARS

    // Regarding monster item drops
    'Monster Drops', // Reward Type, Item ID, Monster Ids, Part Index, Prob and Count
    'Items', // every item with name, desc, type , rarity , icon ID etc
    'Monster Parts Break Array', // contains the part name and the index

    // Armor Related
    'Armour', // every armor item with res and skills
    'Armour Recipes', // every armor item and how to craft it

    // Weapon Related
    'Weapon Types', // unique weapon types, names, and dmg multiplier
    'Melee Weapons', // huge one, weapon id, name, weapon tree, price, type, rarity, attack, raw attack, affinity, element, element attack, defence, slot size (for 1,2,3), weapon specific stuff like shelling, notes etc
    'Ranged Weapons', // same as melee but for ranged
    'Sharpness', // for raw dmg multiplier to calculate actual damage for a given sharpness

    // Weapon recipes
    'Great Sword Recipes',
    'Sword & Shield Recipes',
    'Dual Blades Recipes',
    'Long Sword Recipes',
    'Hammer Recipes',
    'Hunting Horn Recipes',
    'Lance Recipes',
    'Gunlance Recipes',
    'Switch Axe Recipes',
    'Charge Blade Recipes',
    'Insect Glaive Recipes',
    'Bow Recipes',
    'Heavy Bowgun Recipes',
    'Light Bowgun Recipes',

    // Amulet related
    'Amulets Raw', // every amulet with name, desc, rarity skill and skill level
    'Amulets Recipes Raw', // how to craft each amulet, at which rank appears

    // Decoration related
    'Decorations', // every decoration name, type weapon/equipment, rarity, skill 1/ skill 2 names and level

    // gameplay related
    'Skills', // every skill name, description, IconID, Description for each level up to lv7
    'Monster Special Attacks', // description of what the monster attack does
    // Have not seen a use for the rn, but could use them later
    /**
     *  'Hunting Horn Type', // hh types with each note combination, each note color melodies list, its basically displayed in melee weapons
     * 'Ingredients',
     *    // Regarding rewards
    // Main Assignments rewards
    // 'QuestRewardSetting.user',

    // Bonus, Event rewards, Jewels, Artisan Parts
    // 'CommonRewardData.user',
    // 'ExQuestRewardSetting.user Raw' shows some kind of distribution for orbs, artisan parts
     *  'ArtianWeaponType.user Raw',
     *  'Bowgun Mods',
     * 'Bow Coatings', // both of these are also in ranged weapons
     * 'Bowgun Ammo Types',
     */
  ];

  allowedSheetNames = allowedSheetNames.concat(iconSheets);

  // Create an array to store all CSV blobs
  const blobs = [];

  // Process each sheet
  for (let i = 0; i < allSheets.length; i++) {
    const sheet = allSheets[i];
    const sheetName = sheet.getSheetName();

    // Check if this sheet should be included
    if (!allowedSheetNames.includes(sheetName)) {
      continue;
    }

    // Get data from this sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // Skip empty sheets
    if (values.length === 0 || values[0].length === 0) {
      continue;
    }

    const numCols = dataRange.getNumColumns();
    const headers = values[0];

    // Track visible columns
    const visibleCols = [];
    for (let j = 1; j <= numCols; j++) {
      if (!sheet.isColumnHiddenByUser(j)) {
        visibleCols.push(j - 1);
      }
    }

    // Process headers to handle empty ones
    let lastNonEmptyHeader = '';
    const processedHeaders = headers.map((header) => {
      if (header && header.toString().trim() !== '') {
        lastNonEmptyHeader = header;
        return header;
      } else {
        return lastNonEmptyHeader;
      }
    });

    // Replace first row with processed headers
    const processedValues = [...values];
    processedValues[0] = processedHeaders;

    // Create a map to remove duplicate headers
    const headerMap = new Map();
    visibleCols.forEach((colIdx) => {
      const headerName = processedHeaders[colIdx];
      if (!headerMap.has(headerName) || headerName === '') {
        headerMap.set(headerName, colIdx);
      }
    });

    // Get unique columns to include
    const uniqueCols = Array.from(headerMap.values());

    // Build CSV for this sheet
    const visibleData = processedValues
      .map((row) => {
        return uniqueCols
          .map((colIdx) => {
            const cellValue = row[colIdx];
            if (cellValue === null || cellValue === undefined) {
              return '';
            } else if (typeof cellValue === 'string') {
              return `"${cellValue.replace(/"/g, '""')}"`;
            } else {
              return cellValue;
            }
          })
          .join(',');
      })
      .join('\n');

    // Add this sheet as a blob
    blobs.push(Utilities.newBlob(visibleData, 'text/csv', `${sheetName}.csv`));
  }

  // If no valid sheets found
  if (blobs.length === 0) {
    SpreadsheetApp.getUi().alert('No matching sheets found to export');
    return;
  }

  // Create a folder in Google Drive
  const folder = DriveApp.createFolder(
    `Spreadsheet Export - ${ss.getName()} - ${new Date().toLocaleString()}`
  );

  // Save all the CSV files to the folder
  blobs.forEach((blob) => {
    folder.createFile(blob);
  });

  // Alert user where files were saved
  const folderUrl = folder.getUrl();
  const alertMessage = `${blobs.length} sheets have been exported as CSV files to a folder in your Google Drive.\n\nFolder URL: ${folderUrl}`;

  SpreadsheetApp.getUi().alert(
    'Export Complete',
    alertMessage,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
/**
 * My added scripts for exporting
 * the tables in csv. Line 93 specifies which sheets to download
 */

// have Sheets API and Drive API added as services
// the options appears inside the toolbar menu

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⇩ M E N U ⇩')
    .addItem('👉 Download file ...', 'downloadCSVOnlyVisible')
    .addItem('👉 Download All Sheets ...', 'downloadAllSheetsCSV')
    .addItem('📷 Download Sheets Images ...', 'saveImagesWithIds')
    .addToUi();
}
