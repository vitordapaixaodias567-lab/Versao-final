const url = 'http://localhost:3001/pessoas'
//Inicio Card de Login
async function Login(e) {
    if (e) e.preventDefault();
    console.log('Login chamado');

    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;

    try {
        const { data } = await axios.get(url, { params: { email } });
        console.log('retorno do servidor:', data);

        const pessoa = data[0];
        if (pessoa && pessoa.senha === senha) {
            localStorage.setItem('usuarioId', pessoa.id);
            window.location.href = 'tela_inicial.html';
        } else {
            mostrarMensagem('E-mail ou senha incorretos, tente novamente', true);
        }
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao conectar com o servidor', true);
    }
}
//Fim do Card de login