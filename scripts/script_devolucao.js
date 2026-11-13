const API = 'http://localhost:3001';
const id = localStorage.getItem('usuarioId');
const $ = (i) => document.getElementById(i);
const campos = ['cnpj', 'cep', 'cidade', 'bairro', 'rua', 'numeroresidencia', 'complemento'];

let recipientes = [];
const atual = () => recipientes.find(a => a.id === $('recipiente').value);

// Preenche com o endereço onde o recipiente foi solicitado
const preencher = () => campos.forEach(c => $(c).value = atual()[c] || '');

function mostrarAviso(texto) {
    $('aviso-texto').textContent = texto;
    $('aviso').style.display = 'flex';
}

$('recipiente').addEventListener('change', preencher);

$('form-devolucao').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await axios.patch(`${API}/agendamentos/${atual().id}`, {
            devolucao: {
                condicao: $('condicao').value,
                observacao: $('observacao').value,
                em: new Date().toISOString()
            }
        });
        mensagemNaProximaPagina('Devolução solicitada com sucesso!');
        window.location.href = 'tela_solicitacoes.html';
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao solicitar a devolução', true);
    }
});

async function carregar() {
    if (!id) {
        window.location.href = 'tela_login.html';
        return;
    }
    try {
        const { data: pessoa } = await axios.get(`${API}/pessoas/${id}`);
        $('boas-vindas').textContent = `Olá, ${pessoa.nome.trim().split(' ')[0]}!`;

        const { data } = await axios.get(`${API}/agendamentos`, { params: { usuarioId: id } });
        const solicitados = data.filter(a => a.reservatorio === true);
        recipientes = solicitados.filter(a => !a.devolucao);

        if (!solicitados.length) return mostrarAviso('Sem recipientes solicitados.');
        if (!recipientes.length) return mostrarAviso('A devolução dos seus recipientes já foi solicitada.');

        $('recipiente').replaceChildren(...recipientes.map(a => new Option(`${a.rua}, ${a.numeroresidencia} - ${a.bairro}`, a.id)));
        $('card-devolucao').style.display = 'flex';
        preencher();
    } catch (error) {
        console.error(error);
    }
}

carregar();
