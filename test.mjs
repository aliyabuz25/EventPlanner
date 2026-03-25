const response = await fetch('http://localhost:3000/api/ai-explorer/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    history: [],
    userMessage: "Hallo, wir planen ein Event in München mit 500 Teilnehmern, 1 Tag, 3 Counter für Check-in.",
    mode: "easy"
  })
});
const text = await response.text();
console.log(response.status, text);
