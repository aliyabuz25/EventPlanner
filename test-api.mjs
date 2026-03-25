import fs from 'node:fs';

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/ai-explorer/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [],
        userMessage: "Hallo, wir planen ein Event in München mit 500 Teilnehmern, 1 Tag, 3 Counter für Check-in.",
        mode: "easy"
      })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

run();
