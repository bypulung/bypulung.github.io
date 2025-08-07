const bulanSelect = document.getElementById("bulan"); const checklist = document.getElementById("checklist"); const output = document.getElementById("reportOutput");

function getMonthName(monthIndex) { return new Date(2025, monthIndex, 1).toLocaleString("id-ID", { month: "long" }); }

function populateMonthOptions() { const txs = getRawTransactions(); const bulanUnik = new Set();

txs.forEach(t => { const [y, m] = t.hijriMonth.split("-").map(Number); bulanUnik.add(${y}-${m}); });

const sortedKeys = Array.from(bulanUnik).sort((a, b) => { const [y1, m1] = a.split("-").map(Number); const [y2, m2] = b.split("-").map(Number); return y2 !== y1 ? y2 - y1 : m2 - m1; });

bulanSelect.innerHTML = ""; sortedKeys.forEach(key => { const [year, month] = key.split("-").map(Number); const option = document.createElement("option"); option.value = ${year}-${month}; option.textContent = Bulan ${month} ${year} H; // tampilkan bulan Hijriah bulanSelect.appendChild(option); }); }

function populateChecklist() { const txs = getRawTransactions(); checklist.innerHTML = ""; txs.forEach((t, i) => { const label = document.createElement("label"); const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.value = i; label.appendChild(checkbox); label.append( ${t.hijriDate} - ${t.description}); checklist.appendChild(label); checklist.appendChild(document.createElement("br")); }); }

function generateMonthlyReport() { const [year, month] = bulanSelect.value.split("-").map(Number); const txs = getRawTransactions().filter(t => { const [y, m] = t.hijriMonth.split("-").map(Number); return y === year && m === month; });

const pemasukan = txs.filter(t => t.type === "income"); const pengeluaran = txs.filter(t => t.type === "expense"); const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0); const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0);

let saldoAwal = 0; const all = computeLedger(); const firstIndex = all.findIndex(t => { const [y, m] = t.hijriMonth.split("-").map(Number); return y === year && m === month; }); if (firstIndex > 0) { saldoAwal = all[firstIndex - 1].balanceAfter; }

const saldoAkhir = saldoAwal + totalIn - totalOut;

const lines = [ *📢 Laporan Kas Masjid Al-Huda Bulan ${month} Tahun ${year} H*, \n💰 *Saldo Awal Bulan:* ${saldoAwal.toLocaleString("id-ID")}, \n📥 *Pemasukan:* ];

pemasukan.forEach(p => lines.push(- ${p.description}: ${p.amount.toLocaleString("id-ID")})); lines.push(\n*Total Pemasukan:* ${totalIn.toLocaleString("id-ID")});

lines.push(\n📤 *Pengeluaran:*); pengeluaran.forEach(p => lines.push(- ${p.description}: ${p.amount.toLocaleString("id-ID")})); lines.push(\n*Total Pengeluaran:* ${totalOut.toLocaleString("id-ID")});

lines.push(\n💰 *Saldo Akhir Bulan:* ${saldoAkhir.toLocaleString("id-ID")}); lines.push(\n📅 *Periode:* Bulan ${month} Tahun ${year} H); lines.push(\n📌 Info: https://tanjungbulan.my.id/masjid);

output.value = lines.join("\n"); }

function generateYearlyReport() { const checked = Array.from(checklist.querySelectorAll("input:checked")).map(cb => parseInt(cb.value)); const all = getRawTransactions(); const selected = checked.map(i => all[i]);

const pemasukan = selected.filter(t => t.type === "income"); const pengeluaran = selected.filter(t => t.type === "expense"); const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0); const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0); const saldoAwal = 0; const saldoAkhir = saldoAwal + totalIn - totalOut;

const sortedHijri = selected.map(t => t.hijriDate).sort(); const periode = sortedHijri.length ? ${sortedHijri[0]} - ${sortedHijri.at(-1)} : "-";

const lines = [ *📢 Laporan Tahunan Kas Masjid Al-Huda*, \n\n🟢 *Pemasukan:* ]; pemasukan.forEach(p => lines.push(+ ${p.description}: ${p.amount.toLocaleString("id-ID")})); lines.push(\n*Total Pemasukan:* ${totalIn.toLocaleString("id-ID")});

lines.push(\n🔴 *Pengeluaran:*); pengeluaran.forEach(p => lines.push(- ${p.description}: ${p.amount.toLocaleString("id-ID")})); lines.push(\n*Total Pengeluaran:* ${totalOut.toLocaleString("id-ID")});

lines.push(\n💰 *Saldo Akhir:* ${saldoAkhir.toLocaleString("id-ID")}); lines.push(\n📅 *Periode:* ${periode}); lines.push(\n📌 Info: https://tanjungbulan.my.id/masjid);

output.value = lines.join("\n"); }

function copyReport() { output.select(); document.execCommand("copy"); alert("Teks laporan disalin ke clipboard."); }

function sendToWhatsApp() { const text = encodeURIComponent(output.value); const url = https://wa.me/?text=${text}; window.open(url, '_blank'); }

document.addEventListener("DOMContentLoaded", () => { populateMonthOptions(); populateChecklist(); });

