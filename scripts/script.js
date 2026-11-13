const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loading = document.getElementById('loading');
    try {
        loading.style.display = 'block';
        const email = document.getElementById('email').value.trim().toLowerCase();

        const existente = await axios.get('http://localhost:3001/pessoas', { params: { email } });
        if (existente.data.length > 0) {
            mostrarMensagem('Este e-mail já está cadastrado. Faça login.', true);
            return;
        }

        const { data } = await axios.post('http://localhost:3001/pessoas', {
            nome: document.getElementById('nome').value.trim(),
            idade: document.getElementById('idade').value,
            email,
            senha: document.getElementById('senha').value
        });

        localStorage.setItem('usuarioId', data.id);
        mensagemNaProximaPagina('Conta cadastrada com sucesso');
        window.location.href = form.dataset.destino;
    } catch (e) {
        console.error(e);
        mostrarMensagem('Erro ao enviar o forms', true);
    } finally {
        loading.style.display = 'none';
    }
});

// Mensagens de validação personalizadas
const campos = {
    senha: { valueMissing: 'Digite sua senha.', tooShort: 'A senha precisa ter pelo menos 8 caracteres.', padrao: 'A senha não atende aos requisitos.' },
    email: { padrao: 'Por favor, digite um e-mail válido.' }
};

Object.entries(campos).forEach(([nome, msgs]) => {
    const campo = document.getElementById(nome);
    campo.addEventListener('invalid', () => {
        const erro = Object.keys(msgs).find(k => campo.validity[k]);
        campo.setCustomValidity(msgs[erro] || msgs.padrao);
    });
    campo.addEventListener('input', () => campo.setCustomValidity(''));
});
