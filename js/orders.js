import { collection, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const ordersContainer = document.getElementById("ordersContainer");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "customer-login.html";
    return;
  }

  console.log("Logged in user email:", user.email);

  const q = query(
    collection(db, "orders"),
    where("email", "==", user.email)
  );

  const querySnapshot = await getDocs(q);

  console.log("Total docs found:", querySnapshot.size);

  if (querySnapshot.empty) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  querySnapshot.forEach((doc) => {

    const order = doc.data();

    const orderDiv = document.createElement("div");
    orderDiv.style.border = "1px solid #ddd";
    orderDiv.style.padding = "15px";
    orderDiv.style.marginBottom = "15px";

    orderDiv.innerHTML = `
      <p><strong>Order ID:</strong> ${doc.id}</p>
      <p><strong>Total:</strong> ₹${order.totalAmount}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
      <hr/>
    `;

    ordersContainer.appendChild(orderDiv);

  });

});
