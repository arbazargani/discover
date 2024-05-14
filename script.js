var baseRss = '/agent.php';

const e2p = s => s.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
const e2a = s => s.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])

const p2e = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
const a2e = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))

const p2a = s => s.replace(/[۰-۹]/g, d => '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
const a2p = s => s.replace(/[٠-٩]/g, d => '۰۱۲۳۴۵۶۷۸۹'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])

function timeAgo(dateString) {
    // Parse the date string into a JavaScript Date object
    const date = new Date(dateString);
  
    // Get the current time
    const now = new Date();
  
    // Calculate the difference in milliseconds
    const difference = now.getTime() - date.getTime();
  
    // Convert milliseconds to seconds
    const seconds = Math.floor(difference / 1000);
  
    // Define thresholds for different units (seconds, minutes, hours, days, etc.)
    const thresholds = [
      { time: 45, unit: "ثانیه" },
      { time: 60, unit: "دقیقه" },
      { time: 90, unit: "دقیقه" }, // "an hour ago" for 1-1.5 hours
      { time: 60 * 24, unit: "ساعت" },
      { time: 60 * 24 * 2, unit: "روز" },
      { time: 60 * 24 * 7, unit: "روز" }, // "a week ago" for 1 week
    ];
  
    // Loop through the thresholds
    let i = 0;
    while (i < thresholds.length && seconds >= thresholds[i].time) {
      i++;
    }
  
    // Calculate the time unit and value
    const { time, unit } = thresholds[i - 1];
    const timeElapsed = Math.floor(seconds / time);
  
    // Handle special cases for "just now" and "an hour ago"
    // let suffix = timeElapsed === 1 ? "" : "s"; // pluralize for seconds
    let suffix = timeElapsed === 1 ? "" : ""; // pluralize for seconds
    if (unit === "minute" && timeElapsed === 1) {
      unit = "دقیقه"; // "a minute ago"
    } else if (unit === "minute" && timeElapsed > 1 && timeElapsed < 2) {
      unit = "ساعت"; // "an hour ago" for 1-1.5 hours
    }
  
    // Return the formatted string
    return e2p(`${timeElapsed} ${unit} پیش`);
  }
  
function extractImageURL(description) {
    // Use a regular expression to extract the image URL
    const regex = /<img src="([^"]+)">/g;
    const match = regex.exec(description);
  
    // If there's a match, return the URL; otherwise, return an empty string
    if (match) {
      return match[1];
    } else {
      return "";
    }
  }
async function fetchAndParseRss(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, "text/xml");
  
      // Parse the RSS feed using DOM methods
      const title = doc.querySelector("title").textContent;
      const items = doc.querySelectorAll("item");
  
      const parsedItems = [];
      for (const item of items) {
        const itemTitle = item.querySelector("title").textContent;
        const itemLink = item.querySelector("link").textContent;
        const itemDescription = item.querySelector("description").textContent;
        const itemPubDate = item.querySelector("pubDate").textContent;
  
        parsedItems.push({ title: itemTitle, link: itemLink, description: itemDescription, pubDate: itemPubDate });
      }
  
      return { title: title, items: parsedItems };
    } catch (error) {
      console.error("Error fetching and parsing RSS feed:", error);
      return null;
    }
  }
    
window.addEventListener('load', () => {
    fetchAndParseRss(baseRss)
    .then(data => {
      if (data) {
        data.items.forEach((item) => {
            imageURL = extractImageURL(item.description);
            featureFlag = ((new Date().getMilliseconds() + 26 + 1) % 2 === 0) ? '' : 'no-';
            if (imageURL.length === 0) return;
            
            template = `
            <li data-model-id="${item.link.replace('https://www.titrekootah.ir/fa/tiny/news-', '')}" class="news-item">
                <div class="news-card">
                    <img${featureFlag} src="${imageURL}" loading="lazy" class="news-image">
                    <div class="flex">
                        <div class="news-detail">
                            <h2 class="news-title">
                                <span class="news-time">${timeAgo(item.pubDate)}</span>
                                <a href="${item.link}">${item.title}</a>
                            </h2>
                        </div>
                        <div class="news-action">
                            <ion-icon name="heart-outline"></ion-icon>
                            <ion-icon name="share-outline"></ion-icon>
                        </div>
                    </div>
                </div>
            </li>
            `;
            
            document.querySelector('#news-wrapper').innerHTML += template;
        });

        document.querySelector('#loader').remove();
        document.querySelector('#news-wrapper').style.cssText = '';
      } else {
        console.log("Failed to fetch and parse RSS feed.");
      }
    })
    .catch(error => console.error("Error:", error));
  
});