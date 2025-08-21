// script.js - Handles survey form submission

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('survey-form');
  const messageEl = document.getElementById('message');

  /**
   * Retrieve selected goal values from checkbox inputs
   * @returns {string[]} array of selected goals
   */
  function getSelectedGoals() {
    const checkboxes = form.querySelectorAll('input[name="goals"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  /**
   * Validate the form data. Returns an object with `valid` boolean and `message` string.
   */
  function validateForm(data) {
    if (!data.name.trim()) {
      return { valid: false, message: 'Please enter your name.' };
    }
    if (!data.age || isNaN(data.age) || data.age < 10 || data.age > 100) {
      return { valid: false, message: 'Please enter a valid age between 10 and 100.' };
    }
    if (!data.gender) {
      return { valid: false, message: 'Please select your gender.' };
    }
    if (!data.experience) {
      return { valid: false, message: 'Please select your experience level.' };
    }
    if (!Array.isArray(data.goals) || data.goals.length === 0) {
      return { valid: false, message: 'Please select at least one training goal.' };
    }
    if (!data.frequency || isNaN(data.frequency) || data.frequency < 1 || data.frequency > 14) {
      return { valid: false, message: 'Please enter how many training sessions you do per week (1-14).' };
    }
    return { valid: true };
  }

  form.addEventListener('submit', (e) => {
  e.preventDefault();
  messageEl.textContent = '';
  messageEl.style.color = '';
  // Gather data
  const data = {
    name: document.getElementById('name').value,
    age: parseInt(document.getElementById('age').value, 10),
    gender: document.getElementById('gender').value,
    experience: document.getElementById('experience').value,
    goals: getSelectedGoals(),
    frequency: parseInt(document.getElementById('frequency').value, 10),
    comments: document.getElementById('comments').value.trim(),
  };

  // Validate data
  const validation = validateForm(data);
  if (!validation.valid) {
    messageEl.textContent = validation.message;
    messageEl.style.color = 'red';
    return;
  }

  // Determine API base URL. If running on Netlify (production), you may set this to your Render backend.
  // For now, use relative path so it works both locally and when proxied through Netlify redirects.
  const API_BASE_URL = '';
  const submitUrl = `${API_BASE_URL}/api/submit`;

  fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((result) => {
      messageEl.textContent = result.message || 'Submitted successfully!';
      messageEl.style.color = 'green';
      form.reset();
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      messageEl.textContent = 'There was an error submitting your response. Please try again later.';
      messageEl.style.color = 'red';
    });
});
});
