const express = require('express');
const axios = require('axios');
const puppeteer = require("puppeteer");
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Route to fetch data from Incredible India
app.get('/api/inc-home', async (req, res) => {
  try {
    const response = await axios.get('https://www.incredibleindia.gov.in/en');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching Incredible India page:', error);
    res.status(500).send('Error fetching Incredible India page');
  }
});

app.get('/api/inc-city/:state/:city?/:place', async (req, res) => {
  try {
    const { state, city, place } = req.params;

    let url;
    if (city) {
      url = `https://www.incredibleindia.gov.in/en/${state}/${city}/${place}`;
    } else {
      url = `https://www.incredibleindia.gov.in/en/${state}/${place}`;
    }

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const baseUrl = 'https://www.incredibleindia.gov.in'; // Base URL of the website

    const inc_city_hero_banner_text = [];
    $('div.inc-city-hero-banner-text').each((index, element) => {

      const headingText = $(element).find('h3').text();
      const paragraphText = $(element).find('h2').text();

      inc_city_hero_banner_text.push(paragraphText, headingText);

    })

    const inc_city_hero_banner_imageUrls = [];
    $('img.inc-city-hero-banner-img').each((index, element) => {
      let imgUrl = $(element).attr('src');
      if (imgUrl) {
        // Convert relative URLs to absolute URLs
        if (!imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
          imgUrl = new URL(imgUrl, baseUrl).href;
        }
        inc_city_hero_banner_imageUrls.push(imgUrl);
      }
    });

    var inc_city_map = []

    $('div#city-map').each((index, element) => {
      inc_city_map.push($(element).attr('data-citymap'));
    });

    var inc_city_transportation_arr = []
    try {
      $('div.list-content-wrap div.data-list').each((index, element) => {
        $(element).find('h4').each((h4Index, h4Element) => {
          const headingText = $(h4Element).text(); // Get the current h4 text
          const paragraphs = []; // Initialize an array to collect p data for this h4
          $(element).find('p').slice(h4Index * 2, (h4Index + 1) * 2).each((pIndex, pElement) => {
            paragraphs.push($(pElement).text()); // Collect all associated p text
          });
          inc_city_transportation_arr.push({ [headingText]: paragraphs }); // Push the h4 and its paragraphs as an object
        });
      });
    } catch {

    }


    var inc_city_map_weather_arr = []

    try {
      $('div.inc-monthly__content').each((index, element) => {
        const paragraphText = $(element).find('p').text();
        const headingText = $(element).find('h3').text();
        inc_city_map_weather_arr.push(
          { [paragraphText]: headingText }
        );
      })
    } catch {

    }

    var inc_content_paras_arr = []
    $('div.inc-tilemap__right').each((index, element) => {
      const paragraphText = $(element).find('p').text();
      const headingText = $(element).find('h2').text();
      inc_content_paras_arr.push(
        { [headingText]: paragraphText }
      );

    });
    try {
      $('div.inc-container__content').each((index, element) => {
        $(element).find('h4').each((h4Index, h4Element) => {
          const headingText = $(h4Element).text();
          const paragraphText = $(element).find('p').eq(h4Index).text();
          inc_content_paras_arr.push({ [headingText]: paragraphText });
        });
      });

    } catch {

    }

    var inc_city_experiences = []
    try {
      $('div.inc-experience-v1 div.card').each((index, element) => {
        const text = $(element).find('p').text();
        const image = $(element).find('img').attr('src');
        const Url = $(element).find('a').attr('href');

        inc_city_experiences.push({
          'text': text,
          'image': image,
          'URL': Url
        });
      })
    } catch {

    }
    var inc_city_nearby = []
    try {
      $('div.explore-other-dest div.card').each((index, element) => {
        const name = $(element).find('h4').text();
        const image = $(element).find('img').attr('src');
        const Url = $(element).find('a').attr('href');

        inc_city_nearby.push({
          'name': name,
          'image': image,
          'URL': Url
        });
      })
    } catch {

    }

    const inc_city_data = {
      'name': inc_city_hero_banner_text,
      'images': inc_city_hero_banner_imageUrls,
      'travel': inc_city_transportation_arr.splice(0, 2),
      'city_map': JSON.parse(inc_city_map[0]),
      'weather': inc_city_map_weather_arr,
      'content': inc_content_paras_arr,
      'experiences': inc_city_experiences,
      'nearby': inc_city_nearby
    }

    res.send(inc_city_data);
  } catch (error) {
    console.error('Error fetching Incredible India page:', error);
    res.status(500).send('Error fetching data');
  }
});
app.get("/api/search/:place", async (req, res) => {
  const { place } = req.params;
  const searchUrl = `https://www.bing.com/search?q=${place}`; // Removed &tbm=isch

  try {
    const response = await axios.get(searchUrl);
    res.send(response.data);
    // const { data } = await axios.get(searchUrl);
    // const $ = cheerio.load(data);
    // let nameContent = [];
    // $("div.ent-dtab-nam-w-thmb span").forEach((index, element) => {
    //   nameContent.push($(element).text())
    // })


    // const inc_city_hero_banner_imageUrls = [];
    // $('div.b_slidebar img').each((index, element) => {
    //   let imgUrl = $(element).attr('src');
    //   if (imgUrl) {
    //     // Convert relative URLs to absolute URLs
    //     if (!imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
    //       imgUrl = new URL(imgUrl, baseUrl).href;
    //     }
    //     inc_city_hero_banner_imageUrls.push(imgUrl);
    //   }
    // });
    // res.json({
    //   results: nameContent,
    //   images : inc_city_hero_banner_imageUrls
    // });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).send("Error fetching data from bing");
  }
});



// // Start the server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

app.get("/", (req, res) => {
  res.send("Hello from Vercel!");
});

module.exports = app;