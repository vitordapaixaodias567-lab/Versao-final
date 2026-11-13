const API = 'http://localhost:3001';
const id = localStorage.getItem('usuarioId');

const cardDados = document.getElementById('card-dados');
const cardAgendamento = document.getElementById('card-agendamento');
const campos = ['cidade', 'cep', 'rua', 'bairro'];

const blocoEmpresa = document.getElementById('bloco-empresa');
const empresa = document.getElementById('empresa');
const ehEmpresa = () => empresa.checked;

let pessoa = {};

// "Sou uma empresa" mostra o CNPJ e a opção de reservatório
empresa.addEventListener('change', () => {
    blocoEmpresa.style.display = ehEmpresa() ? 'block' : 'none';
    document.getElementById('cnpj').required = ehEmpresa();
});

// Sem CPF = primeiro acesso, mostra o card de dados
function mostrarCard() {
    const primeiro = !pessoa.cpf;
    cardDados.style.display = primeiro ? 'flex' : 'none';
    cardAgendamento.style.display = primeiro ? 'none' : 'flex';
    campos.forEach(c => document.getElementById(c).value = pessoa[c] || '');
    document.getElementById('numero-residencia').value = pessoa.numeroresidencia || '';
    aplicarMascaras();
}

document.getElementById('form-dados').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const { data } = await axios.patch(`${API}/pessoas/${id}`, {
            cpf: document.getElementById('cpf').value,
            telefone: document.getElementById('telefone').value
        });
        pessoa = data;
        mostrarCard();
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao salvar seus dados', true);
    }
});

document.getElementById('form-agendamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const endereco = {};
        campos.forEach(c => endereco[c] = document.getElementById(c).value);
        endereco.numeroresidencia = document.getElementById('numero-residencia').value;

        await axios.post(`${API}/agendamentos`, {
            usuarioId: id,
            cpf: pessoa.cpf,
            telefone: pessoa.telefone,
            ...endereco,
            tipo: ehEmpresa() ? 'empresa' : 'residencial',
            cnpj: ehEmpresa() ? document.getElementById('cnpj').value : '',
            reservatorio: ehEmpresa() && document.getElementById('reservatorio').checked,
            complemento: document.getElementById('complemento').value,
            quantidade: Number(document.getElementById('quantidade').value),
            observacao: document.getElementById('observacao').value,
            status: 'pendente',
            criadoEm: new Date().toISOString()
        });

        // salva o endereço para já vir preenchido na próxima vez
        await axios.patch(`${API}/pessoas/${id}`, endereco);

        mensagemNaProximaPagina('Agendamento enviado com sucesso!');
        window.location.href = 'tela_solicitacoes.html';
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao enviar o forms', true);
    }
});

async function carregarDados() {
    if (!id) {
        window.location.href = 'tela_login.html';
        return;
    }
    try {
        const { data } = await axios.get(`${API}/pessoas/${id}`);
        pessoa = data;
        document.getElementById('boas-vindas').textContent = `Olá, ${data.nome.trim().split(' ')[0]}!`;
        mostrarCard();
    } catch (error) {
        console.error(error);
    }
}

carregarDados();
