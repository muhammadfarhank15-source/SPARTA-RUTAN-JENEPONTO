import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldAlert, KeyRound, User, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OfficialLogo } from '../common/OfficialLogo';
import { WindEffectOverlay } from '../common/WindEffectOverlay';

interface AdminLoginProps {
  onBackToLanding: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToLanding }) => {
  const { loginAdmin, uptSettings } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Kata sandi harus diisi!');
      return;
    }

    const success = loginAdmin(password);
    if (!success) {
      setErrorMsg('Kata sandi admin tidak sesuai! Silakan periksa kembali.');
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('adminpassword123');
    setErrorMsg('');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-950 overflow-hidden">
      {/* Background Gambar Rutan Jeneponto dengan Efek Angin */}
      <WindEffectOverlay showControl={false} />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Halaman Utama
        </button>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header with Logo SPARTA RUJENTO on top and text below in Montserrat ExtraBold */}
          <div className="text-center space-y-2 mb-6 flex flex-col items-center">
            <OfficialLogo size="xl" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-montserrat-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              SPARTA RUJENTO
            </span>
            <div className="space-y-0.5 mt-1">
              <h1 className="font-montserrat-extrabold text-xs sm:text-sm text-white uppercase tracking-tight leading-tight">
                STRATEGI PENGAWASAN TRANSAKSI KEUANGAN YANG TERINTEGRASI
              </h1>
              <p className="font-montserrat-extrabold text-[10px] sm:text-[11px] text-amber-400 uppercase tracking-wide">
                RUMAH TAHANAN NEGARA KELAS IIB JENEPONTO
              </p>
            </div>
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                PORTAL ADMIN &amp; KASIR
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Username / Email Petugas:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Kata Sandi Admin:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi..."
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Lock className="w-4 h-4" />
              Masuk ke Dashboard Admin
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Kredensial Default: <strong className="text-slate-300">admin</strong> / <strong className="text-slate-300">adminpassword123</strong>
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Isi Otomatis Kredensial Pengujian
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Setiap aktivitas login dan manipulasi data dicatat secara otomatis ke dalam sistem Audit Trail.
        </p>
      </div>
    </div>
  );
};
