import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Simple in-memory cache to avoid hitting Warframe Market API too hard
  const cache: Record<string, { data: any; timestamp: number }> = {};
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0'
  ];

  // Request queue to enforce 3 requests per second limit (333ms gap)
  const requestQueue: (() => void)[] = [];
  let isProcessingQueue = false;
  const MIN_REQUEST_GAP = 334;

  const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;
    isProcessingQueue = true;
    
    while (requestQueue.length > 0) {
      const resolveNext = requestQueue.shift();
      if (resolveNext) {
        resolveNext();
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_GAP));
      }
    }
    
    isProcessingQueue = false;
  };

  const enqueueRequest = (): Promise<void> => {
    return new Promise(resolve => {
      requestQueue.push(resolve);
      processQueue();
    });
  };

  // Batch proxy route for Warframe Market API
  app.post("/api/market/data/batch", async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items must be an array" });
    }

    const results: Record<string, any> = {};
    
    for (const item of items) {
      const cacheKey = `data_${item}`;
      if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
        results[item] = cache[cacheKey].data;
        continue;
      }

      try {
        const encodedItem = encodeURIComponent(item);
        console.log(`[Proxy] Fetching data for ${item} (batch)...`);
        
        const fetchWithRetry = async (url: string, retries = 3, delay = 3000): Promise<Response> => {
          await enqueueRequest();
          
          const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': ua,
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Platform': 'pc',
              'Language': 'en',
              'Referer': 'https://warframe.market/',
              'Origin': 'https://warframe.market',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if ((response.status === 403 || response.status === 429) && retries > 0) {
            console.warn(`[Proxy] ${response.status} for ${url}, retrying in ${delay}ms... (${retries} retries left)`);
            const jitter = Math.floor(Math.random() * 2000);
            await new Promise(resolve => setTimeout(resolve, delay + jitter));
            return fetchWithRetry(url, retries - 1, delay * 2);
          }
          return response;
        };

        const [ordersResponse, statsResponse] = await Promise.all([
          fetchWithRetry(`https://api.warframe.market/v2/orders/item/${encodedItem}`),
          fetchWithRetry(`https://api.warframe.market/v1/items/${encodedItem}/statistics`)
        ]);
        
        if (!ordersResponse.ok) {
          console.error(`[Proxy] Market API responded with ${ordersResponse.status} for ${item} orders`);
          results[item] = { error: `Market API responded with ${ordersResponse.status}` };
          continue;
        }
        
        const ordersData = await ordersResponse.json();

        let statsData = null;
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        } else {
          console.warn(`[Proxy] Market API responded with ${statsResponse.status} for ${item} stats`);
        }

        const data = {
          orders: ordersData,
          statistics: statsData
        };

        cache[cacheKey] = { data, timestamp: Date.now() };
        results[item] = data;
      } catch (error: any) {
        console.error(`[Proxy] Error fetching data for ${item}:`, error.message);
        results[item] = { error: error.message };
      }
    }

    res.json(results);
  });

  // Proxy route for Warframe Market API (Orders + Statistics)
  app.get("/api/market/data/:item", async (req, res) => {
    const { item } = req.params;
    const cacheKey = `data_${item}`;

    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      return res.json(cache[cacheKey].data);
    }

    try {
      const encodedItem = encodeURIComponent(item);
      console.log(`[Proxy] Fetching data for ${item}...`);
      
      const fetchWithRetry = async (url: string, retries = 3, delay = 3000): Promise<Response> => {
        await enqueueRequest();
        
        const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': ua,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Platform': 'pc',
            'Language': 'en',
            'Referer': 'https://warframe.market/',
            'Origin': 'https://warframe.market',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if ((response.status === 403 || response.status === 429) && retries > 0) {
          console.warn(`[Proxy] ${response.status} for ${url}, retrying in ${delay}ms... (${retries} retries left)`);
          const jitter = Math.floor(Math.random() * 2000);
          await new Promise(resolve => setTimeout(resolve, delay + jitter));
          return fetchWithRetry(url, retries - 1, delay * 2);
        }
        return response;
      };

      const [ordersResponse, statsResponse] = await Promise.all([
        fetchWithRetry(`https://api.warframe.market/v2/orders/item/${encodedItem}`),
        fetchWithRetry(`https://api.warframe.market/v1/items/${encodedItem}/statistics`)
      ]);
      
      if (!ordersResponse.ok) {
        console.error(`[Proxy] Market API responded with ${ordersResponse.status} for ${item} orders`);
        return res.status(ordersResponse.status).json({ error: `Market API responded with ${ordersResponse.status}` });
      }
      
      const ordersData = await ordersResponse.json();

      let statsData = null;
      if (statsResponse.ok) {
        statsData = await statsResponse.json();
      } else {
        console.warn(`[Proxy] Market API responded with ${statsResponse.status} for ${item} stats`);
      }

      const data = {
        orders: ordersData,
        statistics: statsData
      };

      cache[cacheKey] = { data, timestamp: Date.now() };
      res.json(data);
    } catch (error: any) {
      console.error(`[Proxy] Error fetching data for ${item}:`, error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
