The code consists of 3 main parts -
DBMgmt.js - The main switchboard of the program that handles all database access and communication between bartender and patron
index.html - The main page for ordering
bartender.html - The page for bartenders to manage orders

There are a couple other helper files
filename.sqlite - the database that stores the information - if the server is running you wont need to worry about this
orderstable.js - the initial file for the bartender portal
datatable.js - initial table for the DBMgmt.js file (may not be needed)

Requires NPM install (regular), mqtt, sql.js to run


To run, first, check http://107.170.38.244/
If everything is running properly, you can view index.html there. If a menu shows up everything is working, otherwise there is a problem, see below

For the bartender page
http://107.170.38.244/bartender.html

If something has crashed for some reason, open DBMgmt.js and run the file. You can then open index.html or bartender.html and they should work properly. 
Don't run DBMgmt.js if the server is running properly, as this may cause strange behavior, as there will be two copies of the file running at once
