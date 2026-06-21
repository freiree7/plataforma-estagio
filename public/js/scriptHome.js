const profileMenuButton = document.getElementById("profileMenuButton");
const profileMenu = document.getElementById("profileMenu");

if (profileMenuButton && profileMenu) {
    const closeMenu = () => {
        profileMenu.classList.remove("open");
        profileMenuButton.setAttribute("aria-expanded", "false");
        profileMenu.setAttribute("aria-hidden", "true");
    };

    const openMenu = () => {
        profileMenu.classList.add("open");
        profileMenuButton.setAttribute("aria-expanded", "true");
        profileMenu.setAttribute("aria-hidden", "false");
    };

    profileMenuButton.addEventListener("click", () => {
        const isOpen = profileMenu.classList.contains("open");
        if (isOpen) {
            closeMenu();
            return;
        }
        openMenu();
    });

    document.addEventListener("click", (event) => {
        if (!profileMenu.contains(event.target) && !profileMenuButton.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}

// Logout
document.querySelectorAll('a[href="/logout"]').forEach(link => {
    link.addEventListener('click', async (event) => {
        event.preventDefault()
        await fetch('/api/usuarios/logout', {
            method: 'POST',
            credentials: 'include'
        })
        window.location.href = '/login'
    })
})

// Atualiza avatar da navbar com foto e nome do usuário logado
async function carregarAvatarNav() {
    const avatarCircle = document.querySelector('.avatar-circle')
    const avatarName = document.querySelector('.avatar-name')

    if (!avatarCircle) return

    try {
        let perfil = null
        let fotoUrl = null
        let nomeExibido = null

        const respostaAluno = await fetch('/api/usuarios/perfil', { credentials: 'include' })

        if (respostaAluno.ok) {
            const dados = await respostaAluno.json()

            // GET /api/usuarios/perfil retorna 200 para qualquer usuário autenticado
            // por isso é necessário checar o campo tipo
            if (dados.tipo === 'empresa') {
                // Busca perfil específico da empresa
                const respostaEmpresa = await fetch('/api/usuarios/empresa/perfil', { credentials: 'include' })
                if (respostaEmpresa.ok) {
                    perfil = await respostaEmpresa.json()
                    fotoUrl = perfil.logo_url || null
                    nomeExibido = perfil.nome_fantasia || perfil.nome || ''
                }
            } else {
                perfil = dados
                fotoUrl = perfil.foto_url || null
                nomeExibido = perfil.nome?.split(' ')[0] || ''
            }
        }

        if (!perfil) return

        // Atualiza nome
        if (avatarName) avatarName.textContent = nomeExibido

        // Se tem foto ou logo, substitui as iniciais por imagem
        if (fotoUrl) {
            avatarCircle.innerHTML = ''
            avatarCircle.style.padding = '0'
            avatarCircle.style.overflow = 'hidden'

            const img = document.createElement('img')
            img.src = fotoUrl
            img.alt = nomeExibido
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block'
            avatarCircle.appendChild(img)
            return
        }

        // Sem foto — atualiza iniciais
        if (perfil.nome) {
            const parts = perfil.nome.trim().split(/\s+/).filter(Boolean)
            let iniciais = 'PF'
            if (parts.length === 1) iniciais = parts[0].slice(0, 2).toUpperCase()
            else iniciais = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            avatarCircle.textContent = iniciais
        }

    } catch {
        // Silencioso — não quebra a página se falhar
    }
}

carregarAvatarNav()
