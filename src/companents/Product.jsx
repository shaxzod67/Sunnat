import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { FaHeart } from "react-icons/fa";
import { useCart } from 'react-use-cart';

const Home = () => {
    const [car, setCar] = useState([]);
    const [shopItems, setShopItems] = useState({});
    const [likedItems, setLikedItems] = useState({});
    const { addItem } = useCart();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'blogs'), (snapshot) => {
            const updatedCar = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                price: doc.data().price
            }));
            setCar(updatedCar);

            setLikedItems(updatedCar.reduce((acc, item) => {
                acc[item.id] = { liked: false };
                return acc;
            }, {}));

            setShopItems(updatedCar.reduce((acc, item) => {
                acc[item.id] = { shop: false };
                return acc;
            }, {}));
        });

        return () => unsubscribe();
    }, []);

    const handleShopToggle = (itemId) => {
        setShopItems(prevItems => ({
            ...prevItems,
            [itemId]: { ...prevItems[itemId], shop: !prevItems[itemId]?.shop }
        }));
    };

    const handleLikeToggle = (itemId) => {
        setLikedItems(prevItems => ({
            ...prevItems,
            [itemId]: { ...prevItems[itemId], liked: !prevItems[itemId]?.liked }
        }));
    };

    return (
        <div className="products">
            {car.map(item => (
                <div key={item.id} className="product__box">
                    <img className="product__image" src={item.img} alt={item.category} />
                    <div className="product__details">
                        <div className="product__category">{item.category}</div>
                        <p className="product__description">{item.description}</p>
                        <div className="product__price">${item.price}</div>
                        <div className="product__actions">
                        <button onClick={() => {
                                            handleLikeToggle(item.id);
                                            addItem({
                                                id: item.id,
                                                category: item.category,
                                                img: item.img,
                                                price: item.price,
                                                quantity: 1
                                            });
                                        }} className="heart-icon ">
                                            <FaHeart className={ likedItems[item.id]?.liked ? 'text-red-500 '  : 'text-white'} />
                                        </button><br />
                            <button
                                onClick={() => {
                                    handleShopToggle(item.id);
                                    addItem({
                                        id: item.id,
                                        category: item.category,
                                        img: item.img,
                                        price: item.price,
                                        quantity: 1
                                    });
                                }}
                                className="add_to_cart"
                            >
                                
                                Savatga Qo'shish
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Home;
