import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { notification } from "antd";

export const SignIn = () => {
    const [userLogin, setUserLogin] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();

        try { 
            const users = await signInWithEmailAndPassword(
                auth,
                userLogin.email,
                userLogin.password
            );

            const q = query(
                collection(db, 'users'), // "user" o'rniga "users" nomi to'g'ri bo'lishi kerak
                where('uid', '==', users.user.uid)
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let user;
                querySnapshot.forEach((doc) => {
                    user = doc.data();
                });
                
                // localStorage ga user ma'lumotini yozish
                localStorage.setItem('user', JSON.stringify(user));

                // Foydalanuvchi roli boyicha yo'nalish
                if (user?.role === 'user') {
                    navigate('/userpage'); // Foydalanuvchi sahifasiga yo'nalish
                    notification.success({
                        message: "Xush kelibsiz foydalanuvchi",
                    });
                } else {
                    navigate('/dashboard'); // Admin paneliga yo'nalish
                    notification.success({
                        message: "Xush kelibsiz admin",
                    });
                }
            });

            // onSnapshot() funksiyasini o'chirish
            return () => unsubscribe();
        } catch (error) {
            setError(error.message); // Xatolarni konsolga chiqarish
        }
    };

    return (
        <div>
            <section className="text-gray-600 body-font">
                <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
                    <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
                        <h1 className="title-font font-medium text-3xl text-gray-900">Slow-carb next level shoindcgoitch ethical authentic, poko scenester</h1>
                        <p className="leading-relaxed mt-4">Poke slow-carb mixtape knausgaard, typewriter street art gentrify hammock starladder roathse. Craies vegan tousled etsy austin.</p>
                    </div>
                    <form onSubmit={onSubmit} className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
                        <h2 className="text-gray-900 text-lg font-medium title-font mb-5">Sign In</h2>

                        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                        
                        <div className="relative mb-4">
                            <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={userLogin.email}
                                onChange={(e) => setUserLogin({ ...userLogin, email: e.target.value })}
                                name="email" 
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                value={userLogin.password}
                                onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                                name="password" 
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                        </div>
                        <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Button</button>
                        <p className="text-xs text-gray-500 mt-3">Literally you probably heard of them jean shorts.</p>
                    </form>
                </div>
            </section>
        </div>
    );
}
