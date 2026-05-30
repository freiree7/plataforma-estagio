
class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm'); 
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.documentoInput = document.getElementById('documento');
        this.documentoLabel = document.getElementById('documentoLabel');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.login-btn');

        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.updateDocumentoLabel();
    }
    
    bindEvents() {
        this.nameInput.addEventListener('blur',() => this.validateName());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.documentoInput.addEventListener('blur', () => this.validateDocumento());
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        this.documentoInput.addEventListener('input', () => this.clearError('documento'));
        this.nameInput.addEventListener('input' , () =>this.clearError('name') )
        document.querySelectorAll('input[name="tipo"]').forEach((el) => {
            el.addEventListener('change', () => {
                this.clearError('tipoGroup');
                this.updateDocumentoLabel();
                this.validateDocumento();
            });
        });
    }

    getTipoSelecionado() {
        return document.querySelector('input[name="tipo"]:checked')?.value;
    }

    updateDocumentoLabel() {
        const tipo = this.getTipoSelecionado();
        this.documentoLabel.textContent = tipo === 'empresa' ? 'CNPJ' : 'RA';
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            
            const icon = this.passwordToggle.querySelector('.toggle-icon');
            icon.classList.toggle('show-password', type === 'text');
        });
    }
    validateName(){
        const name = this.nameInput.value.trim()
       

        if(!name){
            this.showError('name' , 'O nome é obrigatório!');
            return false;
        }
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
             this.showError('name', 'O nome não pode conter números ou símbolos');
            return false;
        }
        
        if(name.length < 3){
            this.showError('name','O nome digitado deve possuir mais de 3 caracteres')
            return false;
        }

        
        this.clearError('name')
        return true;
    }
    
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', 'O email é obrigatório');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Por favor insira um email válido');
            return false;
        }
        
        this.clearError('email');
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

    validateTipo() {
        const checked = document.querySelector('input[name="tipo"]:checked');
        if (!checked) {
            this.showError('tipoGroup', 'Selecione se você é aluno ou empresa');
            return false;
        }
        this.clearError('tipoGroup');
        return true;
    }

    validateDocumento() {
        const documento = this.documentoInput.value.trim();
        const tipo = this.getTipoSelecionado();
        const numeros = documento.replace(/\D/g, '');

        if (!documento) {
            this.showError('documento', 'Preencha o campo RA/CNPJ');
            return false;
        }

        if (tipo === 'aluno' && numeros.length !== 10) {
            this.showError('documento', 'Informe um RA válido com 10 dígitos');
            return false;
        }

        if (tipo === 'empresa') {
            if (numeros.length !== 14) {
                this.showError('documento', 'Informe um CNPJ válido com 14 dígitos');
                return false;
            }
        }

        this.clearError('documento');
        return true;
    }
    
    showError(field, message) {
        const el = document.getElementById(field);
        const formGroup = el.classList?.contains('form-group') ? el : el.closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    clearError(field) {
        const el = document.getElementById(field);
        const formGroup = el.classList?.contains('form-group') ? el : el.closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.remove('error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
}





const form = document.getElementById('loginForm')
const loginFormInstance = new LoginForm()

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const nome = document.getElementById('name').value.trim()
  const email = document.getElementById('email').value.trim()
  const senha = document.getElementById('password').value
  const documento = document.getElementById('documento').value.trim()
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value

  const nameOk = loginFormInstance.validateName()
  const emailOk = loginFormInstance.validateEmail()
  const passOk = loginFormInstance.validatePassword()
  const tipoOk = loginFormInstance.validateTipo()
  const documentoOk = loginFormInstance.validateDocumento()

  if (!tipoOk || !nameOk || !emailOk || !passOk || !documentoOk) {
    return
  }

  try {
    const payload = {
      nome,
      email,
      senha,
      tipo,
      ra: tipo === 'aluno' ? documento : null,
      cnpj: tipo === 'empresa' ? documento : null
    }
    console.log(payload)
    const resposta = await fetch('/api/usuarios/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      
    })
    const contentType = resposta.headers.get('content-type') || ''
    const dados = contentType.includes('application/json')
      ? await resposta.json()
      : { erro: 'Resposta inválida do servidor' }

    if (!resposta.ok) {
      const err = dados?.erro
      const msg =
        resposta.status === 400 && err === 'Erro no cliente'
          ? 'Verifique os dados informados e o tipo de conta.'
          : err === 'Email já cadastrado'
            ? 'Email já cadastrado.'
            : err === 'RA já cadastrado'
              ? 'RA já cadastrado.'
              : err === 'CNPJ já cadastrado'
                ? 'CNPJ já cadastrado.'
                : err === 'RA é obrigatório para aluno'
                  ? 'RA é obrigatório para contas de aluno.'
                  : err === 'CNPJ é obrigatório para empresa'
                    ? 'CNPJ é obrigatório para contas de empresa.'
                    : err === 'RA inválido — deve conter 10 dígitos'
                      ? 'RA inválido. Use exatamente 10 dígitos.'
                      : err === 'CNPJ inválido — deve conter 14 dígitos'
                        ? 'CNPJ inválido. Use exatamente 14 dígitos.'
            : 'Não foi possível concluir o cadastro.'
      Swal.fire({
        icon: 'error',
        title: 'Erro ao cadastrar',
        text: msg,
        confirmButtonColor: '#ef4444'
      })
      form.reset()
      loginFormInstance.updateDocumentoLabel()
      return
      
    }else {
        Swal.fire({
            icon: 'success',
            title: 'Cadastro realizado!',
            text: 'Seu usuário foi criado com sucesso!',
            confirmButtonText: 'OK',
            confirmButtonColor:'#3b82f6'
        }).then(() => {
        window.location.href = '/login'
        })
           form.reset()
           loginFormInstance.updateDocumentoLabel()
    }
    



  } catch (error) {
    console.error(error)
    alert('Erro ao conectar com o servidor')
  }
})


