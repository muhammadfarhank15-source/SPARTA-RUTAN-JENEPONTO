import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WargaBinaan,
  Transaksi,
  AuditLog,
  LaporanBulanan,
  UptSettings,
  CategoryItem,
  PublicPortalContent,
  DuplicateHandlingMode,
  BulkImportResult,
  ImportRowDetail,
} from '../types';
import {
  INITIAL_UPT_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_WBP,
  INITIAL_TRANSACTIONS,
  INITIAL_MONTHLY_REPORTS,
  INITIAL_AUDIT_LOGS,
  SAMPLE_DEMO_WBP,
  SAMPLE_DEMO_TRANSACTIONS,
  SAMPLE_DEMO_MONTHLY_REPORTS,
  DEFAULT_PUBLIC_PORTAL_CONTENT,
} from '../data/initialData';

export type AdminTab =
  | 'dashboard'
  | 'wbp'
  | 'import_excel'
  | 'saldo'
  | 'cek_wbp'
  | 'titipan_masuk'
  | 'pembelanjaan'
  | 'riwayat'
  | 'rincian_keluar'
  | 'laporan'
  | 'teks_portal'
  | 'pengaturan_publik'
  | 'audit'
  | 'pengaturan_upt'
  | 'google_sheets';

interface AppContextType {
  // Navigation & Auth
  currentPortal: 'landing' | 'public' | 'admin';
  setCurrentPortal: (portal: 'landing' | 'public' | 'admin') => void;
  adminLoggedIn: boolean;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Data States
  wbpList: WargaBinaan[];
  transactions: Transaksi[];
  monthlyReports: LaporanBulanan[];
  auditLogs: AuditLog[];
  uptSettings: UptSettings;
  categories: CategoryItem[];
  isUsingDummyData: boolean;

  // Selected WBP for inspection or deep link
  selectedWbpIdForInspection: string | null;
  setSelectedWbpIdForInspection: (id: string | null) => void;

  // Computed Totals
  totalMasuk: number;
  totalKeluar: number;
  totalSaldo: number;
  transaksiBulanIniCount: number;
  pengeluaranBulanIni: number;

  // CRUD Actions
  addWbp: (data: Omit<WargaBinaan, 'id' | 'saldoBerjalan'>) => void;
  updateWbp: (id: string, updates: Partial<WargaBinaan>) => void;
  deleteWbp: (id: string) => void;
  bulkImportWbp: (
    items: Omit<WargaBinaan, 'id' | 'saldoBerjalan'>[],
    duplicateMode: DuplicateHandlingMode,
    fileName?: string
  ) => BulkImportResult;

  addTransaction: (
    trx: Omit<Transaksi, 'id' | 'waktuPencatatan' | 'saldoSetelahTransaksi'>
  ) => { success: boolean; message: string; transaction?: Transaksi };
  updateTransaction: (id: string, updates: Partial<Transaksi>) => void;
  deleteTransaction: (id: string) => void;

  // Reset actions
  resetTotalTitipanMasuk: () => void;
  resetTotalPembelanjaan: () => void;
  resetTotalSaldoTitipan: () => void;
  resetSaldoIndividualWbp: (wbpId: string) => void;
  tutupBukuBulanan: (
    adminPasswordConfirm: string,
    periodeNama: string,
    options: { resetMasuk: boolean; resetKeluar: boolean; resetSaldo: boolean }
  ) => { success: boolean; message: string };

  deleteMonthlyReport: (id: string) => void;

  // Settings & Category
  updateUptSettings: (settings: Partial<UptSettings>) => void;
  updatePortalContent: (content: Partial<PublicPortalContent>) => void;
  resetPortalContent: () => void;
  changeAdminPassword: (
    oldPass: string,
    newPass: string
  ) => { success: boolean; message: string };
  addCategory: (nama: string, jenis: 'Uang Masuk' | 'Uang Keluar') => void;

  // Demo Data Reset
  clearAllDummyData: () => void;
  loadDummyData: () => void;

