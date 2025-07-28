
document.addEventListener("DOMContentLoaded", function () {
  // Load Header
  fetch("/header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
    })
    .catch(err => console.error("Gagal memuat header:", err));

  // Load Footer
  fetch("/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch(err => console.error("Gagal memuat footer:", err));
});
