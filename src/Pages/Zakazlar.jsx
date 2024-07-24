import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Zakazlar = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'orders'));
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersData);
                console.log(ordersData); // Log updated ordersData after setting state
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Handle error fetching data
            }
        };

        fetchOrders();
    }, []); // Empty dependency array ensures it runs once on component mount

    // Function to delete an order
    const handleDeleteOrder = async (orderId) => {
        try {
            await deleteDoc(doc(db, 'orders', orderId));
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            // Handle error deleting data
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Zakazlar</h1>
            <ul>
                {orders.length > 0 ? (
                    orders.map(order => (
                        <li key={order.id} className="bg-gray-100 rounded-lg p-4 mb-4">
                            <h2>Zakaz berilgan Mahsulotlar  </h2>
                            {/* Render items within each order */}
                            {order.items && order.items.map(item => (
                                <div key={item.id}>
                                    <img src={item.img} alt={item.name} width="100px" height="100px" />
                                    <p>{item.name}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Narxi: ${item.price}</p>
                                    <br />
                                    {/* Display telephone number */}
                                </div>
                            ))}
                            <h1>Ismi: {order.itemName}</h1>
                        <p>Telephone Number: {order.tel}</p>
                            <p>Yetkazib berish manzili: {order.shippingAddress || 'Shipping address not available'}</p>
                            <p>Jami Narxi: ${order.totalPrice || 'Price not available'}</p>
                            <button onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No orders found</p>
                )}
            </ul>
        </div>
    );
};

export default Zakazlar;
