
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

  const today = new Date();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const namaBulan = monthNames[today.getMonth()] + " " + today.getFullYear();
  document.getElementById("bulanTahun").innerText = namaBulan;

  const namaSelect = document.getElementById('nama');

  // Pastikan daftar nama sudah dimuat
  if (typeof daftarnama !== "undefined" && daftarnama.putra) {
    daftarnama.putra.forEach(nama => {
      const option = document.createElement('option');
      option.value = nama;
      option.text = nama;
      namaSelect.appendChild(option);
    });
  } else {
    alert("Data nama belum dimuat. Pastikan file daftarnama.js diload sebelum script ini.");
  }

  // Kirim data
  function kirimData() {
    const nama = document.getElementById('nama').value;
    const tipe = document.getElementById('tipe').value;
    const jumlah = parseInt(document.getElementById('jumlah').value);

    if (!nama || isNaN(jumlah) || jumlah <= 0) {
      alert("Pastikan semua data diisi dengan benar.");
      return;
    }

    const data = {
      nama,
      gender: "putra",
      timestamp: firebase.firestore.Timestamp.now()
    };

    if (tipe === "tabung") {
      data.tabungan = jumlah;
    } else {
      data.penarikan = jumlah;
    }

    db.collection(namaBulan).add(data)
      .then(() => {
        alert("Data berhasil disimpan!");
        document.getElementById('jumlah').value = '';
      })
      .catch((error) => {
        alert("Gagal menyimpan data: " + error);
      });
  }

  // Tampilkan data
  const collectionRef = db.collection(namaBulan)
    .where("gender", "==", "putra")
    .orderBy("timestamp", "desc");

  collectionRef.onSnapshot((querySnapshot) => {
    const tbody = document.getElementById("dataTabel");
    tbody.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${data.nama}</td>
        <td>${data.tabungan || "-"}</td>
        <td>${data.penarikan || "-"}</td>
        <td>${new Date(data.timestamp?.toDate?.()).toLocaleDateString('id-ID')}</td>
        <td>
          <button onclick="editData('${doc.id}')">Edit</button>
          <button onclick="hapusData('${doc.id}')">Hapus</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  });

  function hapusData(id) {
    if (confirm("Yakin ingin menghapus data ini?")) {
      db.collection(namaBulan).doc(id).delete()
        .then(() => alert("Data berhasil dihapus"))
        .catch((error) => alert("Gagal menghapus: " + error));
    }
  }

  function editData(id) {
    const newTabungan = prompt("Masukkan nilai tabungan baru (biarkan kosong jika tidak mengubah):");
    const newPenarikan = prompt("Masukkan nilai penarikan baru (biarkan kosong jika tidak mengubah):");

    const updateData = {};
    if (newTabungan !== "") updateData.tabungan = Number(newTabungan);
    if (newPenarikan !== "") updateData.penarikan = Number(newPenarikan);

    if (Object.keys(updateData).length > 0) {
      db.collection(namaBulan).doc(id).update(updateData)
        .then(() => alert("Data berhasil diperbarui"))
        .catch((error) => alert("Gagal memperbarui: " + error));
    }
  }
