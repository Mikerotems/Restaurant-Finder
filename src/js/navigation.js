const navbutton = document.querySelector('#nav-button');
const navBar = document.querySelector('#nav-bar');

const closeNav = () => {
    navbutton?.classList.remove('show');
    navBar?.classList.remove('show');
};

const openNav = () => {
    navbutton?.classList.add('show');
    navBar?.classList.add('show');
};

navbutton?.addEventListener('click', () => {
    const isOpen = navBar?.classList.contains('show');
    if (isOpen) {
        closeNav();
    } else {
        openNav();
    }
});

navbutton?.addEventListener('focus', openNav);

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!navBar?.contains(target) && !navbutton?.contains(target)) {
        closeNav();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeNav();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        closeNav();
    }
});
