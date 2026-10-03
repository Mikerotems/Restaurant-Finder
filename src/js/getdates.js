

document.addEventListener("DOMContentLoaded", function () {

    const currentYear = new Date().getFullYear();
    document.querySelector("footer p:nth-of-type(1)").innerHTML = `&copy; ${currentYear} Michael Ademola Oluwarotimi - Nigeria`;

    const lastModified = document.lastModified;
    document.querySelector("footer p:nth-of-type(2)").innerHTML = `Last Modified: ${lastModified}`;
})

