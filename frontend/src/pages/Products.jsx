import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  category: 'bebida',
  sku: '',
  costPrice: '',
  salePrice: '',
  quantity: '',
  lowStockThreshold: '',
};

export default function Products() {
  const { user } = useAuth();
  const canManage = user && ['admin', 'gerente'].includes(user.role);

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadProducts() {
    const { data } = await api.get('/products');
    setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice) || 0,
        salePrice: Number(form.salePrice) || 0,
        quantity: Number(form.quantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Produto atualizado com sucesso.');
      } else {
        await api.post('/products', payload);
        setMessage('Produto criado com sucesso.');
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar produto.');
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      sku: product.sku || '',
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
    });
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja realmente desativar este produto?')) return;
    await api.delete(`/products/${id}`);
    await loadProducts();
  }

  async function handleStockAdjust(id, type) {
    const quantity = Number(window.prompt(`Quantidade para ${type === 'entrada' ? 'entrada' : 'saída'}:`, '1'));
    if (!quantity || quantity <= 0) return;
    try {
      await api.post(`/products/${id}/stock`, { type, quantity, reason: 'ajuste' });
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao ajustar estoque.');
    }
  }

  return (
    <Layout>
      <h2>Produtos</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {canManage && (
        <form className="product-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="bebida">Bebida</option>
            <option value="alimento">Alimento</option>
            <option value="outros">Outros</option>
          </select>
          <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
          <input name="costPrice" type="number" step="0.01" placeholder="Preço de custo" value={form.costPrice} onChange={handleChange} />
          <input name="salePrice" type="number" step="0.01" placeholder="Preço de venda" value={form.salePrice} onChange={handleChange} required />
          {!editingId && (
            <input name="quantity" type="number" placeholder="Quantidade inicial" value={form.quantity} onChange={handleChange} />
          )}
          <input name="lowStockThreshold" type="number" placeholder="Limite estoque baixo" value={form.lowStockThreshold} onChange={handleChange} />
          <button type="submit">{editingId ? 'Atualizar' : 'Adicionar'} produto</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancelar
            </button>
          )}
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Status</th>
            {canManage && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.quantity <= p.lowStockThreshold ? 'low-stock-row' : ''}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>R$ {Number(p.salePrice).toFixed(2)}</td>
              <td>{p.quantity}</td>
              <td>{p.quantity <= p.lowStockThreshold ? 'Estoque baixo' : 'OK'}</td>
              {canManage && (
                <td className="actions">
                  <button onClick={() => handleEdit(p)}>Editar</button>
                  <button onClick={() => handleStockAdjust(p.id, 'entrada')}>+ Estoque</button>
                  <button onClick={() => handleStockAdjust(p.id, 'saida')}>- Estoque</button>
                  <button onClick={() => handleDelete(p.id)}>Desativar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
