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
    // Display message if Annyang is not supported
    document.getElementById('audio-instructions').innerHTML = '<p>Voice commands are not supported in your browser.</p>';
    console.warn('Annyang is not supported in this browser.');
  }
  
  // Function to validate ticker input
  function isValidTicker(ticker) {
    return /^[A-Za-z]+$/.test(ticker);  // Validates if ticker contains only letters
  }
  
  // Function to calculate date range based on the selected number of days
  function getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);
  
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
  
  // Get the stock data and plot the chart
  async function fetchStockData() {
    const ticker = document.getElementById('stock-ticker').value.toUpperCase();
    if (!isValidTicker(ticker)) {
      alert("Please enter a valid stock ticker.");
      return;
    }
  
    const days = parseInt(document.getElementById('days-range').value);
    const { startDate, endDate } = getDateRange(days);
    const polygonApiKey = 'YoPl2U0M7FpxeBnf8E4rIQWPDfICs56j';
    const polygonApiUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?apiKey=${polygonApiKey}`;
  
    try {
      const response = await fetch(polygonApiUrl);
      const data = await response.json();
  
      if (!data.results || data.results.length === 0) {
        alert("No data available for this ticker.");
        return;
      }
  
      // Process data for chart with proper date formatting
      const labels = data.results.map(item => {
        const date = new Date(item.t);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; // MM/DD/YYYY format
        return formattedDate;
      });
      
      const prices = data.results.map(item => item.c);
  
      // Create chart
      createChart(labels, prices);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  }
  
  // Create chart with Chart.js
  let chartInstance = null; // Declare chart globally to access it later
  
  function createChart(labels, prices) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
  
    // Destroy previous chart before creating a new one
    if (chartInstance) {
      chartInstance.destroy();
    }
  
    // Make the chart bigger by setting canvas width and height
    const canvas = document.getElementById('stock-chart');
    canvas.width = 800; // Set canvas width (you can adjust this value as needed)
    canvas.height = 500; // Set canvas height (you can adjust this value as needed)
  
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Stock Price',
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false
        }]
      }
    });
  }
  
  // Fetch Reddit stocks data
  async function fetchRedditStocks() {
    const redditApiUrl = 'https://tradestie.com/api/v1/apps/reddit?date=2022-04-03';
    try {
      const response = await fetch(redditApiUrl);
      const data = await response.json();
  
      if (Array.isArray(data) && data.length > 0) {
        // Sanitize and sort the data
        const sortedStocks = data
          .filter(stock => stock.ticker && stock.no_of_comments && stock.sentiment)  // Sanitize data
          .sort((a, b) => b.no_of_comments - a.no_of_comments);
  
        // Get the top 5 stocks with the highest comments
        const topStocks = sortedStocks.slice(0, 5);
  
        // Populate the table with the sorted stocks
        populateRedditTable(topStocks);
      } else {
        console.error("No stock data available or data format is incorrect");
      }
    } catch (error) {
      console.error("Error fetching Reddit stock data:", error);
    }
  }
  
  // Populate Reddit stocks data into the table
  function populateRedditTable(topStocks) {
    const tableBody = document.getElementById('reddit-stocks').querySelector('tbody');
    tableBody.innerHTML = '';  // Clear previous rows
  
    topStocks.forEach(stock => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
        <td>${stock.no_of_comments}</td>
        <td>
          ${stock.sentiment === 'Bullish' ? '📈 Bullish' : '📉 Bearish'}
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  // Fetch Reddit stocks when the page loads
  window.onload = function() {
    fetchRedditStocks();
  };
  