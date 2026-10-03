import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryRes, topRes, lowStockRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/top-products'),
          api.get('/dashboard/low-stock'),
        ]);
        setSummary(summaryRes.data);
        setTopProducts(topRes.data);
        setLowStock(lowStockRes.data);
      } catch {
        setError('Não foi possível carregar o dashboard.');
      }
    }
    loadData();
  }, []);

  return (
    <Layout>
      <h2>Dashboard</h2>
      {error && <p className="error-message">{error}</p>}

      {summary && (
        <div className="metrics-grid">
          <div className="metric-card">
            <span>Faturamento hoje</span>
            <strong>R$ {Number(summary.dailyRevenue).toFixed(2)}</strong>
          </div>
          <div className="metric-card">
            <span>Faturamento no mês</span>
            <strong>R$ {Number(summary.monthlyRevenue).toFixed(2)}</strong>
          </div>
          <div className="metric-card">
            <span>Vendas hoje</span>
            <strong>{summary.salesToday}</strong>
          </div>
          <div className="metric-card">
            <span>Produtos ativos</span>
            <strong>{summary.totalProducts}</strong>
          </div>
          <div className="metric-card warning">
            <span>Estoque baixo</span>
            <strong>{summary.lowStockCount}</strong>
          </div>
        </div>
      )}

      <div className="dashboard-panels">
        <section className="panel">
          <h3>Produtos mais vendidos</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd. vendida</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.productId}>
                  <td>{p.productName}</td>
                  <td>{p.totalQuantity}</td>
                  <td>R$ {Number(p.totalRevenue).toFixed(2)}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3}>Nenhuma venda registrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h3>Alertas de estoque baixo</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Limite</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.lowStockThreshold}</td>
                </tr>
              ))}
              {lowStock.length === 0 && (
                <tr>
                  <td colSpan={3}>Nenhum produto com estoque baixo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
