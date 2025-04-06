# Wilds data - CSV + Icons

Parts of the monster hunter wilds data that could be used for an app like this.
Taken from [here](https://docs.google.com/spreadsheets/d/178o8U97P2cpb0RZbZBvGIoX4bPhUm_lPczg6elfIj9s/edit?usp=sharing).

Credits to the owner(?): <alxnns1@gmail.com>

Could not think of a way to import them more cleanly. So...

## The CSV extractor

Here is my [hacky, hardcoded google script](extractCSV.gs) that only extracts what you see as CSV.
You can download the current sheet or download all of those specified, to your parent GDrive folder.
Change 'allowedSheets' variable in the .gs code to add/remove certain sheets.
Add it through docs.google.com/spreadsheets/[SPREADSHEET] => Extensions => Apps Script
Run after saving for it to display in the spreadsheet. Options are inside 'M E N U' in the toolbar.

## Icon extractor

Export all icons with their ID from sheets ending in 'icons'. Is part of the scripts options in 'M E N U'.
