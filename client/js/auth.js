const API_BASE_URL = '/api';
let isLoginMode = true;
let selectedRole = '';

function selectRole(role) {
  selectedRole = role;
  document.getElementById('roleSelection').style.display = 'none';
  document.getElementById('authSection').style.display = 'block';

  const badge = document.getElementById('selectedRoleBadge');
  badge.textContent = role === 'admin' ? '🛡️ Admin Access' : '👤 User Access';
  badge.className = `role-badge ${role}`;

  // Admins can only login, not register
  if (role === 'admin') {
    document.getElementById('toggleAuth').style.display = 'none';
    isLoginMode = true;
    updateFormMode();
  }

  document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);
}

function goBackToRole() {
  document.getElementById('roleSelection').style.display = 'block';
  document.getElementById('authSection').style.display = 'none';
  selectedRole = '';
  clearMessage();
}

function toggleAuthMode(event) {
  if (event) event.preventDefault();
  isLoginMode = !isLoginMode;
  updateFormMode();
  document.getElementById('authForm').reset();
  clearMessage();
}

function updateFormMode() {
  const title = document.getElementById('authTitle');
  const submitBtn = document.getElementById('submitBtn');
  const registerFields = document.getElementById('registerFields');
  const toggleAuth = document.getElementById('toggleAuth');

  if (isLoginMode) {
    title.textContent = 'Login';
    submitBtn.textContent = 'Login';
    registerFields.style.display = 'none';
    toggleAuth.innerHTML = "Don't have an account? <a href='#' onclick='toggleAuthMode(event)'>Register here</a>";
  } else {
    title.textContent = 'Register';
    submitBtn.textContent = 'Register';
    registerFields.style.display = 'block';
    toggleAuth.innerHTML = "Already have an account? <a href='#' onclick='toggleAuthMode(event)'>Login here</a>";
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const endpoint = isLoginMode ? '/login' : '/register';
  const payload = { email, password, role: selectedRole };

  if (!isLoginMode) {
    const fullName = document.getElementById('fullName').value;
    if (!fullName) { showMessage('Full name is required', 'error'); return; }
    payload.fullName = fullName;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      // Verify role matches
      if (isLoginMode && data.user.role !== selectedRole) {
        showMessage(`This account is not registered as ${selectedRole}. Please select the correct role.`, 'error');
        return;
      }

      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.fullName);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.role);

      showMessage(data.message, 'success');

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 1000);
    } else {
      showMessage(data.error || 'An error occurred', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}

function clearMessage() {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';
  messageDiv.style.display = 'none';
}