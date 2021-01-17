const cheerio = require("cheerio");
const axios = require("axios");
const { Mcontrol } = require("./models/mainFirstPost");
const mongoose = require("mongoose");

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

const moneycontrol = (category, start, max) => {
  if (category === "markets" || category === "mutual-funds") {
    url = `https://www.moneycontrol.com/news/business/${category}/page-`;
  } else if (category === "news") {
    url = `https://www.moneycontrol.com/news/news-all/page-`;
  }
  for (let no = start; no <= max; no++) {
    axios
      .get(`${url}${no}/`)
      .then((urlResponse) => {
        const $ = cheerio.load(urlResponse.data);
        let eachArticle = $("#cagetory > .clearfix").each((i, e) => {
          let foo = $(e).find("a").attr("href");
          axios
            .get(`${foo}`)
            .then((r) => {
              const $ = cheerio.load(r.data);
              let title = $(".article_title").text();
              let date = $(".article_schedule").find("span").text();
              let img =
                $(".article_image").find("img").attr("data-src") ?? "none";
              let article = $(".content_wrapper").text();
              (async () => {
                await Mcontrol.create({
                  title: title,
                  img: img,
                  publishedAt: date,
                  article: article.trim(),
                  category: category,
                  link: foo,
                });
              })();
            })
            .then(() => {
              console.log(`Done scraping ${count} articles`);
              count = count + 1;
            })
            .catch(() => console.log("moved or deleted link"));
        });
      })
      .catch(() => {
        console.log("Invalid URL");
      });
  }
};

//---------------------------------------------------//
//moneycontrol only allows certain requests from 1 ip address so use vpn
//moneycontrol(category, start, max
//Valid parameters for category "markets", "mutual-funds", "news"
// start - which subpage to start, minimum 1
//max - max subpage to go, have to check manaully how many total subpages it has
// Each subpage has around 20-25 articles
// Ignore unhandled rejections they are most likely caused by moved or deleted links
//Due to read and write speed below i've only use 10 pages (which contains 15-25 articles from each page)
//Also run single category at a time if you are limited with write speed
//----------------------------------------------//


//======================================================//
//Upon running "node MoneyControl.js" if it sits idle for than 20 sec after scraping use ctrl+c to force terminate and check local database
//======================================================//

moneycontrol("news", 1, 10);
// moneycontrol("markets", 1, 10);
// moneycontrol("mutual-funds", 1, 10);


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//

// moneycontrol(category,start,max)
// after running above code change start and max and re-run
//like moneycontrol(category,11,20) > moneycontrol(category,21,30)
// and so on 

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//