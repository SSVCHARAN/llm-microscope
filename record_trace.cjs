const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  model: "qwen2.5-0.5b-instruct",
  messages: [{ role: "user", content: "What is the speed of light? Answer in exactly one short sentence." }],
  temperature: 0.3,
  stream: true,
  logprobs: true,
  top_logprobs: 5,
  max_tokens: 30
});

const options = {
  hostname: '127.0.0.1',
  port: 1234,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let chunks = [];
  
  res.on('data', (d) => {
    const lines = d.toString().split('\n');
    lines.forEach(line => {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload && payload !== '[DONE]') {
          try {
            const parsed = JSON.parse(payload);
            chunks.push(parsed);
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    });
  });

  res.on('end', () => {
    // Process chunks into a clean format
    const trace = chunks.map(chunk => {
      const choice = chunk.choices[0];
      const delta = choice?.delta?.content || "";
      const logprobData = choice?.logprobs?.content?.[0] || null;
      
      let alternatives = [];
      if (logprobData?.top_logprobs) {
        alternatives = logprobData.top_logprobs.map(alt => ({
          token: alt.token,
          logprob: alt.logprob,
          probability: Math.exp(alt.logprob)
        }));
      }

      return {
        tokenText: delta || (logprobData ? logprobData.token : ""),
        logprobData: logprobData ? {
          token: logprobData.token,
          logprob: logprobData.logprob,
          top_logprobs: alternatives
        } : null
      };
    }).filter(c => c.tokenText || c.logprobData);

    // Create dir if not exists
    if (!fs.existsSync('./src/data')) {
      fs.mkdirSync('./src/data');
    }
    
    fs.writeFileSync('./src/data/mockTrace.json', JSON.stringify(trace, null, 2));
    console.log("Trace saved to ./src/data/mockTrace.json! Total tokens:", trace.length);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
