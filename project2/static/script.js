// Flask Frontend JavaScript

console.log('Flask app loaded');

// Fetch greeting from Flask backend (which will proxy to Function App)
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/greeting?name=User');
        const data = await response.json();
        console.log('Greeting from Function App:', data);
        
        // Display the greeting in console
        console.log(`${data.message} - ${data.timestamp}`);
    } catch (error) {
        console.error('Error fetching greeting:', error);
    }
});