  // Sync
  syncWithGoogleSheets: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WBP: 'sparta_rujento_wbp_v1',
  TRX: 'sparta_rujento_trx_v1',
  REPORTS: 'sparta_rujento_reports_v1',
  AUDIT: 'sparta_rujento_audit_v1',
  SETTINGS: 'sparta_rujento_settings_v1',
  CATEGORIES: 'sparta_rujento_categories_v1',
  AUTH: 'sparta_rujento_auth_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPortal, setCurrentPortal] = useState<'landing' | 'public' | 'admin'>('landing');
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [selectedWbpIdForInspection, setSelectedWbpIdForInspection] = useState<string | null>(null);

  // WBP List
  const [wbpList, setWbpList] = useState<WargaBinaan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WBP);
    return saved ? JSON.parse(saved) : INITIAL_WBP;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaksi[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRX);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Monthly Reports
  const [monthlyReports, setMonthlyReports] = useState<LaporanBulanan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_REPORTS;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Settings
  const [uptSettings, setUptSettings] = useState<UptSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) return INITIAL_UPT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.ditjen || parsed.kementerian?.includes('HUKUM')) {
        parsed.kementerian = INITIAL_UPT_SETTINGS.kementerian;
        parsed.ditjen = INITIAL_UPT_SETTINGS.ditjen;
      }
      if (parsed.namaAplikasi === 'SIK-WBP' || parsed.namaAplikasi === 'EDC Smart Dashboard') {
        parsed.namaAplikasi = INITIAL_UPT_SETTINGS.namaAplikasi;
      }
      if (parsed.namaUpt === 'RUTAN KELAS IIB JENEPONTO') {
        parsed.namaUpt = INITIAL_UPT_SETTINGS.namaUpt;
      }
      if (parsed.portalContent?.heroJudulBaris1 === 'APLIKASI KEUANGAN UANG DIGITAL & EDC RESMI') {
        parsed.portalContent.heroJudulBaris1 = DEFAULT_PUBLIC_PORTAL_CONTENT.heroJudulBaris1;
      }
      if (parsed.portalContent?.heroJudulBaris2 === 'SISTEM INFORMASI KEUANGAN WARGA BINAAN') {
        parsed.portalContent.heroJudulBaris2 = DEFAULT_PUBLIC_PORTAL_CONTENT.heroJudulBaris2;
      }
      if (parsed.portalContent?.portalUmumHeaderSub?.includes('Aplikasi Keuangan')) {
        parsed.portalContent.portalUmumHeaderSub = DEFAULT_PUBLIC_PORTAL_CONTENT.portalUmumHeaderSub;
      }
      if (!parsed.logoUrl || parsed.logoUrl === '') {
        parsed.logoUrl = INITIAL_UPT_SETTINGS.logoUrl;
      }
      if (!parsed.kepalaUptNama || parsed.kepalaUptNama.includes('Rahmat Hidayat')) {
        parsed.kepalaUptNama = INITIAL_UPT_SETTINGS.kepalaUptNama;
      }
      if (!parsed.kepalaUptNip || parsed.kepalaUptNip.includes('19780512')) {
        parsed.kepalaUptNip = INITIAL_UPT_SETTINGS.kepalaUptNip;
      }
      if (!parsed.bendaharaNama || parsed.bendaharaNama.includes('Siti Nurhaliza')) {
        parsed.bendaharaNama = INITIAL_UPT_SETTINGS.bendaharaNama;
      }
      return {
        ...INITIAL_UPT_SETTINGS,
        ...parsed,
        publicPortalSettings: {
          ...INITIAL_UPT_SETTINGS.publicPortalSettings,
          ...(parsed.publicPortalSettings || {}),
        },
        portalContent: {
          ...DEFAULT_PUBLIC_PORTAL_CONTENT,
          ...(parsed.portalContent || {}),
        },
      };
    } catch {
      return INITIAL_UPT_SETTINGS;
    }
  });

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [isUsingDummyData, setIsUsingDummyData] = useState<boolean>(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WBP, JSON.stringify(wbpList));
  }, [wbpList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRX, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(monthlyReports));
  }, [monthlyReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(uptSettings));
  }, [uptSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, adminLoggedIn ? 'true' : 'false');
  }, [adminLoggedIn]);

  // Add audit log helper
  const logAudit = (
    aksi: string,
    modul: string,
    rincian: string,
    tipe: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS' = 'INFO'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      petugas: 'Administrator Kasir',
      aksi,
      modul,
      rincian,
      tipe,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth
  const loginAdmin = (password: string): boolean => {
    if (password === uptSettings.adminPassword) {
      setAdminLoggedIn(true);
      setCurrentPortal('admin');
      logAudit('Login Berhasil', 'Autentikasi', 'Admin berhasil masuk ke Dashboard Manajemen SIK-WBP.', 'SUCCESS');
      return true;
    }
    logAudit('Login Gagal', 'Autentikasi', 'Percobaan login admin gagal dengan kata sandi tidak valid.', 'WARNING');
    return false;
  };

  const logoutAdmin = () => {
    setAdminLoggedIn(false);
    setCurrentPortal('landing');
    logAudit('Logout', 'Autentikasi', 'Sesi admin telah ditutup.', 'INFO');
  };

  // Computed Totals
  const totalMasuk = transactions.reduce((acc, t) => (t.jenisTransaksi === 'Uang Masuk' ? acc + t.nominal : acc), 0);
  const totalKeluar = transactions.reduce((acc, t) => (t.jenisTransaksi === 'Uang Keluar' ? acc + t.nominal : acc), 0);
  const totalSaldo = wbpList.reduce((acc, w) => acc + (w.saldoBerjalan || 0), 0);

  // Month calculation (October 2026 or current active date)
  const currentYear = 2026;
  const currentMonth = 10;
  const thisMonthTrx = transactions.filter((t) => {
    const d = new Date(t.tanggal);
    return !isNaN(d.getTime()) && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });
  const transaksiBulanIniCount = thisMonthTrx.length;
  const pengeluaranBulanIni = thisMonthTrx
    .filter((t) => t.jenisTransaksi === 'Uang Keluar')
    .reduce((acc, t) => acc + t.nominal, 0);

  // CRUD WBP
  const addWbp = (data: Omit<WargaBinaan, 'id' | 'saldoBerjalan'>) => {
    const newId = `wbp-${Date.now()}`;
    const newWbp: WargaBinaan = {
      ...data,
      id: newId,
      saldoBerjalan: data.saldoAwal || 0,
    };
    setWbpList((prev) => [newWbp, ...prev]);
    logAudit(
      'Tambah WBP',
      'Data WBP',
      `Menambahkan warga binaan baru: ${newWbp.nama} (${newWbp.nomorRegistrasi}) di ${newWbp.blokHunian}.`,
      'SUCCESS'
    );
  };

  const updateWbp = (id: string, updates: Partial<WargaBinaan>) => {
    setWbpList((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const updated = { ...w, ...updates };
          logAudit(
            'Ubah WBP',
            'Data WBP',
            `Memperbarui data warga binaan ${w.nama} (${w.nomorRegistrasi}).`,
            'INFO'
          );
          return updated;
        }
        return w;
      })
    );
  };

  const deleteWbp = (id: string) => {
    const target = wbpList.find((w) => w.id === id);
    if (!target) return;
    setWbpList((prev) => prev.filter((w) => w.id !== id));
    logAudit(
      'Hapus WBP',
      'Data WBP',
      `Menghapus permanen data WBP ${target.nama} (${target.nomorRegistrasi}) dengan saldo terakhir Rp ${target.saldoBerjalan.toLocaleString('id-ID')}.`,
      'DANGER'
    );
  };

  const bulkImportWbp = (
    items: Omit<WargaBinaan, 'id' | 'saldoBerjalan'>[],
    duplicateMode: DuplicateHandlingMode,
    fileName: string = 'Import_Data_WBP.xlsx'
  ): BulkImportResult => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const details: ImportRowDetail[] = [];
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Map existing records by normalized nomorRegistrasi
    const existingMap = new Map<string, WargaBinaan>();
    wbpList.forEach((w) => {
      existingMap.set(w.nomorRegistrasi.trim().toUpperCase(), w);
    });

    // Check if duplicateMode is CANCEL and duplicates exist in DB or file
    const seenRegInFile = new Set<string>();
    let hasConflict = false;

    for (const item of items) {
      const regUpper = (item.nomorRegistrasi || '').trim().toUpperCase();
      if (!regUpper) continue;
      if (existingMap.has(regUpper) || seenRegInFile.has(regUpper)) {
        hasConflict = true;
        break;
      }
      seenRegInFile.add(regUpper);
    }

    if (duplicateMode === 'CANCEL' && hasConflict) {
      logAudit(
        'Import Dibatalkan',
        'Import Data',
        `Import massal dari file "${fileName}" dibatalkan karena terdeteksi nomor registrasi duplikat pada mode BATALKAN.`,
        'WARNING'
      );
      return {
        success: false,
        message: 'Import dibatalkan karena ditemukan nomor registrasi duplikat pada mode penanganan "Batalkan Import".',
        fileName,
        totalRows: items.length,
        insertedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        failedCount: items.length,
        duplicateMode,
        timestamp,
        details: items.map((it) => ({
          nomorRegistrasi: it.nomorRegistrasi || '-',
          nama: it.nama || '-',
          blokHunian: it.blokHunian || '-',
          statusAksi: 'FAILED',
          keterangan: 'Dibatalkan: Terdeteksi duplikasi data nomor registrasi.',
        })),
      };
    }

    // Process all items in batch
    const currentListMap = new Map<string, WargaBinaan>();
    wbpList.forEach((w) => currentListMap.set(w.nomorRegistrasi.trim().toUpperCase(), { ...w }));

    // Track internal file duplicates processed
    const processedFileRegs = new Set<string>();

    items.forEach((item, idx) => {
      const reg = (item.nomorRegistrasi || '').trim();
      const nama = (item.nama || '').trim();

      if (!reg || !nama) {
        failedCount++;
        details.push({
          nomorRegistrasi: reg || `Baris ${idx + 1}`,
          nama: nama || '(Nama Kosong)',
          blokHunian: item.blokHunian || '-',
          statusAksi: 'FAILED',
          keterangan: 'Gagal: Nomor Registrasi dan Nama Lengkap wajib diisi.',
        });
        return;
      }

      const regKey = reg.toUpperCase();

      // Check if this reg has already been seen in this import batch
      if (processedFileRegs.has(regKey)) {
        skippedCount++;
        details.push({
          nomorRegistrasi: reg,
          nama: nama,
          blokHunian: item.blokHunian || '-',
          statusAksi: 'SKIPPED',
          keterangan: 'Dilewati: Nomor Registrasi duplikat dalam baris lain pada file yang sama.',
        });
        return;
      }

      const existingRecord = currentListMap.get(regKey);

      if (existingRecord) {
        if (duplicateMode === 'SKIP') {
          skippedCount++;
          details.push({
            nomorRegistrasi: reg,
            nama: nama,
            blokHunian: item.blokHunian || '-',
            statusAksi: 'SKIPPED',
            keterangan: `Dilewati: Nomor Registrasi sudah terdaftar atas nama ${existingRecord.nama}.`,
          });
        } else if (duplicateMode === 'UPDATE') {
          const updated: WargaBinaan = {
            ...existingRecord,
            nama: nama,
            nik: item.nik?.trim() || existingRecord.nik,
            tempatLahir: item.tempatLahir?.trim() || existingRecord.tempatLahir,
            tanggalLahir: item.tanggalLahir || existingRecord.tanggalLahir,
            jenisKelamin: item.jenisKelamin || existingRecord.jenisKelamin,
            alamat: item.alamat?.trim() || existingRecord.alamat,
            blokHunian: item.blokHunian?.trim() || existingRecord.blokHunian,
            status: item.status || existingRecord.status,
            tanggalBebas: item.tanggalBebas || existingRecord.tanggalBebas,
            uptTujuan: item.uptTujuan || existingRecord.uptTujuan,
            noSkMutasi: item.noSkMutasi || existingRecord.noSkMutasi,
            jenisPerkara: item.jenisPerkara || existingRecord.jenisPerkara,
            tanggalMasuk: item.tanggalMasuk || existingRecord.tanggalMasuk,
            catatan: item.catatan ? `${existingRecord.catatan ? existingRecord.catatan + ' | ' : ''}${item.catatan.trim()}` : existingRecord.catatan,
          };
          currentListMap.set(regKey, updated);
          processedFileRegs.add(regKey);
          updatedCount++;
          details.push({
            nomorRegistrasi: reg,
            nama: nama,
            blokHunian: item.blokHunian || '-',
            statusAksi: 'UPDATED',
            keterangan: 'Berhasil: Data lama diperbarui sesuai isi file Excel.',
          });
        }
      } else {
        const initialSaldo = typeof item.saldoAwal === 'number' && !isNaN(item.saldoAwal) ? item.saldoAwal : 0;
        const newRecord: WargaBinaan = {
          ...item,
          nomorRegistrasi: reg,
          nama: nama,
          blokHunian: item.blokHunian?.trim() || 'Blok Mapenaling 01',
          status: item.status || 'Aktif',
          id: `wbp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          saldoAwal: initialSaldo,
          saldoBerjalan: initialSaldo,
          tanggalMasuk: item.tanggalMasuk || new Date().toISOString().substring(0, 10),
        };
        currentListMap.set(regKey, newRecord);
        processedFileRegs.add(regKey);
        insertedCount++;
        details.push({
          nomorRegistrasi: reg,
          nama: nama,
          blokHunian: newRecord.blokHunian,
          statusAksi: 'INSERTED',
          keterangan: 'Berhasil: Warga binaan baru tersimpan ke database.',
        });
      }
    });

    // Update state atomically
    const newFinalList = Array.from(currentListMap.values());
    setWbpList(newFinalList);

    // Audit Log
    logAudit(
      'Import Massal Excel',
      'Import Data',
      `Import file "${fileName}" selesai. Total: ${items.length} baris | Ditambahkan: ${insertedCount} baru | Diperbarui: ${updatedCount} | Dilewati: ${skippedCount} | Gagal: ${failedCount}. Mode: ${duplicateMode}.`,
      failedCount > 0 ? 'WARNING' : 'SUCCESS'
    );

    return {
      success: true,
      message: `Proses import berhasil diselesaikan. ${insertedCount} data baru ditambahkan, ${updatedCount} diperbarui, ${skippedCount} dilewati, ${failedCount} gagal.`,
      fileName,
      totalRows: items.length,
      insertedCount,
      updatedCount,
      skippedCount,
      failedCount,
      duplicateMode,
      timestamp,
      details,
    };
  };

  // CRUD Transactions
  const addTransaction = (
    trxData: Omit<Transaksi, 'id' | 'waktuPencatatan' | 'saldoSetelahTransaksi'>
  ) => {
    const targetWbp = wbpList.find((w) => w.id === trxData.wbpId);
    if (!targetWbp) {
      return { success: false, message: 'Warga binaan tidak ditemukan.' };
    }

    if (trxData.nominal <= 0) {
      return { success: false, message: 'Nominal transaksi harus lebih dari Rp 0.' };
    }

    // Check balance for Uang Keluar
    if (trxData.jenisTransaksi === 'Uang Keluar' && targetWbp.saldoBerjalan < trxData.nominal) {
      return {
        success: false,
        message: `Saldo tidak mencukupi! Saldo saat ini: Rp ${targetWbp.saldoBerjalan.toLocaleString('id-ID')}, nominal yang diminta: Rp ${trxData.nominal.toLocaleString('id-ID')}.`,
      };
    }

    const newSaldo =
      trxData.jenisTransaksi === 'Uang Masuk'
        ? targetWbp.saldoBerjalan + trxData.nominal
        : targetWbp.saldoBerjalan - trxData.nominal;

    const newId = `trx-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const fullTrx: Transaksi = {
      ...trxData,
      id: newId,
      waktuPencatatan: nowStr,
      saldoSetelahTransaksi: newSaldo,
    };

    // Update WBP running balance
    setWbpList((prev) =>
      prev.map((w) => (w.id === targetWbp.id ? { ...w, saldoBerjalan: newSaldo } : w))
    );

    // Append transaction
    setTransactions((prev) => [fullTrx, ...prev]);

    logAudit(
      `Catat ${trxData.jenisTransaksi}`,
      trxData.jenisTransaksi === 'Uang Masuk' ? 'Uang Titipan Masuk' : 'Pembelanjaan Kantin',
      `No: ${fullTrx.nomorTransaksi} - ${trxData.namaWbp} nominal Rp ${trxData.nominal.toLocaleString('id-ID')} (${trxData.kategori}). Saldo baru: Rp ${newSaldo.toLocaleString('id-ID')}.`,
      'SUCCESS'
    );

    return { success: true, message: 'Transaksi berhasil disimpan dan dibukukan.', transaction: fullTrx };
  };

  const updateTransaction = (id: string, updates: Partial<Transaksi>) => {
    const targetTrx = transactions.find((t) => t.id === id);
    if (!targetTrx) return;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = {
            ...t,
            ...updates,
            waktuPerubahan: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          logAudit(
            'Koreksi Transaksi',
            'Riwayat Transaksi',
            `Koreksi data pada transaksi ${t.nomorTransaksi} (${t.namaWbp}).`,
            'WARNING'
          );
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const targetTrx = transactions.find((t) => t.id === id);
    if (!targetTrx) return;

    // Rollback WBP balance
    setWbpList((prev) =>
      prev.map((w) => {
        if (w.id === targetTrx.wbpId) {
          const revertedBalance =
            targetTrx.jenisTransaksi === 'Uang Masuk'
              ? Math.max(0, w.saldoBerjalan - targetTrx.nominal)
              : w.saldoBerjalan + targetTrx.nominal;
          return { ...w, saldoBerjalan: revertedBalance };
        }
        return w;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    logAudit(
      'Hapus Transaksi',
      'Riwayat Transaksi',
      `Menghapus transaksi ${targetTrx.nomorTransaksi} (${targetTrx.jenisTransaksi} Rp ${targetTrx.nominal.toLocaleString('id-ID')}) untuk WBP ${targetTrx.namaWbp}. Saldo telah disesuaikan kembali.`,
      'DANGER'
    );
  };

  // Reset actions
  const resetTotalTitipanMasuk = () => {
    // Keep transactions in history but flag or remove incoming transactions if requested
    setTransactions((prev) => prev.filter((t) => t.jenisTransaksi !== 'Uang Masuk'));
    logAudit('Reset Total Titipan Masuk', 'Dashboard Admin', 'Total titipan masuk telah di-reset menjadi Rp 0.', 'WARNING');
  };

  const resetTotalPembelanjaan = () => {
    setTransactions((prev) => prev.filter((t) => t.jenisTransaksi !== 'Uang Keluar'));
    logAudit('Reset Total Pembelanjaan', 'Dashboard Admin', 'Total pembelanjaan telah di-reset menjadi Rp 0.', 'WARNING');
  };

  const resetTotalSaldoTitipan = () => {
    setWbpList((prev) => prev.map((w) => ({ ...w, saldoBerjalan: 0 })));
    logAudit('Reset Saldo Seluruh WBP', 'Status Saldo', 'Seluruh saldo berjalan Warga Binaan telah di-reset menjadi Rp 0.', 'DANGER');
  };

  const resetSaldoIndividualWbp = (wbpId: string) => {
    const target = wbpList.find((w) => w.id === wbpId);
    if (!target) return;
    setWbpList((prev) =>
      prev.map((w) => (w.id === wbpId ? { ...w, saldoBerjalan: 0 } : w))
    );
    logAudit(
      'Reset Saldo Individu',
      'Pemeriksaan Per WBP',
      `Saldo WBP ${target.nama} (${target.nomorRegistrasi}) di-reset menjadi Rp 0 (sebelumnya Rp ${target.saldoBerjalan.toLocaleString('id-ID')}).`,
      'WARNING'
    );
  };

  const tutupBukuBulanan = (
    adminPasswordConfirm: string,
    periodeNama: string,
    options: { resetMasuk: boolean; resetKeluar: boolean; resetSaldo: boolean }
  ) => {
    if (adminPasswordConfirm !== uptSettings.adminPassword) {
      return { success: false, message: 'Kata sandi konfirmasi admin tidak valid!' };
    }

    const currentReport: LaporanBulanan = {
      id: `rep-${Date.now()}`,
      periode: periodeNama || 'Oktober 2026',
      tahun: 2026,
      bulan: 10,
      status: 'Tutup Buku Diarsipkan',
      jumlahTransaksi: transactions.length,
      totalMasuk: totalMasuk,
      totalKeluar: totalKeluar,
      saldoAkhir: totalSaldo,
      tanggalTutupBuku: new Date().toISOString().replace('T', ' ').substring(0, 19),
      petugasTutupBuku: 'Siti Nurhaliza (Bendahara)',
    };

    setMonthlyReports((prev) => [currentReport, ...prev]);

    if (options.resetMasuk && options.resetKeluar) {
      setTransactions([]);
    } else if (options.resetMasuk) {
      setTransactions((prev) => prev.filter((t) => t.jenisTransaksi !== 'Uang Masuk'));
    } else if (options.resetKeluar) {
      setTransactions((prev) => prev.filter((t) => t.jenisTransaksi !== 'Uang Keluar'));
    }

    if (options.resetSaldo) {
      setWbpList((prev) => prev.map((w) => ({ ...w, saldoBerjalan: 0 })));
    }

    logAudit(
      'Tutup Buku Bulanan',
      'Laporan Keuangan',
      `Tutup buku periode ${periodeNama} berhasil dilaksanakan. Rekap diarsipkan, saldo dan transaksi dipersiapkan untuk periode berikutnya.`,
      'SUCCESS'
    );

    return {
      success: true,
      message: `Tutup buku periode ${periodeNama} berhasil dilaksanakan! Laporan telah diarsipkan ke Riwayat Bulanan.`,
    };
  };

  const deleteMonthlyReport = (id: string) => {
    const target = monthlyReports.find((r) => r.id === id);
    if (!target) return;
    setMonthlyReports((prev) => prev.filter((r) => r.id !== id));
    logAudit(
      'Hapus Arsip Laporan',
      'Laporan Keuangan',
      `Menghapus arsip laporan bulanan ${target.periode} (Total Masuk: Rp ${target.totalMasuk.toLocaleString('id-ID')}, Total Keluar: Rp ${target.totalKeluar.toLocaleString('id-ID')}).`,
      'DANGER'
    );
  };

  const updateUptSettings = (settings: Partial<UptSettings>) => {
    setUptSettings((prev) => {
      const next = {
        ...prev,
        ...settings,
        ...(settings.publicPortalSettings
          ? { publicPortalSettings: { ...prev.publicPortalSettings, ...settings.publicPortalSettings } }
          : {}),
        ...(settings.portalContent
          ? { portalContent: { ...prev.portalContent, ...settings.portalContent } }
          : {}),
      };
      return next;
    });
    logAudit('Perbarui Identitas UPT', 'Pengaturan UPT', 'Identitas instansi, logo, atau pengaturan portal telah diperbarui.', 'INFO');
  };

  const updatePortalContent = (content: Partial<PublicPortalContent>) => {
    setUptSettings((prev) => ({
      ...prev,
      portalContent: {
        ...prev.portalContent,
        ...content,
      },
    }));
    logAudit('Ubah Kalimat Portal Umum', 'Pengaturan Portal', 'Kalimat teks dan pengumuman pada Portal Umum telah diperbarui oleh Admin.', 'INFO');
  };

  const resetPortalContent = () => {
    setUptSettings((prev) => ({
      ...prev,
      portalContent: { ...DEFAULT_PUBLIC_PORTAL_CONTENT },
    }));
    logAudit('Reset Teks Portal', 'Pengaturan Portal', 'Kalimat teks Portal Umum dikembalikan ke teks standar bawaan.', 'WARNING');
  };

  const changeAdminPassword = (oldPass: string, newPass: string) => {
    if (oldPass !== uptSettings.adminPassword) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan salah!' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal harus 6 karakter!' };
    }
    setUptSettings((prev) => ({ ...prev, adminPassword: newPass }));
    logAudit('Ganti Kata Sandi', 'Keamanan', 'Kata sandi akun Administrator berhasil diubah.', 'SUCCESS');
    return { success: true, message: 'Kata sandi admin berhasil diperbarui!' };
  };

  const addCategory = (nama: string, jenis: 'Uang Masuk' | 'Uang Keluar') => {
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      nama: nama.trim(),
      jenis,
    };
    setCategories((prev) => [...prev, newCat]);
    logAudit('Tambah Kategori', 'Pengaturan', `Menambahkan kategori transaksi baru: "${nama}" (${jenis}).`, 'INFO');
  };

  const clearAllDummyData = () => {
    setWbpList([]);
    setTransactions([]);
    setMonthlyReports([]);
    setIsUsingDummyData(false);
    logAudit('Kosongkan Data Dummy', 'Sistem', 'Seluruh data percontohan telah dibersihkan menjadi basis data kosong.', 'WARNING');
  };

  const loadDummyData = () => {
    setWbpList(SAMPLE_DEMO_WBP);
    setTransactions(SAMPLE_DEMO_TRANSACTIONS);
    setMonthlyReports(SAMPLE_DEMO_MONTHLY_REPORTS);
    setIsUsingDummyData(true);
    logAudit('Muat Data Dummy', 'Sistem', 'Data percontohan Rutan Jeneponto telah dimuat ulang.', 'INFO');
  };

  const syncWithGoogleSheets = async () => {
    if (!uptSettings.googleSheetsUrl) {
      return {
        success: false,
        message: 'URL Google Apps Script Web App belum diatur di menu Pengaturan / Integrasi.',
      };
    }

    try {
      // Push current data
      const payload = {
        action: 'SYNC_ALL',
        wargaBinaan: wbpList.map((w) => [
          w.id,
          w.nomorRegistrasi,
          w.nama,
          w.blokHunian,
          w.status,
          w.saldoAwal,
          w.saldoBerjalan,
          w.tanggalMasuk,
          w.tanggalBebas || '',
          w.uptTujuan || '',
          w.noSkMutasi || '',
        ]),
        transaksi: transactions.map((t) => [
          t.id,
          t.nomorTransaksi,
          t.tanggal,
          t.namaWbp,
          t.jenisTransaksi,
          t.kategori,
          t.nominal,
          t.sumberAtauTujuan,
          t.keterangan,
          t.petugas,
          t.waktuPencatatan,
        ]),
      };

      const res = await fetch(uptSettings.googleSheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors', // Standard for Google Apps Script Web Apps when accessed from browser without domain whitelist
      });

      const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setUptSettings((prev) => ({
        ...prev,
        syncStatus: 'Tersambung',
        lastSyncTime: nowTime,
      }));

      logAudit(
        'Sinkronisasi Google Sheets',
        'Integrasi Database',
        `Sinkronisasi data ke Google Sheets berhasil dikirimkan (${wbpList.length} WBP, ${transactions.length} Transaksi).`,
        'SUCCESS'
      );

      return {
        success: true,
        message: 'Data berhasil disinkronkan ke Google Sheets Anda!',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal menyinkronkan: ${errMsg}. Pastikan URL Web App benar dan diizinkan untuk 'Anyone'.`,
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPortal,
        setCurrentPortal,
        adminLoggedIn,
        activeAdminTab,
        setActiveAdminTab,
        loginAdmin,
        logoutAdmin,
        wbpList,
        transactions,
        monthlyReports,
        auditLogs,
        uptSettings,
        categories,
        isUsingDummyData,
        selectedWbpIdForInspection,
        setSelectedWbpIdForInspection,
        totalMasuk,
        totalKeluar,
        totalSaldo,
        transaksiBulanIniCount,
        pengeluaranBulanIni,
        addWbp,
        updateWbp,
        deleteWbp,
        bulkImportWbp,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        resetTotalTitipanMasuk,
        resetTotalPembelanjaan,
        resetTotalSaldoTitipan,
        resetSaldoIndividualWbp,
        tutupBukuBulanan,
        deleteMonthlyReport,
        updateUptSettings,
        updatePortalContent,
        resetPortalContent,
        changeAdminPassword,
        addCategory,
        clearAllDummyData,
        loadDummyData,
        syncWithGoogleSheets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
