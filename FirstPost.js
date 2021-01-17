const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const { Main } = require("./models/mainFirstPost");

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

const firstpost = (category, start, max) => {
  for (let no = start; no <= max; no++) {
    axios
      .get(`https://www.firstpost.com/category/${category}/page/${no}`)
      .then((urlResponse) => {
        const $ = cheerio.load(urlResponse.data);
        let eachArticle = $(".big-thumb").each((i, element) => {
          let newlinks = $(element).find("a").attr("href");
          axios
            .get(`${newlinks}`)
            .then((r) => {
              const $ = cheerio.load(r.data);
              let article =
                $(".article-full-content").text() ?? "article not found";
              let title = $("#headlineitem").html() ?? "title not found";
              let date = $(".author-info:last").find("span").text();
              let img = $(".article-img").find("img").attr("data-src");
              (async () => {
                await Main.create({
                  title: title,
                  article: article,
                  link: newlinks,
                  publishedAt: date,
                  category: category,
                  img: `https:${img}`,
                });
              })();
            })
            .then(() => {
              console.log(`Done scraping ${count}`);
              count = count + 1;
            })
            .catch(() => console.log("Error"));
        });
      });
  }
};

//------------------------------------------//
//firstpost(category, start, max)
//Valid parameters for category "business", "sports", "india" (i.e news)
// start - which subpage to start, minimum 1
//max - max subpage to go, have to check manaully how many total subpages it has
// Each subpage has around 20-25 articles
// Ignore unhandled rejections they are most likely caused by moved or deleted links
//Due to read and write speed below i've only use 10 pages (which contains 15-25 articles from each page)
//Also run single category at a time if you are limited with write speed
//----------------------------------------------//

//======================================================//
//Upon running "node FirstPost.js" if it sits idle for than 20 sec after scraping use ctrl+c to force terminate terminal and check local database
//======================================================//

firstpost("business", 1, 10);
// firstpost("india", 1, 10);
// firstpost("sports", 1, 7);



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//

// firstpost(category,start,max)
// after running above code change start and max and re-run
//like firstpost(category,11,20) > firstpost(category,21,30)
// and so on

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
