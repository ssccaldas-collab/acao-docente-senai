'use client';

import { useEffect, useState } from 'react';
import { FileText, Upload, Trash2, Download, Loader2 } from 'lucide-react';

interface DocumentRecord {
  id: number;
  document_type: string;
  file_name: string;
  size_bytes: number;
  content_type: string;
  uploaded_at: string;
}

const DOCUMENT_TYPES = [
  { value: 'plano_de_aula', label: 'Plano de aula' },
  { value: 'diario_de_classe', label: 'Diário de classe' },
  { value: 'lista_frequencia', label: 'Lista de frequência' },
  { value: 'avaliacoes', label: 'Avaliações aplicadas' },
  { value: 'outro', label: 'Outro' },
];

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPanel({ cycleId, canUpload, canDelete }: { cycleId: number; canUpload: boolean; canDelete: boolean }) {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('plano_de_aula');
  const [error, setError] = useState('');

  function load() {
    fetch(`/api/ciclos/${cycleId}/documentos`).then(r => r.json()).then(data => { setDocs(data); setLoading(false); });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- load is redefined each render but only needs to re-run when cycleId changes
  useEffect(() => { load(); }, [cycleId]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true); setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);

    const res = await fetch(`/api/ciclos/${cycleId}/documentos`, { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error); return; }
    load();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remover o documento "${name}"?`)) return;
    await fetch(`/api/documentos/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.25rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#211C5C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={17} color="#1565C0" /> Documentos enviados
      </h3>

      {canUpload && (
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={docType} onChange={e => setDocType(e.target.value)}
            style={{ border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.55rem 0.75rem', fontSize: '0.85rem', outline: 'none', background: 'white' }}>
            {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <label className="btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Enviando...' : 'Enviar arquivo'}
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: '0.72rem', color: '#aaa' }}>PDF, Word, Excel ou imagem · até 10MB</span>
        </div>
      )}

      {error && <p style={{ color: '#C62828', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#999', fontSize: '0.85rem' }}>Carregando...</p>
      ) : docs.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Nenhum documento enviado ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {docs.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', background: '#F8F9FA', borderRadius: '0.5rem' }}>
              <FileText size={16} color="#1565C0" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#211C5C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.file_name}</p>
                <p style={{ fontSize: '0.72rem', color: '#999' }}>
                  {DOCUMENT_TYPES.find(t => t.value === d.document_type)?.label ?? d.document_type} · {fmtSize(d.size_bytes)} · {new Date(d.uploaded_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <a href={`/api/documentos/${d.id}/download`} target="_blank" rel="noopener noreferrer"
                style={{ background: '#E3F2FD', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#1565C0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Download size={14} />
              </a>
              {canDelete && (
                <button onClick={() => handleDelete(d.id, d.file_name)}
                  style={{ background: '#FFEBEE', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#C62828', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
