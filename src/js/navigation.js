const navbutton = document.querySelector('#nav-button');
const navBar = document.querySelector('#nav-bar');
navbutton.addEventListener('click', () => {
    navbutton.classList.toggle('show');
    navBar.classList.toggle('show');
});
