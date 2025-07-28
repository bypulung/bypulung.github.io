const bulanFiles = [        
          
  "september2025.json",        
  "agustus2025.json"        
];        
        
const bulanMap = {        
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,        
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11,        
  desember: 12        
};        
        
const toNum = (name) => {        
  const nama = name.replace('.json', '');        
  const bulanStr = nama.slice(0, -4);        
  const tahun = parseInt(nama.slice(-4));        
  const bulan = bulanMap[bulanStr] || 0;        
  return tahun * 100 + bulan;        
};        
        
const sortedFiles = [...bulanFiles].sort((a, b) => toNum(a) - toNum(b));        
const reversedFiles = [...sortedFiles].reverse();        
const formatRupiah = (num) => num.toLocaleString('id-ID');        
        
let rekapData = {};        
let saldoTerakhir = {};        
let dataBulananTersimpan = {};        
        
function updateRekap(nama, jenis, tabungan, penarikan) {        
  if (!rekapData[nama]) {        
    rekapData[nama] = { jenis, tabungan: 0, penarikan: 0 };        
  }        
  rekapData[nama].tabungan += tabungan;        
  rekapData[nama].penarikan += penarikan;        
}        
        
function renderTabelRekap() {        
  const container = document.getElementById("rekap-tabungan");        
  let totalPutra = 0, totalPutri = 0, totalTabungan = 0, totalTarik = 0, totalSaldo = 0;        
        
  const dataArray = Object.entries(rekapData).map(([nama, val]) => {        
    const saldo = val.tabungan - val.penarikan;        
    return { nama, ...val, saldo };        
  });        
        
  dataArray.sort((a, b) => b.saldo - a.saldo);        
        
  let rows = '';        
  dataArray.forEach(({ nama, jenis, tabungan, penarikan, saldo }) => {        
    if (jenis === "putra") totalPutra += tabungan;        
    else totalPutri += tabungan;        
    totalTabungan += tabungan;        
    totalTarik += penarikan;        
    totalSaldo += saldo;        
        
    rows += `<tr>        
      <td>${nama}</td>        
      <td>${formatRupiah(tabungan)}</td>        
      <td>${formatRupiah(penarikan)}</td>        
      <td><span style="color:green">${formatRupiah(saldo)}</span></td>        
    </tr>`;        
  });        
        
  container.innerHTML = `        
    <table border="1" cellspacing="0" cellpadding="5">        
      <thead>        
        <tr>        
          <th>Nama</th>        
          <th>Tabungan</th>        
          <th>Penarikan</th>        
          <th>Saldo</th>        
        </tr>        
      </thead>        
      <tbody>${rows}</tbody>        
    </table>        
    <p><br/>        
      Tabungan Putra: ${formatRupiah(totalPutra)}<br/>        
      Tabungan Putri: ${formatRupiah(totalPutri)}<br/>        
      Jumlah Tabungan: ${formatRupiah(totalTabungan)}<br/>        
      Jumlah Penarikan: ${formatRupiah(totalTarik)}<br/>        
      Sisa Saldo: <span style="color:green">${formatRupiah(totalSaldo)}</span>        
    </p><br/>        
    <hr/>        
  `;        
}        
        
function formatNamaBulan(namaFile) {        
  const nama = namaFile.replace('.json', '');        
  const match = nama.match(/([a-z]+)(\d+)/i);        
  if (!match) return namaFile;        
  const [_, bulan, tahun] = match;        
  return bulan.charAt(0).toUpperCase() + bulan.slice(1) + ' ' + tahun;        
}        
        
function renderBulananSemua() {        
  const container = document.getElementById("tabungan-bulanan");        
        
  reversedFiles.forEach(namaFile => {        
    const data = dataBulananTersimpan[namaFile];        
    if (!data) return;        
        
    const combinedData = [];        
    let totalPutra = 0, totalPutri = 0, totalTabungan = 0, totalTarik = 0;        
        
    ["putra", "putri"].forEach(jenis => {        
      data[jenis]?.forEach(item => {        
        combinedData.push({ ...item, jenis });        
        if (jenis === "putra") totalPutra += item.tabungan;        
        else totalPutri += item.tabungan;        
        totalTabungan += item.tabungan;        
        totalTarik += item.penarikan;        
      });        
    });        
        
    combinedData.sort((a, b) => b.tabungan - a.tabungan);        
        
    let rows = '';        
    combinedData.forEach(({ nama, tabungan, penarikan }) => {        
      rows += `<tr>        
        <td>${nama}</td>        
        <td>${formatRupiah(tabungan)}</td>        
        <td>${formatRupiah(penarikan)}</td>        
      </tr>`;        
    });        
        
    container.innerHTML += `        
      <h3>${formatNamaBulan(namaFile)}</h3>        
      <table border="1" cellspacing="0" cellpadding="5">        
        <thead>        
          <tr>        
            <th>Nama</th>        
            <th>Tabungan</th>        
            <th>Penarikan</th>        
          </tr>        
        </thead>        
        <tbody>${rows}</tbody>        
      </table>        
      <p><br/>        
        Tabungan Putra: ${formatRupiah(totalPutra)}<br/>        
        Tabungan Putri: ${formatRupiah(totalPutri)}<br/>        
        Jumlah Tabungan: ${formatRupiah(totalTabungan)}<br/>        
        Jumlah Penarikan: ${formatRupiah(totalTarik)}        
      </p><br/>        
      <hr/>        
    `;        
  });        
}        
        
