const periodeSelect = document.getElementById("periode");
const checklist = document.getElementById("checklist");
const output = document.getElementById("reportOutput");

function populatePeriodeOptions() {
  const periodeKeys = Object.keys(kas.raw);
  periodeSelect.innerHTML = "";
  periodeKeys.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    periodeSelect.appendChild(option);
  });
}

function populateChecklist() {
  const periode = periodeSelect.value;
  const txs = kas.raw[periode] || [];
  checklist.innerHTML = "";
  txs.forEach((t, i) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = i;
    label.appendChild(checkbox);
    label.append(` ${t.date} - ${t.description}`);
    checklist.appendChild(label);
    checklist.appendChild(document.createElement("br"));
  });
}

function generateReport() {
  const periode = periodeSelect.value;
  const txs = kas.raw[periode] || [];

  const checked = Array.from(checklist.querySelectorAll("input:checked"))
    .map(cb => parseInt(cb.value));

  if (checked.length === 0) {
    output.value = "❗ Harap pilih setidaknya satu transaksi.";
    return;
  }

  const selected = checked.map(i => txs[i]);

  // Urutkan berdasarkan tanggal
  const sortedSelected = [...selected].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startDate = new Date(sortedSelected[0].date);
  const endDate = new Date(sortedSelected.at(-1).date);

  // Ambil semua transaksi dari tahun-tahun sebelumnya
  const allYears = Object.keys(kas.raw).sort(); // urutkan "1447H", "1448H", dst
  const currentIndex = allYears.indexOf(periode);
  let saldoAwal = 0;

  // Hitung saldo akhir dari tahun-tahun sebelum tahun terpilih
  for (let i = 0; i < currentIndex; i++) {
    const txsSebelumnya = kas.raw[allYears[i]];
    saldoAwal += txsSebelumnya.reduce((s, t) =>
      s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);
  }

  // Tambahkan transaksi dalam periode sekarang sebelum tanggal pertama transaksi terpilih
  saldoAwal += txs
    .filter(t => new Date(t.date) < startDate)
    .reduce((s, t) =>
      s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);

  // Hitung pemasukan dan pengeluaran yang dipilih
  const pemasukan = selected.filter(t => t.type === "income");
  const pengeluaran = selected.filter(t => t.type === "expense");
  const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0);
  const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0);

  const saldoAkhir = saldoAwal + totalIn - totalOut;

  const lines = [];

  lines.push(`*📢 Laporan Kas Masjid Al-Huda*`);
  lines.push(`\n💰 *Saldo Awal:* *${saldoAwal.toLocaleString("id-ID")}*`);

  lines.push(`\n🟢 *Pemasukan:*`);
  if (pemasukan.length === 0) {
    lines.push(`(Tidak ada)`);
  } else {
    pemasukan.forEach(p =>
      lines.push(`+ ${p.description}: ${p.amount.toLocaleString("id-ID")}`)
    );
  }
  lines.push(`\n*Total Pemasukan:* ${totalIn.toLocaleString("id-ID")}`);

  lines.push(`\n🔴 *Pengeluaran:*`);
  if (pengeluaran.length === 0) {
    lines.push(`(Tidak ada)`);
  } else {
    pengeluaran.forEach(p =>
      lines.push(`- ${p.description}: ${p.amount.toLocaleString("id-ID")}`)
    );
  }
  lines.push(`\n*Total Pengeluaran:* ${totalOut.toLocaleString("id-ID")}`);

  lines.push(`\n💰 *Saldo Akhir:* *${saldoAkhir.toLocaleString("id-ID")}*`);

  // 🆕 Bagian ini menentukan format tanggal sesuai jumlah transaksi
  if (sortedSelected.length === 1) {
    lines.push(`\n📅 ${formatDate(startDate)}`);
  } else {
    lines.push(`\n📅 ${formatDate(startDate)} - ${formatDate(endDate)}`);
  }

  lines.push(`\n📌 Info: https://tanjungbulan.my.id/masjid`);

  output.value = lines.join("\n");
}


function copyReport() {
  output.select();
  document.execCommand("copy");
  alert("Teks laporan disalin ke clipboard.");
}

function sendToWhatsApp() {
  const text = encodeURIComponent(output.value);
  const url = `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populatePeriodeOptions();
  periodeSelect.addEventListener("change", populateChecklist);
  populateChecklist();
});