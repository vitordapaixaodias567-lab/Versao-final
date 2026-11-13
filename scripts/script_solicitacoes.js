const API = 'http://localhost:3001';
const id = localStorage.getItem('usuarioId');
const lista = document.getElementById('lista-agendamentos');

// evita que texto digitado pelo usuário seja interpretado como HTML
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 'AAAA-MM-DD' ou data ISO vira dd/mm/aaaa
const formatarData = (texto) => texto ? new Date(texto.length === 10 ? texto + 'T12:00' : texto).toLocaleDateString('pt-BR') : null;

//Inicio card de agendamentos feitos
function montarCard(a) {
    const status = a.status ?? 'pendente';
    const pendente = status === 'pendente';
    const classe = pendente ? '' : status === 'cancelado' ? 'ag-card--cancelado' : 'ag-card--confirmado';
    const rotulo = pendente ? 'Aguardando confirmação' : status.charAt(0).toUpperCase() + status.slice(1);
    return `<li class="ag-card ${classe}">
        <div class="ag-topo">
            <h3>Coleta: ${formatarData(a.data) || 'data a definir'}</h3>
            <span class="ag-status">${esc(rotulo)}</span>
        </div>
        <p>${a.tipo === 'empresa' ? 'Empresa' : 'Coleta domiciliar'}${a.quantidade ? ' - ' + esc(a.quantidade) + ' litros' : ''}</p>
        <p>${esc([a.rua, a.numeroresidencia].filter(Boolean).join(', '))} - ${esc([a.bairro, a.cidade].filter(Boolean).join(', '))}</p>
        <p>CEP: ${esc(a.cep)}</p>
        ${a.reservatorio ? `<p>Reservatório solicitado${a.devolucao ? ' - devolução solicitada em ' + formatarData(a.devolucao.em) : ''}</p>` : ''}
        ${a.criadoEm ? `<p class="ag-feito">Agendado em ${formatarData(a.criadoEm)}</p>` : ''}
        <div class="ag-acoes">
            <a class="btn-rastrear" href="../rastreio/tela_rastreio.html?id=${encodeURIComponent(a.id)}">Rastrear</a>
            ${pendente ? `<button class="btn-cancelar" data-id="${esc(a.id)}">Cancelar</button>` : ''}
        </div>
    </li>`;
}

async function carregarAgendamentos() {
    try {
        const { data } = await axios.get(`${API}/agendamentos`, { params: { usuarioId: id } });
        lista.innerHTML = data.length
            ? data.map(montarCard).join('')
            : '<li class="ag-vazio">Nenhum agendamento ainda. <a href="tela_inicial.html">Agendar coleta</a></li>';
    } catch (error) {
        console.error(error);
        lista.innerHTML = '<li class="ag-vazio">Não foi possível carregar seus agendamentos.</li>';
    }
}

lista.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-cancelar');
    if (!btn || !confirm('Deseja cancelar este agendamento?')) return;
    try {
        await axios.patch(`${API}/agendamentos/${btn.dataset.id}`, { status: 'cancelado' });
        mostrarMensagem('Agendamento cancelado');
        carregarAgendamentos();
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao cancelar o agendamento', true);
    }
});
//Fim do card de agendamentos feitos

async function carregarNome() {
    try {
        const { data: p } = await axios.get(`${API}/pessoas/${id}`);
        document.getElementById('boas-vindas').textContent = `Olá, ${p.nome.trim().split(' ')[0]}!`;
    } catch (error) {
        console.error(error);
    }
}

if (!id) {
    window.location.href = 'tela_login.html';
} else {
    carregarNome();
    carregarAgendamentos();
}
