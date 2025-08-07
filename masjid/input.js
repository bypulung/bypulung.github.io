function formatTanggal(tanggal) {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0"); // +1 karena bulan dimulai dari 0
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `${tahun}/${bulan}/${hari}`;
}

  function tambahNol() {
    const amountInput = document.getElementById("amount");
    let val = amountInput.value.trim();
    if (!val) val = "0";
    amountInput.value = parseInt(val + "000");
  }

  function generateCode() {
    const description = document.getElementById("description").value.trim();
    const type = document.getElementById("type").value;
    const amount = parseInt(document.getElementById("amount").value);
    const note = document.getElementById("note").value.trim();

    if (!description || isNaN(amount)) {
      alert("Mohon isi keterangan dan jumlah dengan benar.");
      return;
    }

    const now = new Date();
    const formattedDate = formatTanggal(now);

    const output = `{
  date: "${formattedDate}",
  description: "${description}",
  type: "${type}",
  amount: ${amount},
  note: "${note}"
},`;

    const resultDiv = document.getElementById("result");
    resultDiv.innerText = output;
    resultDiv.style.display = "block";

    document.getElementById("copyBtn").style.display = "block";
  }

  function copyToClipboard() {
    const resultText = document.getElementById("result").innerText;
    navigator.clipboard.writeText(resultText).then(() => {
      alert("Kode berhasil disalin!");
    });
  }