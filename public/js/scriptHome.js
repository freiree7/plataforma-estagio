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

// logout
document.querySelectorAll('a[href="/logout"]').forEach(link => {
    link.addEventListener('click', async (event) => {
        event.preventDefault()
        await fetch('/api/usuarios/logout', {
            method: 'POST',
            credentials: 'include'
        })
        window.location.href = '/login'
    })


// atualiza o avatar da navbar com foto e nome do usuário logado
async function carregarAvatarNav() {
    const avatarCircle = document.querySelector('.avatar-circle')
    const avatarName = document.querySelector('.avatar-name')

    if (!avatarCircle) return

    try {
        const resposta = await fetch('/api/usuarios/perfil', { credentials: 'include' })
        if (!resposta.ok) return

        const perfil = await resposta.json()

        // atualiza o nome no botão do avatar
        if (avatarName && perfil.nome) {
            avatarName.textContent = perfil.nome.split(' ')[0] // só o primeiro nome
        }

        // se tem foto, substitui as iniciais por imagem
        if (perfil.foto_url) {
            avatarCircle.innerHTML = ''
            avatarCircle.style.padding = '0'
            avatarCircle.style.overflow = 'hidden'

            const img = document.createElement('img')
            img.src = perfil.foto_url
            img.alt = perfil.nome || 'Foto de perfil'
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block'
            avatarCircle.appendChild(img)
            return
        }

        // sem foto — atualiza as iniciais
        if (perfil.nome) {
            const parts = perfil.nome.trim().split(/\s+/).filter(Boolean)
            let iniciais = 'PF'
            if (parts.length === 1) iniciais = parts[0].slice(0, 2).toUpperCase()
            else iniciais = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            avatarCircle.textContent = iniciais
        }

    } catch {
        //  não quebra a página se falhar
    }
}

carregarAvatarNav()
})