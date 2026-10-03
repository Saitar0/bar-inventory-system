import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [salesRes, movementsRes] = await Promise.all([
          api.get('/sales'),
          api.get('/products/movements'),
        ]);
        setSales(salesRes.data);
        setMovements(movementsRes.data);
      } catch {
        setError('Não foi possível carregar os relatórios.');
      }
    }
    loadData();
  }, []);

  return (
    <Layout>
      <h2>Relatórios</h2>
      {error && <p className="error-message">{error}</p>}

      <section className="panel">
        <h3>Histórico de vendas</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Itens</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                <td>{sale.items?.length || 0}</td>
                <td>R$ {Number(sale.total).toFixed(2)}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhuma venda registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h3>Movimentação de estoque</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Quantidade</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                <td>{m.product?.name}</td>
                <td>{m.type}</td>
                <td>{m.reason}</td>
                <td>{m.quantity}</td>
                <td>{m.newQuantity}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={6}>Nenhuma movimentação registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
