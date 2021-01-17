const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const { Iexpress } = require("./models/mainFirstPost");

//--------------------------------------------//
//Make sure you have mongodb installed on your windows/mac
//if you have access to mongo instance on cloud connect via uri string
//--------------------------------------------//

mongoose
  .connect("mongodb://localhost:27017/webscraper", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to local mongo database"));

//---------------------------------------//
//Uncomment below code for storing scraped data on cloud

//---------------------------------------//

let count = 1;
// const dbURI =
//   "mongodb+srv://m001-student:m001-password@sandbox.yqnjh.mongodb.net/webscrap?retryWrites=true&w=majority";
// (async () => {
//   await mongoose
//     .connect(dbURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//     })
//     .then(() => {
//       console.log("Connected to DB");
//     });
// })();

const indianExpress = (category, start, max) => {
  for (let no = start; no <= max; no++) {
    axios
      .get(`https://indianexpress.com/section/${category}/page/${no}/`)
      .then((urlResponse) => {
        const $ = cheerio.load(urlResponse.data);
        let eachArticle = $(".articles").each((i, element) => {
          let newlinks = $(element).find("a").attr("href");
          axios
            .get(`${newlinks}`)
            .then((r) => {
              const $ = cheerio.load(r.data);
              let article = $("#pcl-full-content").text();
              let title = $(".heading-part").find("h1").text();
              let date = $(".editor").find("span").text();
              let img = $(".custom-caption").find("img").attr("src");
              (async () => {
                await Iexpress.create({
                  link: newlinks,
                  title: title.trim(),
                  publishedAt: date.trim(),
                  img: img,
                  article: article.trim(),
                  category: category,
                });
              })();
            })
            .then(() => {
              console.log(`Done scraping ${count} articles`);
              count = count + 1;
            })
            .catch(() => console.log("Error parsing"));
        });
      });
  }
};

//----------------------------------------//
//indiaExpress(category,start,max)
//valid parameters are "business", "sports", "india"(i.e news)
// start - which subpage to start, minimum 1
//max - max subpage to go, have to check manaully how many total subpages it has
// Each subpage has around 20-25 articles
// Ignore unhandled rejections they are most likely caused by moved or deleted links
//Due to read and write speed below i've only use 10 pages (which contains 20-25 articles from each page)
//Also run single category at a time if you are limited with write speed
//----------------------------------------//


//======================================================//
//Upon running "node IndianExpress.js" if it sits idle for than 20 sec after scraping use ctrl+c to force terminate and check local database
//======================================================//


indianExpress("business", 1, 10);
// indianExpress("sports", 1, 10);
// indianExpress("india", 1, 10);


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//

// indiaExpress(category,start,max)
// after running above code change start and max and re-run
//like indiaExpress(category,11,20) > indiaExpress(category,21,30)
// and so on 

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
