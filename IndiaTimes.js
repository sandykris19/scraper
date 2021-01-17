const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const { Itimes } = require("./models/mainFirstPost");

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

const indiaTimes = (category, start, max) => {
  let url = "";
  switch (category) {
    case "india-business":
      url = `https://timesofindia.indiatimes.com/business/india-business/`;
      break;
    case "international-business":
      url =
        "https://timesofindia.indiatimes.com/business/international-business/";
      break;
    case "india":
      url = `https://timesofindia.indiatimes.com/india/`;
      break;
    case "world-us":
      url = `https://timesofindia.indiatimes.com/world/us/`;
      break;
    case "world-uk":
      url = `https://timesofindia.indiatimes.com/world/uk/`;
      break;
    case "world-china":
      url = `https://timesofindia.indiatimes.com/world/china/`;
      break;
    case "world-sea":
      url = `https://timesofindia.indiatimes.com/world/south-asia/`;
      break;
    case "sports-cricket":
      console.log("in cricket");
      url = `https://timesofindia.indiatimes.com/sports/cricket/`;
    default:
      break;
  }
  for (let no = start; no <= max; no++) {
    axios.get(`${url}${no}`).then((urlResponse) => {
      const $ = cheerio.load(urlResponse.data);
      let lists = $(".list5 > li > span").each((i, e) => {
        let foo = $(e).find("a").attr("href");
        axios
          .get(`https://timesofindia.indiatimes.com${foo}`)
          .then((r) => {
            const $ = cheerio.load(r.data);
            let title = $("._23498").text();
            let article = $(".ga-headlines").text();
            let date = $("._3Mkg-").text();
            let img = $("._2gIK-").find("img").attr("src");
            (async () => {
              await Itimes.create({
                title: title,
                article: article,
                publishedAt: date,
                img: img,
                category: category,
                link: `https://timesofindia.indiatimes.com${foo}`,
              });
            })();
          })
          .then(() => {
            console.log(`Done scraping ${count} articles`);
            count = count + 1;
          });
      });
    });
  }
};

let count2 = 1;
const indiaTimesSports = (category, start, max) => {
  let url = "";
  switch (category) {
    case "cricket":
      url = "https://timesofindia.indiatimes.com/sports/cricket/";
      break;
    case "football":
      url = "https://timesofindia.indiatimes.com/sports/football/";
      break;
    case "tennis":
      url = "https://timesofindia.indiatimes.com/sports/tennis/";
      break;
    default:
      break;
  }
  for (let no = start; no <= max; no++) {
    axios.get(`${url}${no}`).then((urlResponse) => {
      const $ = cheerio.load(urlResponse.data);
      let eachArticle = $(
        "#c_sport_wdt_1 > div.news-section.clearfix > div > div > ul > li"
      ).each((i, e) => {
        let newlinks = $(e).find("a").attr("href");
        axios
          .get(`https://timesofindia.indiatimes.com${newlinks}`)
          .then((r) => {
            const $ = cheerio.load(r.data);
            let title = $("._23498").text();
            let img = $("._2gIK-").find("img").attr("src");
            let date = $("._3Mkg-").text();
            let article = $(".ga-headlines").text();
            (async () => {
              await Itimes.create({
                title: title,
                img: img,
                publishedAt: date,
                article: article,
                link: `https://timesofindia.indiatimes.com${newlinks}`,
                category: `sports-${category}`,
              });
            })();
          })
          .then(() => {
            console.log(`Done scraping ${count2} articles`);
            count2 = count2 + 1;
          })
          .catch(() => console.log("moved or deleted link"));
      });
    });
  }
};

//---------------------------------------------//
//indiaTimes(category,start,max)
//Valid parameters for category "india" "india-business" "international-business" "world-us" "world-uk" "world-china" "world-sea"

//India times uses different page style for sports
//indiaTimesSports(category,start,max)
//Valid params are "cricket" "football" "tennis"

// start - which subpage to start, minimum 2
//max - max subpage to go, have to check manaully how many total subpages it has
// Each subpage has around 15-25 articles
// Ignore unhandled rejections they are most likely caused by moved or deleted links
//Due to read and write speed below i've only use 10 pages (which contains 15-25 articles from each page)
//Also run single category at a time if you are limited with write speed
//---------------------------------------------//


//======================================================//
//Upon running "node IndiaTimes.js" if it sits idle for than 20 sec after scraping use ctrl+c to force terminate and check local database
//======================================================//



indiaTimes("india", 2, 6);
// indiaTimes("india-business", 2, 6);
// indiaTimes("international-business", 2, 6);
// indiaTimes("world-us", 2, 6);
// indiaTimes("world-uk", 2, 6);
// indiaTimes("world-sea", 2, 6);
// indiaTimes("world-china", 2, 6);

// indiaTimesSports("cricket", 2, 4);
// indiaTimesSports("football", 2, 6);
// indiaTimesSports("tennis", 2, 6);


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//

// indiaTimes(category,start,max)
// after running above code change start and max and re-run
//like indiaTimes(category,7,14) > indiaTimes(category,15,22)
// and so on 

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//