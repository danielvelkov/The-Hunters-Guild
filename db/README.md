# Database

Because the game data is mostly static (it updates on every patch), a way to download the newest data is required:

- CURRENT: using the MH Wilds Spreadsheet by ax1os, which can be automated with google's app scripts..
  - the current problem is that some sheets have their columns hidden and must be expanded, but others have data that is not needed at all. A solution is to modify the gs file to download everything and then trim the tables.
- Option B: Use dblink to get the data from another source.
- Option C: some kind of monster hunter wilds api. The only one I know is not complete and does not have everything.

You can also do materialized views (which are basically tables) which optimize all the joins the app will potentially use. Example:

- all the monsters bonus rewards and probabilities
- all the monsters weaknesses
- all the monsters rewards for broken parts and probabilities
- etc.

There should be npm scripts for:

1. A way to recreate the database
1. A way to populate the database
   - obviously this requires the ax1os csv files at the moment
