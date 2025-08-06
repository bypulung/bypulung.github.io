    const bulanSelect = document.getElementById("bulan");
    const checklist = document.getElementById("checklist");
    const output = document.getElementById("reportOutput");

    function getMonthName(monthIndex) {
      return new Date(2025, monthIndex, 1).toLocaleString("id-ID", { month: "long" });
    }

    function populateMonthOptions() {
      for (let i = 0; i < 12; i++) {
        const option = document.createElement("option");
        option.value = i + 1;
        option.textContent = getMonthName(i);
        bulanSelect.appendChild(option);
      }
    }

    function populateChecklist() {
      const txs = getRawTransactions();
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

    function generateMonthlyReport() {
      const month = parseInt(bulanSelect.value);
      const year = 2025;
      const txs = getRawTransactions().filter(t => new Date(t.date).getMonth() + 1 === month);
      const bulanNama = getMonthName(month - 1);

      const pemasukan = txs.filter(t => t.type === "income");
      const pengeluaran = txs.filter(t => t.type === "expense");
      const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0);
      const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0);

      let saldoAwal = 0;
      const all = computeLedger();
      const firstOfMonth = all.find(t => new Date(t.date).getMonth() + 1 === month);
      if (firstOfMonth) {
        saldoAwal = firstOfMonth.balanceAfter - (firstOfMonth.type === "income" ? firstOfMonth.amount : -firstOfMonth.amount);
      }
      const saldoAkhir = saldoAwal + totalIn - totalOut;

      const lines = [
        `🕌 Laporan Kas Masjid Al-Huda Bulan ${bulanNama} ${year}`,
        `\n💰 Saldo Awal Bulan: ${saldoAwal.toLocaleString("id-ID")}`,
        `\n📥 Pemasukan:`
      ];
      pemasukan.forEach(p => lines.push(`- ${p.description}: ${p.amount.toLocaleString("id-ID")}`));
      lines.push(`\nTotal Pemasukan : ${totalIn.toLocaleString("id-ID")}`);
      lines.push(`\n📤 Pengeluaran:`);
      pengeluaran.forEach(p => lines.push(`- ${p.description}: ${p.amount.toLocaleString("id-ID")}`));
      lines.push(`\nTotal pengeluaran: ${totalOut.toLocaleString("id-ID")}`);
      lines.push(`\n💰 Saldo akhir bulan: ${saldoAkhir.toLocaleString("id-ID")}`);
      lines.push(`\n📅Periode: ${bulanNama} ${year}`);
      lines.push(`\n📌 Info: https://tanjungbulan.my.id/masjid`);

      output.value = lines.join("\n");
    }

    function generateYearlyReport() {
      const checked = Array.from(checklist.querySelectorAll("input:checked"))
        .map(cb => parseInt(cb.value));
      const all = getRawTransactions();
      const selected = checked.map(i => all[i]);
      const pemasukan = selected.filter(t => t.type === "income");
      const pengeluaran = selected.filter(t => t.type === "expense");
      const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0);
      const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0);
      const saldoAwal = 0;
      const saldoAkhir = saldoAwal + totalIn - totalOut;

      const lines = [
        `📢 Laporan Tahunan Kas Masjid Al-Huda 1448 H`,
        `\n💰Saldo Awal: ${saldoAwal.toLocaleString("id-ID")}`,
        `\n🟢 Pemasukan:`
      ];
      pemasukan.forEach(p => lines.push(`+ ${p.description}: ${p.amount.toLocaleString("id-ID")}`));
      lines.push(`\nTotal Pemasukan: ${totalIn.toLocaleString("id-ID")}`);
      lines.push(`\n🔴 Pengeluaran:`);
      pengeluaran.forEach(p => lines.push(`- ${p.description}: ${p.amount.toLocaleString("id-ID")}`));
      lines.push(`\nTotal pengeluaran: ${totalOut.toLocaleString("id-ID")}`);
      lines.push(`\n💳 Saldo akhir: ${saldoAkhir.toLocaleString("id-ID")}`);
      lines.push(`\n📅Periode : [tanggal hijriah]`);
      lines.push(`\n📌Info: https://tanjungbulan.my.id/masjid`);

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

    document.addEventListener("DOMContentLoaded", () => {
      populateMonthOptions();
      populateChecklist();
    });