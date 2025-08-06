function formatAngka(num) {
  return num.toLocaleString("id-ID");
}

function getMonthName(month) {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return bulan[month];
}

// Ambil laporan bulanan
function generateMonthlyReport(month, year) {
  const data = getRawTransactions().filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  if (data.length === 0) return "*Tidak ada transaksi pada bulan ini.*";

  const bulanNama = getMonthName(month);
  const periodeTanggal = data.map(tx => tx.date).sort();
  const saldoAwal = hitungSaldoSebelum(month, year);
  let saldoAkhir = saldoAwal;

  let pemasukan = [];
  let pengeluaran = [];
  let totalMasuk = 0;
  let totalKeluar = 0;

  data.forEach(tx => {
    if (tx.type === "income") {
      pemasukan.push(`- ${tx.description}: ${formatAngka(tx.amount)}`);
      totalMasuk += tx.amount;
      saldoAkhir += tx.amount;
    } else {
      pengeluaran.push(`- ${tx.description}: ${formatAngka(tx.amount)}`);
      totalKeluar += tx.amount;
      saldoAkhir -= tx.amount;
    }
  });

  const laporan = [
    `🕌 *Laporan Kas Masjid Al-Huda Bulan ${bulanNama} ${year}*`,
    ``,
    `💰 *Saldo Awal Bulan:* ${formatAngka(saldoAwal)}`,
    ``,
    `📥 *Pemasukan:*`,
    pemasukan.length > 0 ? pemasukan.join("\n") : "_(Tidak ada)_",
    ``,
    `*Total Pemasukan:* ${formatAngka(totalMasuk)}`,
    ``,
    `📤 *Pengeluaran:*`,
    pengeluaran.length > 0 ? pengeluaran.join("\n") : "_(Tidak ada)_",
    ``,
    `*Total Pengeluaran:* ${formatAngka(totalKeluar)}`,
    ``,
    `💰 *Saldo Akhir Bulan:* ${formatAngka(saldoAkhir)}`,
    ``,
    `📅 *Periode:* ${periodeTanggal[0]} s.d. ${periodeTanggal.at(-1)}`,
    ``,
    `📌 Info: https://tanjungbulan.my.id/masjid`
  ];

  return laporan.join("\n");
}

// Ambil saldo sebelum bulan tertentu
function hitungSaldoSebelum(month, year) {
  const raw = getRawTransactions();
  let saldo = 0;
  raw.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() < month)) {
      if (tx.type === "income") saldo += tx.amount;
      else saldo -= tx.amount;
    }
  });
  return saldo;
}

// Laporan tahunan saat Idul Fitri (Hijriah tahun input)
function generateAnnualReport(hijriYear, labelPeriode = "1 Syawal") {
  const data = getRawTransactions(); // semua
  if (data.length === 0) return "*Belum ada transaksi.*";

  // Estimasi: ambil transaksi setahun terakhir (365 hari terakhir dari hari ini)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 365);

  const transaksi = data.filter(tx => new Date(tx.date) >= cutoffDate);

  let saldoAwal = 0;
  data.forEach(tx => {
    const d = new Date(tx.date);
    if (d < cutoffDate) {
      saldoAwal += (tx.type === "income" ? tx.amount : -tx.amount);
    }
  });

  let pemasukan = [];
  let pengeluaran = [];
  let totalMasuk = 0;
  let totalKeluar = 0;
  let saldoAkhir = saldoAwal;

  transaksi.forEach(tx => {
    if (tx.type === "income") {
      pemasukan.push(`+ ${tx.description}: ${formatAngka(tx.amount)}`);
      totalMasuk += tx.amount;
      saldoAkhir += tx.amount;
    } else {
      pengeluaran.push(`- ${tx.description}: ${formatAngka(tx.amount)}`);
      totalKeluar += tx.amount;
      saldoAkhir -= tx.amount;
    }
  });

  const laporan = [
    `📢 *Laporan Tahunan Kas Masjid Al-Huda ${hijriYear} H*`,
    ``,
    `💰 *Saldo Awal:* ${formatAngka(saldoAwal)}`,
    ``,
    `🟢 *Pemasukan:*`,
    pemasukan.length > 0 ? pemasukan.join("\n") : "_(Tidak ada)_",
    ``,
    `*Total Pemasukan:* ${formatAngka(totalMasuk)}`,
    ``,
    `🔴 *Pengeluaran:*`,
    pengeluaran.length > 0 ? pengeluaran.join("\n") : "_(Tidak ada)_",
    ``,
    `*Total Pengeluaran:* ${formatAngka(totalKeluar)}`,
    ``,
    `💳 *Saldo Akhir:* ${formatAngka(saldoAkhir)}`,
    ``,
    `📅 *Periode:* ${labelPeriode} ${hijriYear} H`,
    ``,
    `📌 Info: https://tanjungbulan.my.id/masjid`
  ];

  return laporan.join("\n");
}