// ─────────────────────────────────────────────────────────────────────────────
// Centralized API client
// All backend calls go through here. JWT token is auto-attached from
// localStorage when present.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Token helpers ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function saveAuth(token: string, voterId: number, name: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("voter_id", String(voterId));
  localStorage.setItem("voter_name", name);
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("voter_id");
  localStorage.removeItem("voter_name");
  window.dispatchEvent(new Event("auth-change"));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
  voter_id: number;
  name: string;
}

export interface VoterResponse {
  id: number;
  name: string;
  cnic: string;
  email: string;
  federal_constituency_id:    number | null;
  provincial_constituency_id: number | null;
  local_constituency_id:      number | null;
  has_voted:            boolean;
  has_voted_federal:    boolean;
  has_voted_provincial: boolean;
  has_voted_local:      boolean;
  created_at: string | null;
}

export interface RegisterPayload {
  name: string;
  father_or_husband_name: string;
  cnic: string;
  phone_number?: string;
  email: string;
  password: string;
  federal_constituency_id: number;
  provincial_constituency_id: number;
}

export function loginVoter(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/voters/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerVoter(data: RegisterPayload): Promise<VoterResponse> {
  return request<VoterResponse>("/voters/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getVoterProfile(): Promise<VoterResponse> {
  return request<VoterResponse>("/voters/me");
}

// ─────────────────────────────────────────────────────────────────────────────
// ELECTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface ElectionResponse {
  id: number;
  name: string;
  type: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
}

export function listElections(status?: string, type?: string): Promise<ElectionResponse[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type)   params.set("type",   type);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<ElectionResponse[]>(`/elections${qs}`);
}

export function getElection(id: number): Promise<ElectionResponse> {
  return request<ElectionResponse>(`/elections/${id}`);
}

export function getConstituency(id: number): Promise<ConstituencyResponse> {
  return request<ConstituencyResponse>(`/locations/constituencies/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATES
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidateResponse {
  id: number;
  name: string;
  party_name: string | null;
  constituency_id: number | null;
}

export function listCandidates(constituencyId?: number): Promise<CandidateResponse[]> {
  const qs = constituencyId ? `?constituency_id=${constituencyId}` : "";
  return request<CandidateResponse[]>(`/candidates${qs}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// VOTES
// ─────────────────────────────────────────────────────────────────────────────

export interface VoteResponse {
  id: number;
  voter_id: number | null;
  candidate_id: number | null;
  election_id: number | null;
  timestamp: string | null;
  receipt_code: string | null;
  ledger_hash: string | null;
}

export interface RankedCandidate {
  candidate_id: number;
  name: string;
  party: string;
  votes: number;
  pct?: number;
}

export interface ResultsResponse {
  method: string;
  total_votes: number;
  winner: RankedCandidate | null;
  ranked_candidates: RankedCandidate[];
  election_id: number;
  election_name: string;
  voter_turnout_percent: number;
  generated_at: string;
  requires_runoff?: boolean;
  runoff_candidates?: RankedCandidate[];
}

export function castVote(candidate_id: number, election_id: number): Promise<VoteResponse> {
  return request<VoteResponse>("/votes/cast", {
    method: "POST",
    body: JSON.stringify({ candidate_id, election_id }),
  });
}

export interface VoteVerificationResponse {
  receipt_code:  string;
  election_name: string;
  election_type: string | null;
  recorded_at:   string;
  vote_status:   string;
  ledger_hash:   string;
}

export function verifyVote(receiptCode: string): Promise<VoteVerificationResponse> {
  return request<VoteVerificationResponse>(`/votes/verify/${encodeURIComponent(receiptCode.trim())}`);
}

export interface VoteHistoryItem {
  vote_id:       number;
  election_id:   number;
  election_name: string;
  election_type: string | null;
  recorded_at:   string | null;
  receipt_code:  string | null;
  ledger_hash:   string | null;
  vote_status:   string;
}

export function getVotingHistory(): Promise<VoteHistoryItem[]> {
  return request<VoteHistoryItem[]>("/votes/history");
}

export function getResults(electionId: number): Promise<ResultsResponse> {
  return request<ResultsResponse>(`/votes/results/${electionId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface ConstituencyResponse {
  id: number;
  name: string;
  type: string | null;
  district_id: number | null;
}

export function listConstituencies(type?: string, cityId?: number): Promise<ConstituencyResponse[]> {
  const params = new URLSearchParams();
  if (type)   params.set("type",    type);
  if (cityId) params.set("city_id", String(cityId));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<ConstituencyResponse[]>(`/locations/constituencies${qs}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN AUTH (hardcoded credentials, no backend call needed)
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL    = "admin@pakvote.gov.pk";
const ADMIN_PASSWORD = "admin123";

export function adminLogin(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function saveAdminAuth() {
  localStorage.setItem("role", "admin");
  localStorage.setItem("admin_token", "admin-session-active");
}

export function clearAdminAuth() {
  localStorage.removeItem("role");
  localStorage.removeItem("admin_token");
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("role") === "admin";
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — ELECTIONS (full CRUD)
// ─────────────────────────────────────────────────────────────────────────────

export interface ElectionCreatePayload {
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  // status is omitted — backend always creates elections as "upcoming"
}

export function createElection(data: ElectionCreatePayload): Promise<ElectionResponse> {
  return request<ElectionResponse>("/elections/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteElection(id: number): Promise<void> {
  return request<void>(`/elections/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — CANDIDATES (full CRUD)
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidateCreatePayload {
  name: string;
  party_name?: string;
  constituency_id: number;
}

export function createCandidate(data: CandidateCreatePayload): Promise<CandidateResponse> {
  return request<CandidateResponse>("/candidates/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteCandidate(id: number): Promise<void> {
  return request<void>(`/candidates/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — LOCATIONS (full CRUD)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProvinceResponse {
  id: number;
  name: string;
}

export interface CityResponse {
  id: number;
  name: string;
  province_id: number | null;
}

export interface DistrictResponse {
  id: number;
  name: string;
  city_id: number | null;
}

export function listProvinces(): Promise<ProvinceResponse[]> {
  return request<ProvinceResponse[]>("/locations/provinces");
}

export function createProvince(name: string): Promise<ProvinceResponse> {
  return request<ProvinceResponse>("/locations/provinces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function listCities(province_id?: number): Promise<CityResponse[]> {
  const qs = province_id ? `?province_id=${province_id}` : "";
  return request<CityResponse[]>(`/locations/cities${qs}`);
}

export function createCity(name: string, province_id: number): Promise<CityResponse> {
  return request<CityResponse>("/locations/cities", {
    method: "POST",
    body: JSON.stringify({ name, province_id }),
  });
}

export function listDistricts(city_id?: number): Promise<DistrictResponse[]> {
  const qs = city_id ? `?city_id=${city_id}` : "";
  return request<DistrictResponse[]>(`/locations/districts${qs}`);
}

export function createDistrict(name: string, city_id: number): Promise<DistrictResponse> {
  return request<DistrictResponse>("/locations/districts", {
    method: "POST",
    body: JSON.stringify({ name, city_id }),
  });
}

export function createConstituency(name: string, type: string, district_id: number): Promise<ConstituencyResponse> {
  return request<ConstituencyResponse>("/locations/constituencies", {
    method: "POST",
    body: JSON.stringify({ name, type, district_id }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — AUDIT TRAIL (Observer Pattern)
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  election_id: number;
  event: string;
  at: string;
}

export function getAuditTrail(): Promise<{ audit_trail: AuditEntry[] }> {
  return request<{ audit_trail: AuditEntry[] }>("/elections/audit-trail");
}
