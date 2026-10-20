import React, { useState, useEffect } from 'react';
import {
  Search,
  Printer,
  Download,
  RotateCcw,
  Trash2,
  Building,
  UserCheck,
  Calendar,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo, formatDateTimeIndo, exportToCsvWithBOM } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { Transaksi } from '../../types';

export const SingleWbpInspection: React.FC = () => {
  const {
    wbpList,
    transactions,
    uptSettings,
    selectedWbpIdForInspection,
    setSelectedWbpIdForInspection,
    resetSaldoIndividualWbp,
    deleteWbp,
    setActiveAdminTab,
  } = useApp();

  const [selectedId, setSelectedId] = useState<string>(
    selectedWbpIdForInspection || (wbpList.length > 0 ? wbpList[0].id : '')
  );

  const [searchFilter, setSearchFilter] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [viewingTrx, setViewingTrx] = useState<Transaksi | null>(null);

  useEffect(() => {
    if (selectedWbpIdForInspection) {
      setSelectedId(selectedWbpIdForInspection);
    }
  }, [selectedWbpIdForInspection]);

  const currentWbp = wbpList.find((w) => w.id === selectedId) || null;

  // Filter transactions for this WBP
  const wbpTrx = currentWbp
    ? transactions.filter((t) => t.wbpId === currentWbp.id)
    : [];

  const totalMasuk = wbpTrx
    .filter((t) => t.jenisTransaksi === 'Uang Masuk')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalKeluar = wbpTrx
    .filter((t) => t.jenisTransaksi === 'Uang Keluar')
    .reduce((acc, t) => acc + t.nominal, 0);

  const handleExportAccountCsv = () => {
    if (!currentWbp) return;
    const headers = [
      'No',
      'Tanggal & Waktu',
      'No Transaksi',
      'Jenis Mutasi',
      'Kategori',
      'Nominal Uang Masuk (Rp)',
      'Nominal Uang Keluar (Rp)',
      'Saldo Berjalan (Rp)',
      'Petugas Kasir',
      'Keterangan',
    ];
    const rows = wbpTrx.map((t, idx) => [
      idx + 1,
      formatDateTimeIndo(t.waktuPencatatan),
      t.nomorTransaksi,
      t.jenisTransaksi,
      t.kategori,
      t.jenisTransaksi === 'Uang Masuk' ? t.nominal : 0,
      t.jenisTransaksi === 'Uang Keluar' ? t.nominal : 0,
      t.saldoSetelahTransaksi,
      t.petugas,
      t.keterangan,
    ]);

    exportToCsvWithBOM(
      `Rekening_Koran_${currentWbp.nama.replace(/\s+/g, '_')}_${currentWbp.nomorRegistrasi.replace(/\//g, '-')}`,
      headers,
      rows,
      `Buku Rekening Tabungan & Riwayat Mutasi WBP: ${currentWbp.nama}`,
      uptSettings.namaUpt,
      [
        `Nomor Registrasi: ${currentWbp.nomorRegistrasi}`,
        `Penempatan: ${currentWbp.blokHunian}`,
        `Status Hukum: ${currentWbp.status}`,
        `Saldo Awal: ${formatRupiah(currentWbp.saldoAwal)}`,
        `Saldo Terkini: ${formatRupiah(currentWbp.saldoBerjalan)}`,
      ]
    );
  };

  const filteredDropdownWbp = wbpList.filter(
    (w) =>
      w.nama.toLowerCase().includes(searchFilter.toLowerCase()) ||
      w.nomorRegistrasi.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Selector & Actions Top Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-900" />
            Pilih Warga Binaan untuk Diperiksa Rekeningnya:
          </label>
          <div className="flex gap-2">
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setSelectedWbpIdForInspection(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-900"
            >
              {wbpList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama} — {w.nomorRegistrasi} ({w.blokHunian}) [Saldo: {formatRupiah(w.saldoBerjalan)}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentWbp && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportAccountCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Unduh CSV Rekening Koran
            </button>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Reset saldo WBP ini ke Rp 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              Reset Saldo (Rp 0)
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Hapus data WBP"
            >
              <Trash2 className="w-4 h-4" />
              Hapus WBP
            </button>
          </div>
        )}
      </div>

      {currentWbp ? (
        <div className="space-y-6">
          {/* Identity & Ledger Profile Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                  {currentWbp.nama.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-black">{currentWbp.nama}</h2>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                        currentWbp.status === 'Aktif'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : currentWbp.status === 'Bebas'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      ● Status: {currentWbp.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      No. Reg: <strong className="text-white">{currentWbp.nomorRegistrasi}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-amber-400" />
                      Hunian: <strong className="text-white">{currentWbp.blokHunian}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Terdaftar: {formatDateIndo(currentWbp.tanggalMasuk)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra Details for Bebas / Mutasi */}
              {currentWbp.status === 'Bebas' && (
                <div className="p-3 bg-blue-900/50 border border-blue-500/40 rounded-xl text-xs text-blue-200">
                  <span className="font-bold block">Tanggal Pembebasan:</span>
                  <span>{formatDateIndo(currentWbp.tanggalBebas || '')}</span>
                </div>
              )}
              {currentWbp.status === 'Mutasi' && (
                <div className="p-3 bg-amber-900/50 border border-amber-500/40 rounded-xl text-xs text-amber-200">
                  <span className="font-bold block">Tujuan Mutasi:</span>
                  <span>{currentWbp.uptTujuan}</span>
                  <span className="block text-[11px] text-amber-300 mt-0.5">SK: {currentWbp.noSkMutasi}</span>
                </div>
              )}
            </div>

            {/* 4 Financial Ledger Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Saldo Awal
                </span>
                <div className="text-lg font-bold text-slate-200 mt-1">
                  {formatRupiah(currentWbp.saldoAwal)}
                </div>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                  Total Titipan Masuk
                </span>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  + {formatRupiah(totalMasuk)}
                </div>
              </div>

              <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/30">
                <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block">
                  Total Belanja Keluar
                </span>
                <div className="text-xl font-black text-rose-400 mt-1">
                  - {formatRupiah(totalKeluar)}
                </div>
              </div>

              <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40">
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                  Saldo Berjalan Terkini
                </span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {formatRupiah(currentWbp.saldoBerjalan)}
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-900" />
                  Buku Tabungan & Riwayat Mutasi Lengkap ({wbpTrx.length} Transaksi)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap mutasi kas masuk dan belanja kantin tercatat secara urut waktu.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">Tanggal & Waktu</th>
                    <th className="px-4 py-3">No. Transaksi</th>
                    <th className="px-4 py-3">Kategori Mutasi</th>
                    <th className="px-4 py-3 text-right">Uang Masuk</th>
                    <th className="px-4 py-3 text-right">Uang Keluar</th>
                    <th className="px-4 py-3 text-right">Saldo Sesudah</th>
                    <th className="px-4 py-3">Petugas</th>
                    <th className="px-4 py-3 text-center">Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {wbpTrx.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Belum ada riwayat mutasi transaksi untuk warga binaan ini.
                      </td>
                    </tr>
                  ) : (
                    wbpTrx.map((trx, idx) => {
                      const isMasuk = trx.jenisTransaksi === 'Uang Masuk';
                      return (
                        <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                            {formatDateTimeIndo(trx.waktuPencatatan)}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                            {trx.nomorTransaksi}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900">{trx.kategori}</span>
                            {trx.sumberAtauTujuan && (
                              <span className="block text-[10px] text-slate-500">
                                {trx.sumberAtauTujuan}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                            {isMasuk ? `+ ${formatRupiah(trx.nominal)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                            {!isMasuk ? `- ${formatRupiah(trx.nominal)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                            {formatRupiah(trx.saldoSetelahTransaksi)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {trx.petugas}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => setViewingTrx(trx)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1 text-[11px]"
                              title="Cetak Kuitansi / Struk"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Struk
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          Belum ada data warga binaan yang dipilih atau terdaftar.
        </div>
      )}

      {/* CONFIRM MODALS */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Konfirmasi Reset Saldo WBP"
        message={`Apakah Anda yakin ingin mereset saldo Warga Binaan "${currentWbp?.nama}" menjadi Rp 0?\nSaldo saat ini adalah ${formatRupiah(
          currentWbp?.saldoBerjalan || 0
        )}.\nTindakan ini biasanya dilakukan saat persiapan WBP Bebas atau Mutasi.`}
        confirmText="Ya, Reset Saldo ke Rp 0"
        isDanger={true}
        requiredTypedConfirmation="RESET"
        onConfirm={() => {
          if (currentWbp) {
            resetSaldoIndividualWbp(currentWbp.id);
            setIsResetConfirmOpen(false);
          }
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Hapus Data WBP"
        message={`Apakah Anda yakin ingin menghapus data Warga Binaan "${currentWbp?.nama}"?\nSeluruh buku mutasi dan data WBP akan dihapus.`}
        confirmText="Hapus WBP"
        isDanger={true}
        requiredTypedConfirmation="HAPUS"
        onConfirm={() => {
          if (currentWbp) {
            deleteWbp(currentWbp.id);
            setIsDeleteConfirmOpen(false);
            if (wbpList.length > 1) {
              const next = wbpList.find((w) => w.id !== currentWbp.id);
              if (next) setSelectedId(next.id);
            }
          }
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      {/* RECEIPT MODAL */}
      <ReceiptModal
        isOpen={Boolean(viewingTrx)}
        onClose={() => setViewingTrx(null)}
        transaction={viewingTrx}
        wbp={currentWbp}
      />
    </div>
  );
};
