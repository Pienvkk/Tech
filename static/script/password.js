function togglePassword() {
    const passInput = document.getElementById('pass');
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
  }