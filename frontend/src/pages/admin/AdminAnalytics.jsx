import React, { useEffect, useState } from 'react';
import '../../style.css';

const AdminAnalytics = () => {
  const [totals, setTotals] = useState({ orders: 0, soldItems: 0, revenue: 0 });
  const [productStats, setProductStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all orders from the admin orders endpoint
    fetch("http://localhost:8000/api/admin/orders/")
      .then(response => response.json())
      .then(data => {
        processAnalytics(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, []);

  const processAnalytics = (orders) => {
    // Count total orders (regardless of status)
    const orderCount = orders.length;
    let totalSoldUnits = 0;
    let totalRevenue = 0;
    let statsMap = {};

    orders.forEach(order => {
      // Use case-insensitive comparison for order status
      if (order.status && order.status.toLowerCase() === "confirmed") {
        order.items.forEach(item => {
          const productName = item.product_name;
          const quantity = item.quantity;
          const price = parseFloat(item.product_price);
          
          totalSoldUnits += quantity;
          totalRevenue += price * quantity;
          
          if (!statsMap[productName]) {
            statsMap[productName] = {
              name: productName,
              count: 0,
              revenue: 0,
              image: item.product_image
            };
          }
          statsMap[productName].count += quantity;
          statsMap[productName].revenue += price * quantity;
        });
      }
    });

    // Sort product statistics by units sold in descending order
    const sortedStats = Object.values(statsMap).sort((a, b) => b.count - a.count);

    setTotals({
      orders: orderCount,
      soldItems: totalSoldUnits,
      revenue: totalRevenue.toFixed(2)
    });
    setProductStats(sortedStats);
  };

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div className="admin-orders-container">
      <h2 className="admin-orders-title">Product Analytics</h2>

      <div className="analytics-summary">
        <div>Total Orders: <strong>{totals.orders}</strong></div>
        <div>Total Items Sold: <strong>{totals.soldItems}</strong></div>
        <div>Total Revenue: <strong>${totals.revenue}</strong></div>
      </div>

      <div className="analytics-table">
        <div className="analytics-header">
          <div>Product</div>
          <div>Units Sold</div>
          <div>Total Revenue</div>
        </div>

        {productStats.length === 0 ? (
          <p>No sold products (orders confirmed) yet.</p>
        ) : (
          productStats.map((product, index) => (
            <div className="analytics-row" key={index}>
              <div>
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '40px', height: '40px', marginRight: '10px', objectFit: 'cover' }}
                  />
                )}
                {product.name}
              </div>
              <div>{product.count}</div>
              <div>${product.revenue.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
