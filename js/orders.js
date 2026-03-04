import { 
    collection, 
    query, 
    where, 
    getDocs,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const ordersContainer = document.getElementById("ordersContainer");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "customer-login.html";
        return;
    }

    try {
        const q = query(
            collection(db, "orders"),
            where("email", "==", user.email),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            ordersContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="font-size: 18px; color: #666;">📦 Abhi koi order nahi hai</p>
                    <a href="index.html" style="color: #007bff; text-decoration: none;">
                        Products browse karein →
                    </a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = querySnapshot.docs.map((doc) => {
            const order = doc.data();
            const orderDate = new Date(order.createdAt.seconds * 1000);
            const statusColor = getStatusColor(order.status);

            return `
                <div style="
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <p style="margin: 0; font-size: 14px; color: #888;">
                                Order ID: <strong>${doc.id.substring(0, 8)}...</strong>
                            </p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #aaa;">
                                ${orderDate.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <span style="
                            background: ${statusColor};
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            text-transform: uppercase;
                        ">
                            ${order.status}
                        </span>
                    </div>

                    <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
                            <strong>📍 Delivery Address:</strong>
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #333;">
                            ${order.address}
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">
                            <strong>📞 ${order.phone}</strong> - ${order.customerName}
                        </p>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-size: 13px; color: #666;">
                            <strong>📦 Items:</strong>
                        </p>
                        ${order.items.map(item => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #eee;
                                font-size: 13px;
                            ">
                                <span>${item.name} × ${item.quantity}</span>
                                <span style="color: #666;">₹${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div style="
                        display: flex;
                        justify-content: space-between;
                        padding-top: 15px;
                        border-top: 2px solid #007bff;
                        font-size: 16px;
                        font-weight: bold;
                    ">
                        <span>Total Amount:</span>
                        <span style="color: #007bff;">₹${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = `
            <p style="color: red;">❌ Error loading orders. Please try again.</p>
        `;
    }
});

// Helper function for status color
function getStatusColor(status) {
    switch(status) {
        case 'pending': return '#FFC107';
        case 'accepted': return '#28A745';
        case 'rejected': return '#DC3545';
        default: return '#6C757D';
    }
}