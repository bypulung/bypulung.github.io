// Ambil bulan dan tahun sekarang
const today = new Date();
const bulanTahun = today.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
document.getElementById("bulanTahun").innerText = bulanTahun;

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfkARu79wTh-XGLZprTfxY4XDQ65F-gE8",
  authDomain: "bank-risma.firebaseapp.com",
  databaseURL: "https://bank-risma-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bank-risma",
  storageBucket: "bank-risma.firebasestorage.app",
  messagingSenderId: "20349077579",
  appId: "1:20349077579:web:6b81da610dc0715289e5ce"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ambil nama dari daftarnama.js
window.onload = function () {
  const select = document.getElementById("nama");
  if (typeof daftarNama !== 'undefined' && daftarNama.putra) {
    daftarNama.putra.forEach(nama => {
      const opt = document.createElement("option");
      opt.value = nama;
      opt.textContent = nama;
      select.appendChild(opt);
    });
  } else {
    console.error("daftarNama.putra tidak ditemukan");
  }

  ambilData(); // setelah nama dimuat, tampilkan tabel
};

// Kirim data
function kirimData() {
  const nama = document.getElementById("nama").value;
  const jumlah = parseInt(document.getElementById("jumlah").value);
  const tipe = document.getElementById("tipe").value;

  if (!nama || isNaN(jumlah)) {
    alert("Nama dan jumlah harus diisi.");
    return;
  }

  const tanggal = firebase.firestore.Timestamp.now();
  const bulan = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  db.collection("tabungan_putra").add({
    nama, jumlah, tipe, tanggal, bulan
  }).then(() => {
    alert("Data berhasil disimpan!");
    document.getElementById("jumlah").value = "";
    ambilData();
  }).catch(error => {
    console.error("Gagal menyimpan data:", error);
    alert("Gagal menyimpan data: " + error.message);
  });
}

// Ambil dan tampilkan data
function ambilData() {
  const bulan = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  db.collection("tabungan_putra")
    .where("bulan", "==", bulan)
    .orderBy("tanggal", "desc")
    .get()
    .then(snapshot => {
      const tbody = document.getElementById("dataTabel");
      tbody.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${data.nama}</td>
          <td>${data.tipe === "tabung" ? formatRupiah(data.jumlah) : "-"}</td>
          <td>${data.tipe === "ambil" ? formatRupiah(data.jumlah) : "-"}</td>
          <td>${data.tanggal.toDate().toLocaleDateString('id-ID')}</td>
          <td>
            <button onclick="editData('${doc.id}', '${data.nama}', ${data.jumlah}, '${data.tipe}')">Edit</button>
            <button onclick="hapusData('${doc.id}')">Hapus</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }).catch(error => {
      console.error("Gagal mengambil data:", error);
    });
}

// Format angka ke Rupiah
function formatRupiah(angka) {
  return 'Rp' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Hapus data
function hapusData(id) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    db.collection("tabungan_putra").doc(id).delete().then(() => {
      alert("Data berhasil dihapus");
      ambilData();
    }).catch(error => {
      console.error("Gagal menghapus data:", error);
      alert("Gagal menghapus data");
    });
  }
}

// Edit data
function editData(id, nama, jumlah, tipe) {
  document.getElementById("nama").value = nama;
  document.getElementById("jumlah").value = jumlah;
  document.getElementById("tipe").value = tipe;

  document.querySelector("button[onclick='kirimData()']").style.display = "none";

  // Hapus tombol update sebelumnya jika ada
  const prevBtn = document.getElementById("updateBtn");
  if (prevBtn) prevBtn.remove();

  const btn = document.createElement("button");
  btn.id = "updateBtn";
  btn.textContent = "Update";
  btn.onclick = function () {
    const newJumlah = parseInt(document.getElementById("jumlah").value);
    const newTipe = document.getElementById("tipe").value;

    db.collection("tabungan_putra").doc(id).update({
      jumlah: newJumlah,
      tipe: newTipe,
      tanggal: firebase.firestore.Timestamp.now()
    }).then(() => {
      alert("Data berhasil diperbarui");
      document.getElementById("jumlah").value = "";
      document.getElementById("tipe").value = "tabung";
      btn.remove();
      document.querySelector("button[onclick='kirimData()']").style.display = "inline-block";
      ambilData();
    }).catch(error => {
      console.error("Gagal update:", error);
      alert("Gagal memperbarui data");
    });
  };

  document.body.appendChild(btn);
          }
