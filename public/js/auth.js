// Auth module for registration, login, profile management, and auth UI modals

function getAuthUser() {
  const userJson = localStorage.getItem('auracraft_user');
  return userJson ? JSON.parse(userJson) : null;
}

function updateAuthUI() {
  const user = getAuthUser();
  const authNavBtn = document.getElementById('authNavBtn');
  const userMenuContainer = document.getElementById('userMenuContainer');
  const userDropdownName = document.getElementById('userDropdownName');
  const userDropdownEmail = document.getElementById('userDropdownEmail');

  if (user) {
    if (authNavBtn) authNavBtn.style.display = 'none';
    if (userMenuContainer) userMenuContainer.style.display = 'block';
    if (userDropdownName) userDropdownName.textContent = user.name;
    if (userDropdownEmail) userDropdownEmail.textContent = user.email;
  } else {
    if (authNavBtn) authNavBtn.style.display = 'flex';
    if (userMenuContainer) userMenuContainer.style.display = 'none';
  }
}

function openAuthModal(mode = 'login') {
  let modal = document.getElementById('authModal');
  if (!modal) return;

  const isLogin = mode === 'login';
  document.getElementById('modalTitle').textContent = isLogin ? 'Welcome Back' : 'Create Account';
  document.getElementById('nameGroup').style.display = isLogin ? 'none' : 'block';
  document.getElementById('authSubmitBtn').textContent = isLogin ? 'Sign In' : 'Create Account';
  document.getElementById('authSwitchText').innerHTML = isLogin
    ? `Don't have an account? <a href="#" id="switchAuthMode" style="color: var(--primary); font-weight: 600;">Sign up</a>`
    : `Already have an account? <a href="#" id="switchAuthMode" style="color: var(--primary); font-weight: 600;">Log in</a>`;

  modal.dataset.mode = mode;
  modal.classList.add('active');

  const switchBtn = document.getElementById('switchAuthMode');
  if (switchBtn) {
    switchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal(mode === 'login' ? 'register' : 'login');
    });
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

async function handleAuthFormSubmit(e) {
  e.preventDefault();
  const modal = document.getElementById('authModal');
  const mode = modal ? modal.dataset.mode : 'login';

  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName') ? document.getElementById('authName').value : '';

  try {
    let res;
    if (mode === 'register') {
      res = await apiRequest('/auth/register', 'POST', { name, email, password });
    } else {
      res = await apiRequest('/auth/login', 'POST', { email, password });
    }

    if (res.success) {
      localStorage.setItem('auracraft_token', res.token);
      localStorage.setItem('auracraft_user', JSON.stringify(res.user));
      showToast(res.message, 'success');
      closeAuthModal();
      updateAuthUI();

      // Dispatch auth change event
      window.dispatchEvent(new Event('authChanged'));
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function logout() {
  localStorage.removeItem('auracraft_token');
  localStorage.removeItem('auracraft_user');
  showToast('Logged out successfully', 'info');
  updateAuthUI();
  window.dispatchEvent(new Event('authChanged'));
}

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  const authNavBtn = document.getElementById('authNavBtn');
  if (authNavBtn) {
    authNavBtn.addEventListener('click', () => openAuthModal('login'));
  }

  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
  }

  const authForm = document.getElementById('authForm');
  if (authForm) {
    authForm.addEventListener('submit', handleAuthFormSubmit);
  }

  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userAvatarBtn && userDropdown) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
