(() => {
    const body = document.body;
    const openBtn = document.getElementById('openBtn');
    const closeBtn = document.getElementById('closeBtn');
    const overlay = document.getElementById('overlay');
    const drawer = document.getElementById('drawer');

    function setOpen(open) {
        body.classList.toggle('open', open);
        openBtn.setAttribute('aria-expanded', open);
        (open ? closeBtn : openBtn).focus();
    }

    openBtn.addEventListener('click', () => setOpen(true));
    closeBtn.addEventListener('click', () => setOpen(false));
    overlay.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('open')) setOpen(false);
    });

    // Marca automaticamente o item da página atual
    const paginaAtual = location.pathname.split('/').pop();
    drawer.querySelectorAll('nav a').forEach((a) => {
        if (a.getAttribute('href') === paginaAtual) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
        a.addEventListener('click', () => setOpen(false));
    });

    // Sair: limpa o usuário logado (o link já leva para a tela de login)
    document.getElementById('sair').addEventListener('click', () => {
        localStorage.removeItem('usuarioId');
    });
})();
