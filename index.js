const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { initDb, getClient } = require('./db');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws)=>{
  clients.add(ws);
  console.log('ws connected');
  ws.on('message', async (data)=>{
    try {
      const msg = JSON.parse(data);
      if(msg.type === 'new_message'){
        const text = msg.text || '';
        const client = getClient();
        const res = await client.query('INSERT INTO messages (text, created_at) VALUES ($1, $2) RETURNING id, text, created_at', [text, new Date()]);
        const row = res.rows[0];
        const payload = { type: 'broadcast', message: { id: row.id, text: row.text, created_at: row.created_at } };
        broadcast(JSON.stringify(payload));
      } else if(msg.type === 'get_messages'){
        const client = getClient();
        const res = await client.query('SELECT id, text, created_at FROM messages ORDER BY id ASC LIMIT 100');
        ws.send(JSON.stringify({ type: 'messages', messages: res.rows }));
      }
    } catch(e){
      console.error('ws message handler error', e);
    }
  });
  ws.on('close', ()=>clients.delete(ws));
});

function broadcast(data){
  for(const c of clients){
    if(c.readyState === WebSocket.OPEN) c.send(data);
  }
}

app.get('/health', (req,res)=> res.json({ ok: true }));

// Admin: 設定剩餘秒數，若 <= 300 (5 分鐘) 則每 30 秒廣播剩餘時間
let remainingSeconds = null;
let countdownInterval = null;

app.post('/admin/set_remaining_seconds', (req,res)=>{
  const s = Number(req.body.seconds);
  if(Number.isNaN(s)) return res.status(400).send('invalid seconds');
  remainingSeconds = s;
  setupCountdown();
  return res.json({ remaining: remainingSeconds });
});

function setupCountdown(){
  if(countdownInterval){
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if(remainingSeconds == null) return;
  if(remainingSeconds <= 300){
    broadcastRemaining();
    countdownInterval = setInterval(()=>{
      remainingSeconds -= 30;
      if(remainingSeconds <= 0){
        broadcast(JSON.stringify({ type:'service_notice', remaining:0, message:'服務已結束' }));
        clearInterval(countdownInterval);
        countdownInterval = null;
      } else {
        broadcastRemaining();
      }
    }, 30 * 1000);
  }
}

function broadcastRemaining(){
  broadcast(JSON.stringify({ type:'service_notice', remaining: remainingSeconds, message:`服務剩餘 ${remainingSeconds} 秒` }));
}

const PORT = process.env.PORT || 3000;

initDb().then(()=>{
  server.listen(PORT, ()=> console.log('server listening on', PORT));
}).catch(err=>{
  console.error('init db failed', err);
  process.exit(1);
});
