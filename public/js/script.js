

class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.identificadorInput = document.getElementById('identificador');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.login-btn');
        this.successMessage = document.getElementById('successMessage');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
    }
    
    bindEvents() {
        
        this.identificadorInput.addEventListener('blur', () => this.validateIdentificador());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.identificadorInput.addEventListener('input', () => this.clearError('identificador'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            
            const icon = this.passwordToggle.querySelector('.toggle-icon');
            icon.classList.toggle('show-password', type === 'text');
        });
    }
    
    validateIdentificador() {
        const identificador = this.identificadorInput.value.trim();

        if (!identificador) {
            this.showError('identificador', 'Informe email, CNPJ ou RA');
            return false;
        }
        
        this.clearError('identificador');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('password', 'Coloque sua senha');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('password', 'A senha deve possuir mais de 6 caracteres');
            return false;
        }
        
        this.clearError('password');
        return true;
    }
    
    showError(field, message) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    clearError(field) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.remove('error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isIdentificadorValid = this.validateIdentificador();
        const isPasswordValid = this.validatePassword();
        
        if (!isIdentificadorValid || !isPasswordValid) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success state
            this.showSuccess();
        } catch (error) {
            this.showError('password', 'O login falhou. Tente Novamente');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('carregando', loading);
        this.submitButton.disabled = loading;
    }
    
    showSuccess() {
        this.form.style.display = 'none';
        this.successMessage.classList.add('show');
        
        // Simulate redirect after 2 seconds
        setTimeout(() => {
            console.log('Redirecting to dashboard...');
            // window.location.href = '/dashboard';
        }, 2000);
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});

const form = document.getElementById("loginForm")

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const identificador = document.getElementById("identificador").value.trim()
  const senha = document.getElementById("password").value

  
  try {
    const resposta = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador, email: identificador, senha })
    })

    const dados = await resposta.json().catch(() => ({}))

    if (!resposta.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no login',
        text:  dados.erro || 'Falha ao autenticar',
        confirmButtonColor: '#ef4444'
      })
      form.reset()
      return
      
    }

    Swal.fire({
        icon: 'success',
        title: 'Login realizado!',
        text: 'Seu usuário foi logado com sucesso!',
        confirmButtonColor: '#3b82f6'
    }).then(() => {
        
        // redireciona para a página correta baseado no tipo
        if (dados.tipo === 'aluno') {
            window.location.href = '/home/aluno'
        
        } else if(dados.tipo === 'empresa') {
            window.location.href = '/home/empresa'
        }
    })


  } catch (error) {
    console.error('Erro no fetch:', error)
  }
})


