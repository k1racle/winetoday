const url = "http://localhost:1337/api/homepage?populate[heroBackground]=true&populate[heroBackgroundVideo]=true&populate[infographicCards][populate][backgroundImage]=true&populate[infographicCards][populate][backgroundVideo]=true&populate[blocks]=true&populate[blocks][on][blocks.archive-feed]=true&populate[blocks][on][blocks.image-highlight][populate][image]=true&populate[blocks][on][blocks.hero][populate][backgroundImage]=true&populate[blocks][on][blocks.hero][populate][backgroundVideo]=true&populate[seo]=true";

const response = await fetch(url);

if (!response.ok) {
  throw new Error(`Request failed: ${response.status} ${response.statusText}`);
}

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
