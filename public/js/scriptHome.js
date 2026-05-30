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