const periodeSelect = document.getElementById("periode"); const checklist = document.getElementById("checklist"); const output = document.getElementById("reportOutput");

function populatePeriodeOptions() { const txs = getRawTransactions(); const periodeKeys = Object.keys(kasData); periodeSelect.innerHTML = ""; periodeKeys.forEach(p => { const option = document.createElement("option"); option.value = p; option.textContent = p; periodeSelect.appendChild(option); }); }

function populateChecklist() { const periode = periodeSelect.value; const txs = kasData[periode] || []; checklist.innerHTML = ""; txs.forEach((t, i) => { const label = document.createElement("label"); const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.value = i; label.appendChild(checkbox); label.append( ${t.hijriDate} - ${t.description}); checklist.appendChild(label); checklist.appendChild(document.createElement("br")); }); }

function generateReport() { const periode = periodeSelect.value; const txs = kasData[periode] || []; const checked = Array.from(checklist.querySelectorAll("input:checked")) .map(cb => parseInt(cb.value)); const selected = checked.map(i => txs[i]);

const pemasukan = selected.filter(t => t.type === "income"); const pengeluaran = selected.filter(t => t.type === "expense"); const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0); const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0); const saldoAwal = 0; const saldoAkhir = saldoAwal + totalIn - totalOut;

const sortedHijri = selected.map(t => t.hijriDate).sort(); const periodeStr = sortedHijri.length ? ${sortedHijri[0]} - ${sortedHijri.at(-1)} : "-";

const lines = [ *📢 Laporan Kas Masjid Al-Huda*, \n🟢 *Pemasukan:* ]; pemasukan.forEach(p => lines.push(+ ${p.description}: ${p.amount.toLocaleString("id-ID")})); lines.push(\n*Total Pemasukan:* ${totalIn.toLocaleString("id-ID")});

lines.push(\n🔴 *Pengeluaran:*); pengeluaran.forEach(p => lines.push(- ${p.description}: ${p.amount.toLocaleString("id-ID")})); lines.push(\n*Total Pengeluaran:* ${totalOut.toLocaleString("id-ID")});

lines.push(\n💰 *Saldo Akhir:* ${saldoAkhir.toLocaleString("id-ID")}); lines.push(\n📅 *Periode:* ${periodeStr}); lines.push(\n📌 Info: https://tanjungbulan.my.id/masjid);

output.value = lines.join("\n"); }

function copyReport() { output.select(); document.execCommand("copy"); alert("Teks laporan disalin ke clipboard."); }

function sendToWhatsApp() { const text = encodeURIComponent(output.value); const url = https://wa.me/?text=${text}; window.open(url, '_blank'); }

document.addEventListener("DOMContentLoaded", () => { populatePeriodeOptions(); periodeSelect.addEventListener("change", populateChecklist); populateChecklist(); });

