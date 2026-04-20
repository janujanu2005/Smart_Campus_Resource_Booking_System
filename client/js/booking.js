const API_BASE_URL = '/api';
let currentUser = null;
let resources = [];

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  if (!userId) { window.location.href = '/login.html'; return; }

  currentUser = { id: userId, name: userName, email: userEmail };

  document.getElementById('topbarUserName').textContent = userName;
  document.getElementById('sidebarUserName').textContent = userName;
  document.getElementById('sidebarUserEmail').textContent = userEmail;
  document.getElementById('userAvatar').textContent = userName ? userName.charAt(0).toUpperCase() : 'U';

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;

  document.getElementById('bookingForm').addEventListener('submit', handleBooking);

  loadResources();
  loadUserBookings();
});

function showPage(pageName, clickedEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + pageName).classList.add('active');
  if (clickedEl) clickedEl.classList.add('active');
  const titles = { home: 'Dashboard', resources: 'Available Resources', book: 'Book a Resource', mybookings: 'My Bookings' };
  document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
}

async function loadResources() {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`);
    const data = await response.json();
    resources = data.resources;

    document.getElementById('totalResources').textContent = resources.length;

    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = '';
    resources.forEach(resource => {
      const card = document.createElement('div');
      card.className = 'resource-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <h4>🏛️ ${resource.name}</h4>
        <p class="resource-info"><strong>Capacity:</strong> ${resource.capacity} people</p>
        <p class="resource-info">${resource.description || ''}</p>
      `;
      card.addEventListener('click', () => {
        document.getElementById('resourceSelect').value = resource.name;
        showPage('book', document.querySelector('[onclick*="book"]'));
      });
      resourcesList.appendChild(card);
    });

    const select = document.getElementById('resourceSelect');
    select.innerHTML = '<option value="">Choose a resource...</option>';
    resources.forEach(resource => {
      const option = document.createElement('option');
      option.value = resource.name;
      option.textContent = resource.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

async function loadUserBookings() {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(userEmail)}`);
    const data = await response.json();
    const bookings = data.bookings;

    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    document.getElementById('confirmedBookings').textContent = confirmed;
    document.getElementById('cancelledBookings').textContent = cancelled;
    document.getElementById('totalBookings').textContent = bookings.length;

    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '';

    if (bookings.length === 0) {
      bookingsList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>No bookings yet. Book a resource to get started!</p></div>`;
      return;
    }

    bookings.forEach(booking => {
      const card = document.createElement('div');
      card.className = `booking-card ${booking.status}`;
      const bookingDate = new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      const isPending = booking.status === 'pending';
      const cancelBtn = `<button 
        onclick="${isPending ? `cancelBooking(${booking.id})` : ''}" 
        class="btn btn-danger btn-small" 
        ${!isPending ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
        Cancel
      </button>`;

      card.innerHTML = `
        <div class="booking-info">
          <div class="booking-resource">📍 ${booking.resource}</div>
          <div class="booking-time">⏰ ${booking.time}</div>
          <div class="booking-location">📅 ${bookingDate}</div>
          <span class="booking-status ${booking.status}">${booking.status.toUpperCase()}</span>
        </div>
        <div class="booking-actions">
          ${cancelBtn}
        </div>
      `;
      bookingsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

async function handleBooking(e) {
  e.preventDefault();

  const resource = document.getElementById('resourceSelect').value;
  const date = document.getElementById('bookingDate').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const userEmail = localStorage.getItem('userEmail');

  if (!resource || !date || !startTime || !endTime) { showBookingMessage('All fields are required', 'error'); return; }
  if (!userEmail) { showBookingMessage('Session expired. Please login again.', 'error'); setTimeout(() => { window.location.href = '/login.html'; }, 2000); return; }
  if (startTime >= endTime) { showBookingMessage('End time must be after start time', 'error'); return; }

  const time = `${startTime} - ${endTime}`;

  try {
    const response = await fetch(`${API_BASE_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, resource, date, time })
    });

    const data = await response.json();

    if (response.ok) {
      showBookingMessage('Booking confirmed successfully! 🎉', 'success');
      document.getElementById('bookingForm').reset();
      setTimeout(() => { loadUserBookings(); }, 1000);
    } else {
      showBookingMessage(data.error || 'Booking failed', 'error');
    }
  } catch (error) {
    showBookingMessage('Network error. Please try again.', 'error');
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/cancel/${bookingId}`, { method: 'DELETE' });
    const data = await response.json();
    if (response.ok) { loadUserBookings(); }
    else { alert(data.error || 'Cancellation failed'); }
  } catch (error) {
    console.error('Error cancelling booking:', error);
  }
}

function showBookingMessage(message, type) {
  const messageDiv = document.getElementById('bookingMessage');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  if (type === 'success') { setTimeout(() => { messageDiv.style.display = 'none'; }, 4000); }
}

function logout() {
  document.getElementById('logoutModal').style.display = 'flex';
}

function confirmLogout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

function cancelLogout() {
  document.getElementById('logoutModal').style.display = 'none';
}