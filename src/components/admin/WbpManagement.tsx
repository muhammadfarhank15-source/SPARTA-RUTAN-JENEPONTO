import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  FileText,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WargaBinaan, StatusWbp } from '../../types';
import { formatRupiah, formatDateIndo, exportToCsvWithBOM } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

export const WbpManagement: React.FC = () => {
  const {
    wbpList,
    addWbp,
    updateWbp,
    deleteWbp,
    uptSettings,
    setActiveAdminTab,
    setSelectedWbpIdForInspection,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWbp, setEditingWbp] = useState<WargaBinaan | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nomorRegistrasi: '',
    nama: '',
    blokHunian: '',
    status: 'Aktif' as StatusWbp,
    saldoAwal: 0,
    tanggalMasuk: new Date().toISOString().substring(0, 10),
    tanggalBebas: '',
    uptTujuan: '',
    noSkMutasi: '',
    catatan: '',
  });

  // Delete Confirmation State
  const [deletingWbp, setDeletingWbp] = useState<WargaBinaan | null>(null);

  // Filtered list
  const filteredList = wbpList.filter((w) => {
    const matchSearch =
      w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.nomorRegistrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.blokHunian.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingWbp(null);
    setFormData({
      nomorRegistrasi: `BI/${new Date().getFullYear()}/${String(Math.floor(100 + Math.random() * 900))}`,
      nama: '',
      blokHunian: 'Blok Mapenaling 01',
      status: 'Aktif',
      saldoAwal: 0,
      tanggalMasuk: new Date().toISOString().substring(0, 10),
      tanggalBebas: '',
      uptTujuan: '',
      noSkMutasi: '',
      catatan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wbp: WargaBinaan) => {
    setEditingWbp(wbp);
    setFormData({
      nomorRegistrasi: wbp.nomorRegistrasi,
      nama: wbp.nama,
      blokHunian: wbp.blokHunian,
      status: wbp.status,
      saldoAwal: wbp.saldoAwal,
      tanggalMasuk: wbp.tanggalMasuk,
      tanggalBebas: wbp.tanggalBebas || '',
      uptTujuan: wbp.uptTujuan || '',
      noSkMutasi: wbp.noSkMutasi || '',
      catatan: wbp.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nomorRegistrasi.trim()) {
      return;
    }

    if (editingWbp) {
      updateWbp(editingWbp.id, {
        nomorRegistrasi: formData.nomorRegistrasi.trim(),
        nama: formData.nama.trim(),
        blokHunian: formData.blokHunian.trim(),
        status: formData.status,
        tanggalBebas: formData.status === 'Bebas' ? formData.tanggalBebas : undefined,
        uptTujuan: formData.status === 'Mutasi' ? formData.uptTujuan : undefined,
        noSkMutasi: formData.status === 'Mutasi' ? formData.noSkMutasi : undefined,
        catatan: formData.catatan.trim(),
      });
    } else {
      addWbp({
        nomorRegistrasi: formData.nomorRegistrasi.trim(),
        nama: formData.nama.trim(),
        blokHunian: formData.blokHunian.trim(),
        status: formData.status,
        saldoAwal: Number(formData.saldoAwal) || 0,
        tanggalMasuk: formData.tanggalMasuk,
        tanggalBebas: formData.status === 'Bebas' ? formData.tanggalBebas : undefined,
        uptTujuan: formData.status === 'Mutasi' ? formData.uptTujuan : undefined,
        noSkMutasi: formData.status === 'Mutasi' ? formData.noSkMutasi : undefined,
        catatan: formData.catatan.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'No',
      'No Registrasi',
      'Nama Lengkap',
      'Blok/Paviliun',
      'Status',
      'Saldo Awal (Rp)',
      'Saldo Berjalan (Rp)',
      'Tanggal Masuk',
      'Tanggal Bebas / Info Mutasi',
    ];
    const rows = filteredList.map((w, idx) => [
      idx + 1,
      w.nomorRegistrasi,
      w.nama,
      w.blokHunian,
      w.status,
      w.saldoAwal,
      w.saldoBerjalan,
      w.tanggalMasuk,
      w.status === 'Bebas'
        ? `Bebas: ${w.tanggalBebas || '-'}`
        : w.status === 'Mutasi'
        ? `Mutasi: ${w.uptTujuan || '-'} (SK: ${w.noSkMutasi || '-'})`
        : '-',
    ]);

    exportToCsvWithBOM(
      `Master_Data_WBP_${new Date().toISOString().substring(0, 10)}`,
      headers,
      rows,
      'Master Data Warga Binaan & Rekapitulasi Saldo Rekening',
      uptSettings.namaUpt
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-900">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pengelolaan Data Warga Binaan (WBP)
              </h2>
              <p className="text-xs text-slate-500">
                Total {wbpList.length} warga binaan terdaftar dalam basis data keuangan digital.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveAdminTab('import_excel')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            Import Data Excel
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor Master WBP (CSV)
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            Registrasi WBP Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, no. registrasi, atau blok..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {['Semua', 'Aktif', 'Bebas', 'Mutasi', 'Non-Aktif'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* WBP Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3.5">No.</th>
                <th className="px-4 py-3.5">No. Registrasi</th>
                <th className="px-4 py-3.5">Nama Lengkap</th>
                <th className="px-4 py-3.5">Blok / Kamar</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Saldo Terkini</th>
                <th className="px-4 py-3.5 text-center">Aksi Pengelolaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ditemukan data warga binaan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((wbp, idx) => (
                  <tr key={wbp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {wbp.nomorRegistrasi}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{wbp.nama}</div>
                      <div className="text-[11px] text-slate-500">Masuk: {formatDateIndo(wbp.tanggalMasuk)}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {wbp.blokHunian}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          wbp.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : wbp.status === 'Bebas'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {wbp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatRupiah(wbp.saldoBerjalan)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Detail / Buku Tabungan button */}
                        <button
                          onClick={() => {
                            setSelectedWbpIdForInspection(wbp.id);
                            setActiveAdminTab('cek_wbp');
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors"
                          title="Periksa Buku Rekening WBP"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEdit(wbp)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Ubah Data WBP"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* ACTIVE RED TRASH ICON BUTTON */}
                        <button
                          onClick={() => setDeletingWbp(wbp)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors border border-rose-200 hover:border-rose-600 shadow-xs"
                          title="Hapus Data Warga Binaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingWbp ? 'Ubah Data Warga Binaan' : 'Registrasi Warga Binaan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Registrasi:
                  </label>
                  <input
                    type="text"
                    value={formData.nomorRegistrasi}
                    onChange={(e) => setFormData({ ...formData, nomorRegistrasi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap WBP:
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                    placeholder="Nama sesuai berkas hukum"
                    required
                  />
                </div>
              </div>

              {/* INPUT BLOK HUNIAN BEBAS KETIK DENGAN DATALIST */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Blok / Kamar / Paviliun Hunian (Bebas Ketik):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ketik bebas apa saja</span>
                </label>
                <input
                  type="text"
                  list="daftar-blok-saran"
                  value={formData.blokHunian}
                  onChange={(e) => setFormData({ ...formData, blokHunian: e.target.value })}
                  placeholder="Ketik blok hunian (e.g. Blok Mapenaling 02, Blok Tipikor B-3, Paviliun A, Kamar Isolasi)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900"
                  required
                />
                <datalist id="daftar-blok-saran">
                  <option value="Blok Mapenaling 01" />
                  <option value="Blok Mapenaling 02" />
                  <option value="Blok Hunian Tipikor B-3" />
                  <option value="Blok Hasanuddin A-1" />
                  <option value="Blok Hasanuddin A-4" />
                  <option value="Paviliun Bougenville 04" />
                  <option value="Paviliun Cipinang 02" />
                  <option value="Kamar Khusus Isolasi Medis" />
                </datalist>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Hukum / Keberadaan:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as StatusWbp })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="Aktif">Aktif (Menjalani Masa Pidana)</option>
                    <option value="Bebas">Bebas (Pembebasan Bersyarat / Murni)</option>
                    <option value="Mutasi">Mutasi (Dipindahkan ke UPT Lain)</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>

                {!editingWbp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Saldo Awal (Rp):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.saldoAwal}
                      onChange={(e) => setFormData({ ...formData, saldoAwal: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic status fields */}
              {formData.status === 'Bebas' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <label className="block text-xs font-semibold text-blue-900 mb-1">
                    Tanggal Pembebasan:
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalBebas}
                    onChange={(e) => setFormData({ ...formData, tanggalBebas: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-xl text-xs"
                    required
                  />
                </div>
              )}

              {formData.status === 'Mutasi' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      UPT Pemasyarakatan Tujuan:
                    </label>
                    <input
                      type="text"
                      value={formData.uptTujuan}
                      onChange={(e) => setFormData({ ...formData, uptTujuan: e.target.value })}
                      placeholder="Contoh: Lapas Kelas IIA Bulukumba"
                      className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      Nomor Surat Keputusan (SK) Mutasi:
                    </label>
                    <input
                      type="text"
                      value={formData.noSkMutasi}
                      onChange={(e) => setFormData({ ...formData, noSkMutasi: e.target.value })}
                      placeholder="Contoh: W23.PAS-04.PK.01-889"
                      className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Informasi Khusus:
                </label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  placeholder="Catatan titipan keluarga atau keterangan penempatan..."
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold"
                >
                  {editingWbp ? 'Simpan Perubahan' : 'Registrasikan WBP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETING WBP */}
      <ConfirmModal
        isOpen={Boolean(deletingWbp)}
        title="Konfirmasi Hapus Warga Binaan"
        message={`Apakah Anda yakin ingin menghapus data Warga Binaan "${deletingWbp?.nama}" (${deletingWbp?.nomorRegistrasi})?\n\nSaldo terakhir yang tercatat: ${formatRupiah(
          deletingWbp?.saldoBerjalan || 0
        )}.\nTindakan ini bersifat permanen dan akan dicatat ke dalam Audit Trail Keamanan.`}
        confirmText="Ya, Hapus Data WBP"
        isDanger={true}
        requiredTypedConfirmation="HAPUS"
        onConfirm={() => {
          if (deletingWbp) {
            deleteWbp(deletingWbp.id);
            setDeletingWbp(null);
          }
        }}
        onCancel={() => setDeletingWbp(null)}
      />
    </div>
  );
};
