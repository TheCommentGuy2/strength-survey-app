// results.js - Fetch and display survey results

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#results-table tbody');
  const loadingEl = document.getElementById('loading');

  // Determine API base URL. For now, use relative path. In production, update in netlify.toml redirect or set here.
  const API_BASE_URL = '';
  const resultsUrl = `${API_BASE_URL}/api/results`;

  fetch(resultsUrl)
    .then((response) => response.json())
    .then((data) => {
      loadingEl.style.display = 'none';
      if (!Array.isArray(data) || data.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 8;
        cell.textContent = 'No responses yet.';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
      }
      data.forEach((entry) => {
        const row = document.createElement('tr');
        const fields = [
          entry.name,
          entry.age,
          entry.gender,
          entry.experience,
          Array.isArray(entry.goals) ? entry.goals.join(', ') : '',
          entry.frequency,
          entry.comments || '',
          new Date(entry.timestamp).toLocaleString(),
        ];
        fields.forEach((field) => {
          const td = document.createElement('td');
          td.textContent = field;
          row.appendChild(td);
        });
        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error('Error fetching results:', error);
      loadingEl.textContent = 'Error loading results.';
    });
});
