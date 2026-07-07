export type JamOperasionalDestination = {
  jamBuka: string | null;
  jamTutup: string | null;
  buka24Jam: boolean;
};

function parseJamMenit(jam: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(jam.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Label ringkas jam operasional untuk ditampilkan di UI, mis. "Buka 06:00 - 17:00" atau "Buka 24 Jam". */
export function formatJamOperasionalLabel(dest: JamOperasionalDestination): string | null {
  if (dest.buka24Jam) return "Buka 24 Jam";
  if (dest.jamBuka && dest.jamTutup) return `Buka ${dest.jamBuka} - ${dest.jamTutup}`;
  return null;
}

/**
 * Cek apakah destinasi buka pada waktu tertentu.
 * Data lama yang belum diisi jamBuka/jamTutup dianggap tidak ada batasan (tidak diblokir).
 * Mendukung rentang yang melewati tengah malam, mis. jamBuka "20:00" - jamTutup "04:00".
 */
export function isJamBukaValid(dest: JamOperasionalDestination, tanggalWaktuDipilih: Date): boolean {
  if (dest.buka24Jam) return true;
  if (!dest.jamBuka || !dest.jamTutup) return true;

  const bukaMenit = parseJamMenit(dest.jamBuka);
  const tutupMenit = parseJamMenit(dest.jamTutup);
  if (bukaMenit === null || tutupMenit === null) return true;

  const jamMenit = tanggalWaktuDipilih.getHours() * 60 + tanggalWaktuDipilih.getMinutes();

  if (bukaMenit <= tutupMenit) {
    return jamMenit >= bukaMenit && jamMenit <= tutupMenit;
  }
  return jamMenit >= bukaMenit || jamMenit <= tutupMenit;
}
