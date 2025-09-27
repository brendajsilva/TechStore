const API_BASE = 'http://localhost:3000/api';

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                const response = await fetch(`${API_BASE}/auth/verify`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.currentUser = result.user;
                    this.showApp();
                } else {
                    this.showLogin();
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
        this.currentUser = null;
    }

    showApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        if (this.currentUser && window.app) {
            window.app.currentUser = this.currentUser;
            document.getElementById('userName').textContent = this.currentUser.name;
        }
    }

    setupEventListeners() {
        // Toggle de senha
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.input-group').querySelector('input');
                const icon = e.target.querySelector('i') || e.target;
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Forgot password form
        document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Modal controls
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('registerModal');
        });

        document.getElementById('showForgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('forgotPasswordModal');
        });

        document.querySelectorAll('.show-login').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideAllModals();
            });
        });

        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        // Email validation
        document.getElementById('loginEmail').addEventListener('blur', (e) => {
            this.validateEmail(e.target);
        });

        document.getElementById('registerEmail').addEventListener('blur', (e) => {
            this.validateEmail(e.target);
        });

        // Password strength
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // Confirm password
        document.getElementById('confirmPassword').addEventListener('blur', (e) => {
            this.validatePasswordMatch();
        });
    }

    setupPasswordStrength() {
        this.passwordStrength = {
            weak: { text: 'Fraca', class: 'weak' },
            medium: { text: 'Média', class: 'medium' },
            strong: { text: 'Forte', class: 'strong' }
        };
    }

    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError(input, 'Email inválido');
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword');
        const confirm = document.getElementById('confirmPassword');
        
        if (confirm.value && password.value !== confirm.value) {
            this.showFieldError(confirm, 'As senhas não coincidem');
            return false;
        } else {
            this.clearFieldError(confirm);
            return true;
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        let strength = 'weak';
        let score = 0;

        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score >= 4) strength = 'strong';
        else if (score >= 2) strength = 'medium';

        strengthBar.className = `strength-fill ${strength}`;
        strengthText.textContent = `Força da senha: ${this.passwordStrength[strength].text}`;
        strengthText.style.color = this.getStrengthColor(strength);
    }

    getStrengthColor(strength) {
        const colors = {
            weak: '#e63946',
            medium: '#f8961e',
            strong: '#4cc9f0'
        };
        return colors[strength];
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        
        input.style.borderColor = '#e63946';
        input.classList.add('shake');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #e63946;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        
        input.parentNode.appendChild(errorDiv);

        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    }

    clearFieldError(input) {
        input.style.borderColor = '';
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleLogin() {
        if (this.isLoading) return;

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validação
        if (!this.validateEmail(document.getElementById('loginEmail'))) {
            return;
        }

        if (!password) {
            this.showFieldError(document.getElementById('loginPassword'), 'Senha é obrigatória');
            return;
        }

        this.setLoading('loginButton', true);

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                
                // Salvar dados de autenticação
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                
                if (!rememberMe) {
                    // Se não lembrar, salvar apenas por 24 horas
                    const expiration = Date.now() + (24 * 60 * 60 * 1000);
                    localStorage.setItem('tokenExpiration', expiration);
                }
                
                this.currentUser = result.data.user;
                setTimeout(() => this.showApp(), 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
            this.shakeElement(document.getElementById('loginForm'));
        } finally {
            this.setLoading('loginButton', false);
        }
    }

    async handleRegister() {
        if (this.isLoading) return;

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validações
        if (!name) {
            this.showFieldError(document.getElementById('registerName'), 'Nome é obrigatório');
            return;
        }

        if (!this.validateEmail(document.getElementById('registerEmail'))) {
            return;
        }

        if (password.length < 6) {
            this.showFieldError(document.getElementById('registerPassword'), 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (!this.validatePasswordMatch()) {
            return;
        }

        if (!acceptTerms) {
            this.showNotification('Você deve aceitar os termos de serviço', 'error');
            return;
        }

        this.setLoading('registerButton', true);

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password, 
                    confirmPassword 
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                
                // Login automático após registro
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                this.currentUser = result.data.user;
                
                this.hideAllModals();
                setTimeout(() => this.showApp(), 1500);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
            this.shakeElement(document.getElementById('registerForm'));
        } finally {
            this.setLoading('registerButton', false);
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();

        if (!this.validateEmail(document.getElementById('forgotEmail'))) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.hideAllModals();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    setLoading(buttonId, isLoading) {
        this.isLoading = isLoading;
        const button = document.getElementById(buttonId);
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');

        if (isLoading) {
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            button.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            button.disabled = false;
        }
    }

    showModal(modalId) {
        this.hideAllModals();
        document.getElementById(modalId).classList.add('active');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showNotification(message, type = 'info') {
        // Remover notificações anteriores
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
        this.currentUser = null;
        this.showLogin();
        this.showNotification('Logout realizado com sucesso', 'success');
    }
}

// Inicializar o sistema de autenticação
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
    
    // Integrar com a aplicação principal se existir
    if (window.app) {
        window.app.authSystem = window.authSystem;
    }
});