import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products').then(({ data }) => setProducts(data));
  }, []);

  function addToCart() {
    if (!selectedProduct || quantity <= 0) return;
    const product = products.find((p) => String(p.id) === String(selectedProduct));
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.salePrice),
          quantity: Number(quantity),
        },
      ];
    });
    setSelectedProduct('');
    setQuantity(1);
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function handleFinishSale() {
    setError('');
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      setReceipt(data);
      setCart([]);
      const { data: refreshed } = await api.get('/products');
      setProducts(refreshed);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar venda.');
    }
  }

  return (
    <Layout>
      <h2>Registrar venda</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="sale-form">
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
          <option value="">Selecione um produto</option>
          {products.filter((p) => p.quantity > 0).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (R$ {Number(p.salePrice).toFixed(2)}) — {p.quantity} em estoque
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button type="button" onClick={addToCart}>Adicionar</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Preço unit.</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>R$ {item.unitPrice.toFixed(2)}</td>
              <td>R$ {(item.unitPrice * item.quantity).toFixed(2)}</td>
              <td>
                <button onClick={() => removeFromCart(item.productId)}>Remover</button>
              </td>
            </tr>
          ))}
          {cart.length === 0 && (
            <tr>
              <td colSpan={5}>Nenhum item adicionado.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="sale-summary">
        <strong>Total: R$ {total.toFixed(2)}</strong>
        <button type="button" disabled={cart.length === 0} onClick={handleFinishSale}>
          Finalizar venda
        </button>
      </div>

      {receipt && (
        <div className="receipt">
          <h3>Cupom de venda #{receipt.id}</h3>
          <p>{new Date(receipt.createdAt).toLocaleString('pt-BR')}</p>
          <ul>
            {receipt.items.map((item) => (
              <li key={item.id}>
                {item.quantity}x {item.productName} — R$ {Number(item.subtotal).toFixed(2)}
              </li>
            ))}
          </ul>
          <strong>Total: R$ {Number(receipt.total).toFixed(2)}</strong>
        </div>
      )}
    </Layout>
  );
}
