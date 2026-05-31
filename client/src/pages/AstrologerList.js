import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import AstrologerCard from '../components/astrologer/AstrologerCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './AstrologerList.css';

const SPECS = ['All', 'Vedic', 'Numerology', 'Tarot', 'Vastu', 'KP', 'Palmistry', 'Gemology'];
const SORTS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
];

export default function AstrologerList() {
  const [params] = useSearchParams();
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    specialization: params.get('specialization') || '',
    sort: 'rating',
    minPrice: '',
    maxPrice: '',
  });

  const fetchAstrologers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...filters, page, limit: 12 });
      if (!filters.specialization) query.delete('specialization');
      const { data } = await api.get(`/astrologers?${query}`);
      setAstrologers(data.astrologers || []);
      setTotal(data.total || 0);
    } catch {
      setAstrologers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchAstrologers(); }, [fetchAstrologers]);

  return (
    <div className="page">
      <div className="container">
        <div className="list-header">
          <div>
            <h1>Find Your Astrologer</h1>
            <p className="text-muted">{total} astrologers available</p>
          </div>
        </div>

        {/* Spec filter */}
        <div className="spec-filter">
          {SPECS.map(s => (
            <button key={s}
              className={`spec-btn ${(s === 'All' ? !filters.specialization : filters.specialization === s) ? 'active' : ''}`}
              onClick={() => { setFilters({ ...filters, specialization: s === 'All' ? '' : s }); setPage(1); }}>
              {s}
            </button>
          ))}
        </div>

        {/* Sort & Price */}
        <div className="filter-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            <select className="input" style={{ width: 180 }} value={filters.sort}
              onChange={e => setFilters({ ...filters, sort: e.target.value })}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Price/min:</span>
            <input className="input" style={{ width: 95 }} type="number" placeholder="Min Rs."
              value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
            <span>–</span>
            <input className="input" style={{ width: 95 }} type="number" placeholder="Max Rs."
              value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : astrologers.length === 0 ? (
          <div className="empty-state">
            <FiSearch size={40} />
            <p>No astrologers found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid-4" style={{ marginTop: 24 }}>
              {astrologers.map(a => <AstrologerCard key={a._id} astrologer={a} />)}
            </div>
            {/* Pagination */}
            {total > 12 && (
              <div className="pagination">
                <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span style={{ fontSize: 14 }}>Page {page} of {Math.ceil(total / 12)}</span>
                <button className="btn btn-outline" disabled={page * 12 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
