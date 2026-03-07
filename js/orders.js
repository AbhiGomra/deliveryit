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
                <div style="
                    text-align: center; 
                    padding: 60px 20px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                ">
                    <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
                    <p style="font-size: 20px; color: #333; margin-bottom: 8px; font-weight: 600;">No orders yet</p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Start shopping to see your orders here</p>
                    <a href="index.html" style="
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 14px 32px;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    ">
                        Browse Products →
                    </a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = querySnapshot.docs.map((doc) => {
            const order = doc.data();
            const orderDate = order.createdAt && order.createdAt.seconds 
                ? new Date(order.createdAt.seconds * 1000) 
                : new Date();
            const statusColor = getStatusColor(order.status || 'pending');
            const statusBg = getStatusBg(order.status || 'pending');

            return `
                <div style="
                    background: white;
                    border: 1px solid #e8e8e8;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)'" 
                   onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'">
                    
                    <!-- Order Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0;">
                        <div>
                            <p style="margin: 0; font-size: 13px; color: #888; font-weight: 500;">
                                Order ID
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 15px; color: #333; font-weight: 600; font-family: 'Courier New', monospace;">
                                #${doc.id.substring(0, 10).toUpperCase()}
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 13px; color: #999;">
                                ${orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <span style="
                            background: ${statusBg};
                            color: ${statusColor};
                            padding: 10px 20px;
                            border-radius: 25px;
                            font-size: 13px;
                            font-weight: 600;
                            text-transform: capitalize;
                            border: 1px solid ${statusColor}30;
                        ">
                            ${order.status}
                        </span>
                    </div>

                    <!-- Customer Details Card -->
                    <div style="
                        background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                    ">
                        <p style="margin: 0 0 12px 0; font-size: 12px; color: #667eea; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            👤 Customer Details
                        </p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Name
                                </p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #333; font-weight: 600;">
                                    ${order.customerName || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Phone
                                </p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #333; font-weight: 600;">
                                    📞 ${order.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div style="margin-top: 16px;">
                            <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
                                📍 Delivery Address
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 14px; color: #444; line-height: 1.5;">
                                ${order.address || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 16px 0; font-size: 12px; color: #667eea; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            📦 Order Items (${order.items.length})
                        </p>
                        <div style="background: #fafafa; border-radius: 12px; overflow: hidden;">
                            ${order.items.map((item, index) => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 14px 16px;
                                    ${index < order.items.length - 1 ? 'border-bottom: 1px solid #eee;' : ''}
                                ">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
                                            border-radius: 10px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-size: 18px;
                                        ">
                                            🛒
                                        </div>
                                        <div>
                                            <p style="margin: 0; font-size: 14px; color: #333; font-weight: 500;">
                                                ${item.name}
                                            </p>
                                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #888;">
                                                ₹${item.price.toFixed(2)} × ${item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <span style="font-size: 14px; color: #333; font-weight: 600;">
                                        ₹${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Order Total -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 20px;
                        border-top: 2px dashed #e8e8e8;
                    ">
                        <div>
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                Payment Method: <strong style="color: #28a745;">Cash on Delivery</strong>
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 13px; color: #888;">
                                Total Amount
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 26px; color: #667eea; font-weight: 700;">
                                ₹${order.totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = `
            <div style="
                text-align: center; 
                padding: 40px;
                background: #fff5f5;
                border-radius: 16px;
                border: 1px solid #ffc9c9;
            ">
                <p style="color: #dc3545; font-size: 16px; margin: 0;">❌ Error loading orders</p>
                <p style="color: #888; font-size: 14px; margin: 8px 0 0 0;">Please try again later</p>
            </div>
        `;
    }
});

// Helper function for status color
function getStatusColor(status) {
    switch(status) {
        case 'pending': return '#f59e0b';
        case 'accepted': return '#10b981';
        case 'rejected': return '#ef4444';
        case 'delivered': return '#6366f1';
        default: return '#6b7280';
    }
}

// Helper function for status background
function getStatusBg(status) {
    switch(status) {
        case 'pending': return '#fef3c7';
        case 'accepted': return '#d1fae5';
        case 'rejected': return '#fee2e2';
        case 'delivered': return '#e0e7ff';
        default: return '#f3f4f6';
    }
}