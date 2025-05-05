// Fetch and display a random quote from ZenQuotes API
window.onload = function () {
    // Fetch data from ZenQuotes API
    fetch('https://zenquotes.io/api/quotes/')
      .then(res => res.json())
      .then(data => {
        // Randomly select a quote
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedQuote = data[randomIndex];

        // Update the quote displayed in the 'quote' element
        document.getElementById('quote').textContent = `"${selectedQuote.q}" - ${selectedQuote.a}`;
      });

    // Voice Commands
    if (annyang) {
        const commands = {
          'hello': () => alert('Hello World'),
          'change the color to *color': (color) => {
            document.body.style.backgroundColor = color;
          },
          'navigate to *page': (page) => {
            const target = page.toLowerCase();
            if (target.includes('home')) window.location.href = 'main.html';
            else if (target.includes('stocks')) window.location.href = 'stocks.html';
            else if (target.includes('dogs')) window.location.href = 'dogs.html';
          }
        };

        // Register commands
        annyang.addCommands(commands);

    } else {
        console.warn('Annyang is not supported in this browser.');
    }
};
