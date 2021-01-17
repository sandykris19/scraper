install mongodb, npm, node

open terminal from webscraper folder and run

step 1: npm install (this will install all dependencies required)

step 2: node filename.js (eg - firstPost.js,indiaTimes.js,indianExpress.js,moneyControl.js)

To view files:

Step 1: open terminal and run C:\user> mongo 
(On successful exection it will open mongo shell)

Step 2: switch to database by running >use webscraper

Step 3: show collections

step 4: fb.collectionName.findOne({}),
"db.firstposts.findOne({})" to get sample

or 

"db.collectionName.find({}).count()" to get count of all articles

or 

Use this rest api

- I've created scraped data on cloud and created a rest api and hosted it on heroku cloud.
- Please wait atleast 10 sec to view site, as i hosted it on heroku free tier it puts app to sleep.

https://webscraperr.herokuapp.com/





Common Errors:
Scraping only 10 pages on single run in one category will be optimal if you have low write speed
Also reduce no of pages if you are scraping more than 250 articles on single run
Also,if you make more than 2000 requests on single run most websites will block your 
