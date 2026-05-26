import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export function AdminProductsTab() {
  const { products, getProds } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStats('Parsing CSV...');
    try {
      const Papa = (await import('papaparse')).default;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data;
            setUploadStats(`Processing ${rows.length} products...`);
            
            const formattedProducts = rows.map(row => {
              let name = row.Name || row.name || row.Item;
              if (!name) return null;
              let cat = row.Category || row.category;
              if (!cat) {
                const n = name.toLowerCase();
                if (n.includes('paracetamol') || n.includes('pain') || n.includes('balm')) cat = 'Pain Relief';
                else if (n.includes('vitamin') || n.includes('calcium') || n.includes('protein')) cat = 'Vitamins';
                else if (n.includes('syrup') || n.includes('cough')) cat = 'Cold & Flu';
                else cat = 'Medicines';
              }
              const isPopular = String(row.Popular || row.popular || '').toLowerCase() === 'true';
              return {
                name: name.trim(),
                price: parseFloat(row.Price || row.price || row.MRP || 0),
                discount_price: row.DiscountPrice || row.discount_price ? parseFloat(row.DiscountPrice || row.discount_price) : null,
                category: cat,
                stock: parseInt(row.Stock || row.stock || row.Qty || 100),
                brand: row.Brand || row.brand || 'Diamond Chemist',
                unit: row.Unit || row.unit || (row.Pack || row.pack) || '1 unit',
                description: row.Description || row.description || row.Desc || row.desc || '',
                icon: row.Icon || row.icon || 'ti-pill',
                popular: isPopular
              };
            }).filter(Boolean);

            setUploadStats(`Syncing to Database...`);
            const { error } = await supabase.from('products').upsert(formattedProducts, { onConflict: 'name' });
            
            if (error) throw error;
            setUploadStats('Upload Complete! 🎉');
            getProds(); // Refresh products list
            setTimeout(() => setUploadStats(''), 3000);
          } catch (err) {
            alert('Upload failed: ' + err.message);
            setUploadStats('');
          } finally {
            setIsUploading(false);
          }
        }
      });
    } catch {
      alert('Error loading parser');
      setIsUploading(false);
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setEditForm({
      price: prod.price,
      stock: prod.stock,
      popular: prod.popular
    });
  };

  const handleSave = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
          popular: editForm.popular
        })
        .eq('id', id);
        
      if (error) throw error;
      setEditingId(null);
      getProds(); // refresh context
    } catch (err) {
      alert('Failed to update product: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{
        background: '#F5F2EB',
        border: '1.5px dashed #DDD8CE',
        borderRadius: 12,
        padding: '24px 20px',
        textAlign: 'center',
        marginTop: 16,
        position: 'relative',
        marginBottom: 24
      }}>
        {isUploading ? (
          <div>
            <i className="ti ti-loader ti-spin" style={{fontSize: 24, color: 'var(--primary-700)', marginBottom: 8, display: 'inline-block'}} />
            <div style={{fontWeight: 600, color: 'var(--primary-900)'}}>{uploadStats}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{fontWeight: 700, fontSize: 16, color: 'var(--primary-900)', marginBottom: 4}}>
                Bulk Stock Upload
              </div>
              <div style={{fontSize: 13, color: 'var(--text-secondary)'}}>
                Expected columns: Name, Price, Category, Stock.
              </div>
              {uploadStats && <div style={{ color: 'var(--success)', fontWeight: 600, marginTop: 4, fontSize: 13 }}>{uploadStats}</div>}
            </div>
            <label style={{
              background: 'var(--primary-700)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 50,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-block',
              fontSize: 14
            }}>
              <i className="ti ti-upload" style={{marginRight: 6}}></i>
              Select CSV File
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} />
            </label>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-tertiary)' }}></i>
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid var(--border-default)', outline: 'none' }}
          />
        </div>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'nowrap' }}>
          {filteredProducts.length} Products
        </div>
      </div>

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, border: '1px solid var(--border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price (₹)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Popular</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.slice(0, 50).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.category}</td>
                
                <td style={{ padding: '12px 16px' }}>
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editForm.price} 
                      onChange={e => setEditForm({...editForm, price: e.target.value})}
                      style={{ width: 80, padding: 4, borderRadius: 4, border: '1px solid var(--border-default)' }}
                    />
                  ) : (
                    <span>₹{p.price}</span>
                  )}
                </td>
                
                <td style={{ padding: '12px 16px' }}>
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editForm.stock} 
                      onChange={e => setEditForm({...editForm, stock: e.target.value})}
                      style={{ width: 60, padding: 4, borderRadius: 4, border: '1px solid var(--border-default)' }}
                    />
                  ) : (
                    <span style={{ color: p.stock < 10 ? 'var(--danger)' : 'inherit', fontWeight: p.stock < 10 ? 600 : 400 }}>
                      {p.stock}
                    </span>
                  )}
                </td>

                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {editingId === p.id ? (
                    <input 
                      type="checkbox" 
                      checked={editForm.popular}
                      onChange={e => setEditForm({...editForm, popular: e.target.checked})}
                    />
                  ) : (
                    p.popular ? <i className="ti ti-star-filled" style={{ color: '#FCD34D' }}></i> : <i className="ti ti-star" style={{ color: 'var(--border-strong)' }}></i>
                  )}
                </td>

                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {editingId === p.id ? (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => handleSave(p.id)} style={{ padding: '4px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(p)} style={{ padding: '4px 8px', background: 'transparent', color: 'var(--primary-600)', border: '1px solid var(--primary-600)', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
            {filteredProducts.length > 50 && (
              <tr>
                <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, background: 'var(--bg-subtle)' }}>
                  Showing first 50 results. Please use the search bar to find specific products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
