import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { onSnapshot, collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { useCart } from "react-use-cart";

const Cart = () => {
    const { items, updateItemQuantity, removeItem } = useCart();
    const [car, setCar] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemTel, setItemTel] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    // Fetch Firestore data on component mount
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'blogs'), (snapshot) => {
            const updatedCar = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                price: doc.data().price // Ensure price is correctly accessed
            }));
            setCar(updatedCar);
        });

        return () => unsubscribe();
    }, []);

    // Calculate total price based on items and Firestore data
    useEffect(() => {
        const calculateTotalPrice = () => {
            let total = 0;
            items.forEach(item => {
                const firestoreItem = car.find(firebaseItem => firebaseItem.id === item.id);
                if (firestoreItem) {
                    total += parseFloat(firestoreItem.price) * item.quantity;
                }
            });
            setTotalPrice(total);
        };

        calculateTotalPrice();
    }, [items, car]);

    // Increase item quantity in cart
    const handleIncreaseQuantity = (itemId) => {
        updateItemQuantity(itemId, items.find(item => item.id === itemId).quantity + 1);
    };

    // Decrease item quantity in cart
    const handleDecreaseQuantity = (itemId) => {
        const currentItem = items.find(item => item.id === itemId);
        if (currentItem.quantity > 1) {
            updateItemQuantity(itemId, currentItem.quantity - 1);
        }
    };

    // Remove item from cart and mark as deleted in Firestore
    const handleRemoveItem = async (itemId) => {
        try {
            removeItem(itemId); // Remove item from local cart state

            const itemRef = doc(db, 'blogs', itemId);
            await updateDoc(itemRef, { deleted: true }); // Mark item as deleted in Firestore

        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

   
    const openModal = (itemId, itemName, itemTel) => {
        setItemName(itemName);
        
        const firestoreItem = car.find(firebaseItem => firebaseItem.id === itemId);
        if (firestoreItem) {
            setItemTel(firestoreItem.tel); 
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setItemName('');
        setItemTel('');
        setShippingAddress('');
        setIsModalOpen(false);
    };

    // Handle submission of edited item details in modal
    const handleModalSubmit = async () => {
        if (!itemName || !itemTel || !shippingAddress) {
            console.error("Please fill all required fields.");
            return;
        }

        try {
            // Prepare cart items for the order
            const orderItems = items.map(item => ({
                id: item.id,
                name: item.category, 
                quantity: item.quantity,
                img: item.img,
                price: car.find(firebaseItem => firebaseItem.id === item.id).price // Ensure price is correctly accessed
                }));
                
                // Calculate total price
                const total = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                
                // Prepare order object to be passed to Zakazlar component
                const orderObject = {
                    items: orderItems,
                    itemName: itemName,
                    tel: itemTel, // Use the edited itemTel from modal
                totalPrice: total.toFixed(2), // Ensure totalPrice is formatted correctly
                shippingAddress: shippingAddress,
                createdAt: new Date()
                
            };

            // Call a function to handle adding order to Firestore
            addOrderToFirestore(orderObject);

            // Reset modal state and clear cart items
            setIsModalOpen(false);
            items.forEach(item => removeItem(item.id));

            // Example of redirecting after successful action
            // window.location.href = '/orders';

        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    const addOrderToFirestore = async (orderObject) => {
        try {
            
            const newOrderRef = await addDoc(collection(db, 'orders'), orderObject);
            console.log("Document written with ID: ", newOrderRef.id);

        } catch (error) {
            console.error("Error adding order:", error);
        }
    };

    return (
        <section className="text-gray-600 body-font">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Xarid qilish</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((item) => {
                        const firestoreItem = car.find(firebaseItem => firebaseItem.id === item.id);
                        return (
                            <div key={item.id} className="cart_box max-w-sm rounded overflow-hidden shadow-lg">
                                <img className="w-full h-64 object-cover object-center" src={item.img} alt="Item" />
                                <div className="px-6 py-4">
                                    <div className="">
                                        <div className="font-bold text-xl mb-2">{item.category}</div>
                                        <div className="xarid_box">
                                            <button onClick={() => handleDecreaseQuantity(item.id)} className="minus">-</button>
                                            <span className="mr-2">{item.quantity}</span>
                                            <button onClick={() => handleIncreaseQuantity(item.id)} className="plus">+</button>
                                            <span className="mr-2">
                                                ${firestoreItem ? (firestoreItem.price * item.quantity).toFixed(2) : 'Loading...'}
                                            </span>

                                            <button className="ochirish" onClick={() => handleRemoveItem(item.id)}>O'chirish</button>
                                            
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-base">{item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8">
                    <p className="text-xl font-bold">Jami Summa: ${totalPrice.toFixed(2)}</p>
                </div>
            </div>

            {/* Button to open modal */}
            <button className="zakaz" onClick={() => setIsModalOpen(true)}>Zakaz Berish</button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Malumotlaringizni kiriting</h2>
                        <input
                            type="text"
                            name="itemName"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
                            placeholder="Ismingiz"
                        />
                        <input
                            type="number" 
                            name="itemTel"
                            value={itemTel}
                            onChange={(e) => setItemTel(e.target.value)}
                            className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
                            placeholder="Telephone No'meringiz"
                        />
                        <input
                            type="text"
                            name="shippingAddress"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
                            placeholder="Yetkazib berish manzili"   
                        />
                        <div className="flex justify-end">
                            <button className="text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded mr-2" onClick={closeModal}>Close</button>
                            <button className="text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded" onClick={handleModalSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Cart;
