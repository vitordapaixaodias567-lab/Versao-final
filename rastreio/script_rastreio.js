const API = 'http://localhost:3001';
const usuarioId = localStorage.getItem('usuarioId');
const $ = (id) => document.getElementById(id);

const STATUS = [
    { texto: 'AGUARDANDO', classe: 'aguardando' },
    { texto: 'ENTREGUE', classe: 'andamento' },
    { texto: 'AGENDADO', classe: 'andamento' },
    { texto: 'COLETADO', classe: '' }
];

const formatarData = (texto) => new Date(texto.length === 10 ? texto + 'T12:00' : texto);
const dia = (texto) => formatarData(texto).toLocaleDateString('pt-BR');
const hora = (texto) => formatarData(texto).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

// QR decorativo: o desenho muda conforme o ID do frasco
function desenharQr(codigo) {
    const ctx = $('qr').getContext('2d');
    const tamanho = 29;
    let semente = [...codigo].reduce((soma, c) => soma + c.charCodeAt(0), 1);
    const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tamanho, tamanho);
    ctx.fillStyle = '#000';
    for (let x = 0; x < tamanho; x++) {
        for (let y = 0; y < tamanho; y++) {
            if (aleatorio() > 0.52) ctx.fillRect(x, y, 1, 1);
        }
    }
    [[0, 0], [tamanho - 7, 0], [0, tamanho - 7]].forEach(([x, y]) => {
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 1, 9, 9);
        ctx.fillStyle = '#000'; ctx.fillRect(x, y, 7, 7);
        ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, 5, 5);
        ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + 2, 3, 3);
    });
}

function mostrarLinhaTempo(a) {
    const entrega = a.entrega;
    const confirmado = ['confirmado', 'coletado'].includes(a.status);
    const etapas = [
        { feita: !!entrega, titulo: 'Frasco entregue',
          info: entrega ? `${dia(entrega.em)} · ${hora(entrega.em)}<br>Recebido por ${entrega.nome}` : 'Aguardando entrega' },
        { feita: confirmado, titulo: 'Coleta agendada',
          info: confirmado ? `${a.data ? dia(a.data) : 'Data a definir'}<br>${a.rua}, ${a.numeroresidencia}` : 'Aguardando confirmação' },
        { feita: a.status === 'coletado', titulo: 'Frasco coletado',
          info: a.status === 'coletado' ? 'Retirado pela equipe Bio Óleo' : 'Aguardando coleta' }
    ];

    $('linhaTempo').innerHTML = etapas.map(e => `<div class="etapa ${e.feita ? 'feita' : ''}">
        <span class="ponto"></span><strong>${e.titulo}</strong><small>${e.info}</small></div>`).join('');

    const status = STATUS[etapas.map(e => e.feita).lastIndexOf(true) + 1];
    $('statusTexto').textContent = status.texto;
    $('statusAtual').className = 'status-atual ' + status.classe;
}

async function carregar() {
    if (!usuarioId) {
        window.location.href = '../telas/tela_login.html';
        return;
    }
    try {
        const { data: pessoa } = await axios.get(`${API}/pessoas/${usuarioId}`);
        const { data: lista } = await axios.get(`${API}/agendamentos`, { params: { usuarioId } });

        // ?id=... vem do perfil; sem ele mostra o agendamento mais recente
        const idAg = new URLSearchParams(location.search).get('id');
        const a = lista.find(x => x.id === idAg) || lista[lista.length - 1];

        if (!a) {
            $('rastreio').innerHTML = '<h3 class="titulo">Rastreio e Monitoramento</h3><p>Você ainda não tem agendamentos. <a href="../telas/tela_inicial.html">Agendar coleta</a></p>';
            return;
        }

        const codigo = 'BO-' + a.id.slice(0, 5).toUpperCase();
        ['frascoId', 'frascoId2'].forEach(i => $(i).textContent = codigo);
        $('cliente').textContent = pessoa.nome;
        $('pedido').textContent = '#' + a.id.slice(0, 4).toUpperCase();
        $('volume').textContent = `${a.quantidade} L`;
        $('bairro').textContent = a.bairro;
        $('linkTermo').href = `tela_termo.html?id=${a.id}`;

        desenharQr(codigo);
        mostrarLinhaTempo(a);
    } catch (error) {
        console.error(error);
        $('rastreio').innerHTML = '<h3 class="titulo">Rastreio e Monitoramento</h3><p>Não foi possível carregar o rastreio. Verifique se o servidor está ligado.</p>';
    }
}

carregar();
