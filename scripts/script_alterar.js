const API = 'http://localhost:3001';
const id = localStorage.getItem('usuarioId');

const campos = ['cpf', 'telefone', 'idade', 'cidade', 'cep', 'rua', 'bairro'];

async function carregarDados() {
    if (!id) {
        window.location.href = 'tela_login.html';
        return;
    }

    try {
        const { data } = await axios.get(`${API}/pessoas/${id}`);
        document.getElementById('boas-vindas').textContent = `Olá, ${data.nome.trim().split(' ')[0]}!`;
        campos.forEach(c => document.getElementById(c).value = data[c] || '');
        document.getElementById('numero-residencia').value = data.numeroresidencia || '';
        aplicarMascaras();
    } catch (error) {
        console.error(error);
    }
}

//Inicio Card de alterar cadastro
document.getElementById('form-alterar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loading = document.getElementById('loading');
    try {
        loading.style.display = 'block';

        const dados = {};
        campos.forEach(c => dados[c] = document.getElementById(c).value);
        dados.numeroresidencia = document.getElementById('numero-residencia').value;

        await axios.patch(`${API}/pessoas/${id}`, dados);

        mensagemNaProximaPagina('Dados atualizados com sucesso!');
        window.location.href = 'tela_perfil.html';
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao salvar as alterações', true);
    } finally {
        loading.style.display = 'none';
    }
});
//Fim do card de alterar cadastro
carregarDados();