async function loadSemua() {        
  for (let namaFile of sortedFiles) {        
    try {        
      const res = await fetch(`data/${namaFile}`);        
      if (!res.ok) continue;        
      const data = await res.json();        
      if (!data.putra && !data.putri) continue;        
      dataBulananTersimpan[namaFile] = data;        
    } catch (e) {        
      console.warn(`Gagal membaca ${namaFile}`);        
    }        
  }        
        
  for (let namaFile of sortedFiles) {        
    const data = dataBulananTersimpan[namaFile];        
    if (!data) continue;        
        
    ["putra", "putri"].forEach(jenis => {        
      data[jenis]?.forEach(item => {        
        const { nama, tabungan, penarikan } = item;        
        const saldoLalu = saldoTerakhir[nama] || 0;        
        const saldoKini = saldoLalu + tabungan - penarikan;        
        saldoTerakhir[nama] = saldoKini;        
        updateRekap(nama, jenis, tabungan, penarikan);        
      });        
    });        
  }        
        
  renderBulananSemua();        
  renderTabelRekap();        
}        
        
loadSemua();        


function salinRekapTotal() {
  // Ambil nama file terbaru dari reversedFiles
  const namaFileTerbaru = reversedFiles[0];
  const dataTerbaru = dataBulananTersimpan[namaFileTerbaru];
  if (!dataTerbaru) {
    alert("Data bulan terbaru belum tersedia.");
    return;
  }

  const bulanTahun = formatNamaBulan(namaFileTerbaru);

  // Persiapan data bulanan terbaru
  const combinedDataBulan = [];
  let totalPutraBulan = 0, totalPutriBulan = 0, totalTabunganBulan = 0, totalTarikBulan = 0;

  ["putra", "putri"].forEach(jenis => {
    dataTerbaru[jenis]?.forEach(item => {
      combinedDataBulan.push({ ...item, jenis });
      if (jenis === "putra") totalPutraBulan += item.tabungan;
      else totalPutriBulan += item.tabungan;
      totalTabunganBulan += item.tabungan;
      totalTarikBulan += item.penarikan;
    });
  });

  combinedDataBulan.sort((a, b) => (b.tabungan - b.penarikan) - (a.tabungan - a.penarikan));

  let teks = `💰 *Tabungan Bulan ${bulanTahun}*\n`;
  combinedDataBulan.forEach(({ nama, tabungan, penarikan }) => {
    const simbol = tabungan > 0 ? '➕' : '➖';
    const nilai = tabungan > 0 ? tabungan : penarikan;
    teks += `${nama} ${simbol} ${formatRupiah(nilai)}\n`;
  });

  teks += `\n💡 *${bulanTahun}*\n`;
  teks += `👨Tabungan Putra: ${formatRupiah(totalPutraBulan)}\n`;
  teks += `👧Tabungan Putri: ${formatRupiah(totalPutriBulan)}\n`;
  teks += `🤑Jumlah Tabungan: ${formatRupiah(totalTabunganBulan)}\n`;
  teks += `🏧Jumlah Penarikan: ${formatRupiah(totalTarikBulan)}\n\n`;

  // Rekap Total
  const dataArray = Object.entries(rekapData).map(([nama, val]) => {
    const saldo = val.tabungan - val.penarikan;
    return { nama, ...val, saldo };
  });

  dataArray.sort((a, b) => b.saldo - a.saldo);

  teks += `🏦 *Total Tabungan BANK RISMA*\n`;
  dataArray.forEach((item, idx) => {
    teks += `${idx + 1}. ${item.nama} ${formatRupiah(item.saldo)}\n`;
  });

  let totalPutra = 0, totalPutri = 0, totalTabungan = 0, totalPenarikan = 0, sisa = 0;

  dataArray.forEach(({ jenis, tabungan, penarikan, saldo }) => {
    if (jenis === "putra") totalPutra += tabungan;
    else totalPutri += tabungan;
    totalTabungan += tabungan;
    totalPenarikan += penarikan;
    sisa += saldo;
  });

  teks += `\n💡 *Rekap Total*\n`;
  teks += `👨Tabungan Putra: ${formatRupiah(totalPutra)}\n`;
  teks += `👧Tabungan Putri: ${formatRupiah(totalPutri)}\n`;
  teks += `🤑Total Tabungan: ${formatRupiah(totalTabungan)}\n`;
  teks += `🏧Total Penarikan: ${formatRupiah(totalPenarikan)}\n`;
  teks += `💲Sisa Saldo: ${formatRupiah(sisa)}\n\n`;

  teks += `> 📌Tabungan di urutkan otomatis dari yang terbanyak\n`;
  teks += `> 📌Tidak boleh diambil kecuali kondisi darurat atau puasa Ramadhan.\n`;
  teks += `> 📌Tidak boleh dipinjam untuk keperluan pribadi\n`;
  teks += `> 📌Uang akan dikelola secara bijak demi kemakmuran bersama\n\n`;
  teks += `Info selengkapnya👉 https://tanjungbulan.my.id/bank-risma`;

  navigator.clipboard.writeText(teks).then(() => {
    alert("Rekap tabungan lengkap disalin ke clipboard!");
  });
}
