const API_BASE_URL = '/api';
let allBookings = [];

document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('userRole');
  if (role !== 'admin') {
    window.location.href = '/login.html';
    return;
  }

  document.getElementById('adminName').textContent = localStorage.getItem('userName') || 'Admin';

  loadAdminStats();
  loadAllBookings();
  loadAllUsers();
  loadAdminResources();

  document.getElementById('addResourceForm').addEventListener('submit', handleAddResource);
});

function showAdminPage(pageName, clickedEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('admin-page-' + pageName).classList.add('active');
  if (clickedEl) clickedEl.classList.add('active');
  const titles = { home: 'Admin Dashboard', bookings: 'All Bookings', users: 'Manage Users', resources: 'Manage Resources' };
  document.getElementById('adminPageTitle').textContent = titles[pageName];
}

// ===== STATS =====
async function loadAdminStats() {
  try {
    const [bookingsRes, usersRes, resourcesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/bookings`),
      fetch(`${API_BASE_URL}/admin/users`),
      fetch(`${API_BASE_URL}/resources`)
    ]);

    const bookingsData = await bookingsRes.json();
    const usersData = await usersRes.json();
    const resourcesData = await resourcesRes.json();

    const bookings = bookingsData.bookings || [];
    document.getElementById('stat-users').textContent = (usersData.users || []).length;
    document.getElementById('stat-pending').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('stat-confirmed').textContent = bookings.filter(b => b.status === 'confirmed').length;
    document.getElementById('stat-resources').textContent = (resourcesData.resources || []).length;
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ===== BOOKINGS =====
async function loadAllBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`);
    const data = await response.json();
    allBookings = data.bookings || [];
    renderBookings(allBookings);
  } catch (err) {
    console.error('Bookings error:', err);
  }
}

function filterBookings(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = status === 'all' ? allBookings : allBookings.filter(b => b.status === status);
  renderBookings(filtered);
}

function renderBookings(bookings) {
  const list = document.getElementById('adminBookingsList');
  list.innerHTML = '';

  if (bookings.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>No bookings found.</p></div>`;
    return;
  }

  bookings.forEach(booking => {
    const card = document.createElement('div');
    card.className = `booking-card ${booking.status}`;
    const date = new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    card.innerHTML = `
      <div class="booking-info">
        <div class="booking-resource">📍 ${booking.resource}</div>
        <div class="booking-time">👤 ${booking.user_email}</div>
        <div class="booking-time">⏰ ${booking.time}</div>
        <div class="booking-location">📅 ${date}</div>
        <span class="booking-status ${booking.status}">${booking.status.toUpperCase()}</span>
      </div>
      <div class="booking-actions">
        ${booking.status === 'pending' ? `
          <button onclick="updateBooking(${booking.id}, 'confirmed')" class="btn btn-success btn-small">✅ Approve</button>
          <button onclick="updateBooking(${booking.id}, 'cancelled')" class="btn btn-danger btn-small">❌ Reject</button>
        ` : ''}
      </div>
    `;
    list.appendChild(card);
  });
}

async function updateBooking(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/booking/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      loadAllBookings();
      loadAdminStats();
    } else {
      alert('Failed to update booking');
    }
  } catch (err) {
    console.error('Update booking error:', err);
  }
}

// ===== USERS =====
async function loadAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    const data = await response.json();
    const users = data.users || [];

    const wrap = document.getElementById('adminUsersList');
    if (users.length === 0) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👥</div><p>No users found.</p></div>`;
      return;
    }

    wrap.innerHTML = `
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td><span class="role-pill ${u.role}">${u.role}</span></td>
              <td>
                ${u.role !== 'admin' ? `<button onclick="deleteUser(${u.id})" class="btn btn-danger btn-small">🗑️ Delete</button>` : '<span style="color:#94a3b8">–</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Users error:', err);
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const response = await fetch(`${API_BASE_URL}/admin/user/${id}`, { method: 'DELETE' });
    if (response.ok) { loadAllUsers(); loadAdminStats(); }
    else { alert('Failed to delete user'); }
  } catch (err) {
    console.error('Delete user error:', err);
  }
}

// ===== RESOURCES =====
async function loadAdminResources() {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`);
    const data = await response.json();
    const resources = data.resources || [];

    document.getElementById('stat-resources').textContent = resources.length;

    const list = document.getElementById('adminResourcesList');
    list.innerHTML = '';

    resources.forEach(r => {
      const card = document.createElement('div');
      card.className = 'resource-card';
      card.innerHTML = `
        <h4>🏛️ ${r.name}</h4>
        <p class="resource-info"><strong>Capacity:</strong> ${r.capacity} people</p>
        <p class="resource-info">${r.description || ''}</p>
        <div style="margin-top:12px;">
          <button onclick="deleteResource(${r.id})" class="btn btn-danger btn-small">🗑️ Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error('Resources error:', err);
  }
}

async function handleAddResource(e) {
  e.preventDefault();
  const name = document.getElementById('resourceName').value;
  const description = document.getElementById('resourceDesc').value;
  const capacity = document.getElementById('resourceCapacity').value;

  if (!name || !description || !capacity) {
    showResourceMessage('All fields are required', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, capacity: parseInt(capacity) })
    });

    if (response.ok) {
      showResourceMessage('Resource added successfully! ✅', 'success');
      document.getElementById('addResourceForm').reset();
      loadAdminResources();
      loadAdminStats();
    } else {
      const data = await response.json();
      showResourceMessage(data.error || 'Failed to add resource', 'error');
    }
  } catch (err) {
    showResourceMessage('Network error', 'error');
  }
}

async function deleteResource(id) {
  if (!confirm('Are you sure you want to delete this resource?')) return;
  try {
    const response = await fetch(`${API_BASE_URL}/admin/resource/${id}`, { method: 'DELETE' });
    if (response.ok) { loadAdminResources(); }
    else { alert('Failed to delete resource'); }
  } catch (err) {
    console.error('Delete resource error:', err);
  }
}

function showResourceMessage(message, type) {
  const div = document.getElementById('resourceMessage');
  div.textContent = message;
  div.className = `message ${type}`;
  div.style.display = 'block';
  if (type === 'success') setTimeout(() => { div.style.display = 'none'; }, 3000);
}

// ===== LOGOUT =====
function adminLogout() {
  document.getElementById('logoutModal').style.display = 'flex';
}

function confirmLogout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

function cancelLogout() {
  document.getElementById('logoutModal').style.display = 'none';
}