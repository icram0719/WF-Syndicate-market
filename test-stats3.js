import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function test() {
  const urls = [
    'https://api.warframe.market/v2/statistics/closed/item/scattered_justice',
    'https://api.warframe.market/v2/items/scattered_justice/statistics/closed',
    'https://api.warframe.market/v2/statistics/orders/item/scattered_justice'
  ];
  
  for (const url of urls) {
    try {
      const res = await fetchUrl(url);
      console.log(url, res.status);
    } catch (e) {
      console.log(url, e.message);
    }
  }
}

test();
