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
  const dateInput = document.getElementById("tanggal").value;

  if (!description || isNaN(amount) || !dateInput) {
    alert("Mohon isi tanggal, keterangan, dan jumlah dengan benar.");
    return;
  }

  const date = new Date(dateInput);
  const formattedDate = formatTanggal(date);

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