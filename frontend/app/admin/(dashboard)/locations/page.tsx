"use client";
import { useState, useEffect, useCallback } from "react";
import {
  listProvinces, createProvince,
  listCities, createCity,
  listDistricts, createDistrict,
  listConstituencies, createConstituency,
  type ProvinceResponse, type CityResponse,
  type DistrictResponse, type ConstituencyResponse,
} from "../../../../lib/api";

const FIELD = "w-full px-4 py-2.5 rounded-xl bg-[#0f1f17] border border-[#2a4a36] text-white text-sm placeholder-gray-600 outline-none focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/10 transition-all";
const LABEL = "block text-xs font-semibold text-gray-400 mb-1";

type Tab =  "cities" | "districts" | "constituencies";

export default function AdminLocationsPage() {
  const [tab, setTab] = useState<Tab>("cities");


  const [provinces,      setProvinces]      = useState<ProvinceResponse[]>([]);
  const [cities,         setCities]         = useState<CityResponse[]>([]);
  const [districts,      setDistricts]      = useState<DistrictResponse[]>([]);
  const [constituencies, setConstituencies] = useState<ConstituencyResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // form states
  // const [provName,  setProvName]  = useState("");
  const prov = (id?: number | null) =>
  provinces.find(p => p.id === id)?.name ?? `#${id}`;
  const [cityName,  setCityName]  = useState(""); const [cityProv, setCityProv] = useState("");
  const [distName,  setDistName]  = useState(""); const [distCity, setDistCity] = useState("");
  const [constName, setConstName] = useState(""); const [constType, setConstType] = useState("federal"); const [constDist, setConstDist] = useState("");

  const flash = (msg: string, type: "ok" | "err") => {
    if (type === "ok") { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
    else               { setError(msg);   setTimeout(() => setError(null), 4000); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p,c, d, co] = await Promise.all([
        listProvinces(),listCities(), listDistricts(), listConstituencies(),
      ]);

      setProvinces(p); setCities(c); setDistricts(d); setConstituencies(co);
    } catch { flash("Failed to load location data.", "err"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);


  const city  = (id?: number | null) => cities.find(x => x.id === id)?.name     ?? `#${id}`;
  const dist  = (id?: number | null) => districts.find(x => x.id === id)?.name  ?? `#${id}`;

  const tabs: { key: Tab; label: string }[] = [
    { key: "cities",        label: "Cities"        },
    { key: "districts",     label: "Districts"     },
    { key: "constituencies",label: "Constituencies"},
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Locations</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage the geographic hierarchy: Province → City → District → Constituency.</p>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${error ? "bg-red-900/30 border-red-700/40 text-red-400" : "bg-green-900/30 border-green-700/40 text-green-400"}`}>
          {error ?? success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border
              ${tab === t.key
                ? "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30"
                : "text-gray-400 border-[#2a4a36] hover:text-white hover:bg-white/5"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
        </div>
      ) : (
        <>
         

          {/* ── CITIES ── */}
          {tab === "cities" && (
            <div className="space-y-6">
              <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Add City</h2>
                <form onSubmit={async e => {
                  e.preventDefault();
                  if (!cityProv) { flash("Select a province.", "err"); return; }
                  try { await createCity(cityName, Number(cityProv)); setCityName(""); setCityProv(""); await load(); flash("City added.", "ok"); }
                  catch { flash("Failed to add city.", "err"); }
                }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className={LABEL}>City Name *</label>
                    <input className={FIELD} placeholder="City name" required value={cityName} onChange={e => setCityName(e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Province *</label>
                     <select
                        className={FIELD}
                        required
                        value={cityProv}
                        onChange={e => setCityProv(e.target.value)}
                      >
                        <option value="">Select province</option>

                        {provinces.map(p => (
                          <option key={p.id} value={p.id} className="bg-[#162b1e]">
                            {p.name}
                          </option>
                        ))}
                      </select>
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-[#22c55e] text-[#0a1a10] font-bold text-sm rounded-xl hover:bg-[#16a34a] transition-all">Add City</button>
                  </div>
                </form>
              </div>
              <LocationTable
                headers={["ID", "Name", "Province"]}
                rows={cities.map(c => [
                  <span key="id" className="text-gray-500 font-mono">#{c.id}</span>,
                  <span key="n" className="text-white font-semibold">{c.name}</span>,
                  <span key="p" className="text-gray-300">{prov(c.province_id)}</span>,
                ])}
                empty="No cities yet." />
            </div>
          )}

          {/* ── DISTRICTS ── */}
          {tab === "districts" && (
            <div className="space-y-6">
              <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Add District</h2>
                <form onSubmit={async e => {
                  e.preventDefault();
                  if (!distCity) { flash("Select a city.", "err"); return; }
                  try { await createDistrict(distName, Number(distCity)); setDistName(""); setDistCity(""); await load(); flash("District added.", "ok"); }
                  catch { flash("Failed to add district.", "err"); }
                }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className={LABEL}>District Name *</label>
                    <input className={FIELD} placeholder="District name" required value={distName} onChange={e => setDistName(e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>City *</label>
                    <select className={FIELD} required value={distCity} onChange={e => setDistCity(e.target.value)}>
                      <option value="">Select city</option>
                      {cities.map(c => <option key={c.id} value={c.id} className="bg-[#162b1e]">{c.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-[#22c55e] text-[#0a1a10] font-bold text-sm rounded-xl hover:bg-[#16a34a] transition-all">Add District</button>
                  </div>
                </form>
              </div>
              <LocationTable
                headers={["ID", "Name", "City"]}
                rows={districts.map(d => [
                  <span key="id" className="text-gray-500 font-mono">#{d.id}</span>,
                  <span key="n" className="text-white font-semibold">{d.name}</span>,
                  <span key="c" className="text-gray-300">{city(d.city_id)}</span>,
                ])}
                empty="No districts yet." />
            </div>
          )}

          {/* ── CONSTITUENCIES ── */}
          {tab === "constituencies" && (
            <div className="space-y-6">
              <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Add Constituency</h2>
                <form onSubmit={async e => {
                  e.preventDefault();
                  if (!constDist) { flash("Select a district.", "err"); return; }
                  try { await createConstituency(constName, constType, Number(constDist)); setConstName(""); setConstType("federal"); setConstDist(""); await load(); flash("Constituency added.", "ok"); }
                  catch { flash("Failed to add constituency.", "err"); }
                }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className={LABEL}>Constituency Name *</label>
                    <input className={FIELD} placeholder="e.g. NA-246" required value={constName} onChange={e => setConstName(e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Type *</label>
                    <select className={FIELD} value={constType} onChange={e => setConstType(e.target.value)}>
                      <option value="federal"    className="bg-[#162b1e]">Federal</option>
                      <option value="provincial" className="bg-[#162b1e]">Provincial</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>District *</label>
                    <select className={FIELD} required value={constDist} onChange={e => setConstDist(e.target.value)}>
                      <option value="">Select district</option>
                      {districts.map(d => <option key={d.id} value={d.id} className="bg-[#162b1e]">{d.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-[#22c55e] text-[#0a1a10] font-bold text-sm rounded-xl hover:bg-[#16a34a] transition-all">Add Constituency</button>
                  </div>
                </form>
              </div>
              <LocationTable
                headers={["ID", "Name", "Type", "District"]}
                rows={constituencies.map(c => [
                  <span key="id" className="text-gray-500 font-mono">#{c.id}</span>,
                  <span key="n" className="text-white font-semibold">{c.name}</span>,
                  <span key="t" className={`px-2 py-0.5 rounded text-xs font-semibold border ${c.type === "federal" ? "bg-blue-900/30 text-blue-400 border-blue-700/30" : "bg-purple-900/30 text-purple-400 border-purple-700/30"}`}>{c.type}</span>,
                  <span key="d" className="text-gray-300">{dist(c.district_id)}</span>,
                ])}
                empty="No constituencies yet." />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LocationTable({ headers, rows, empty }: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a4a36] flex items-center justify-between">
        <span className="text-base font-bold text-white">Records</span>
        <span className="text-xs text-gray-500">{rows.length} total</span>
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a4a36] text-xs text-gray-500 uppercase tracking-wider">
                {headers.map(h => <th key={h} className="px-6 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3828]">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  {row.map((cell, j) => <td key={j} className="px-6 py-3.5">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
