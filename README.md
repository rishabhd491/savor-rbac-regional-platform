# 🍽️ SAVOR.
 
A sophisticated, full-stack food ordering platform featuring advanced **Role-Based Access Control (RBAC)** and strict **Regional Isolation**.

---

## 🚀 Key Features

### **1. Regional Isolation & Re-BAC**
*Savor* implements strict regional boundaries to ensure data privacy and operational focus:
- **India Region:** Users in India are strictly confined to Indian restaurants and order history.
- **America Region:** Users in America see US-based restaurants and local orders.
- **Strict Filtering:** Non-admin users cannot see orders from outside their assigned country.

### **2. Role-Based Permissions (RBAC)**
- **Admin:** Global visibility. Can oversee orders across all regions, manage payment methods, and perform cross-regional actions.
- **Manager:** Regional authority. Can manage fulfillment, update order statuses, and view all orders within their specific country.
- **Member:** Consumer access. Can browse local restaurants and add items to their cart.

### **3. Controlled Checkout Flow (India-Specific)**
The application features a unique multi-step checkout flow for the India region:
- **Direct Checkout Disabled:** The "Checkout" button on the main page is replaced with **"View in Cart"** for all India-based users.
- **Role-Restricted Orders:** Only **Admins** and **Managers** in India can proceed to final payment and order placement from the dedicated Cart page. **Members** in India have a view-only cart.

### **4. Modern User Interface**
- **Bento-Style Design:** A high-performance, responsive UI built with Tailwind CSS.
- **Dedicated Login:** A specialized login portal for seamless role and region simulation.
- **Shared Cart:** Real-time cart synchronization across the session.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Apollo Client
- **Backend:** NestJS, GraphQL (Apollo), Prisma ORM
- **Database:** SQLite (Relational)
- **State Management:** React Context + Apollo Cache

---

## 🏃 Getting Started

### **1. Installation**
```bash
# Install Backend dependencies
cd backend && npm install --legacy-peer-deps

# Install Frontend dependencies
cd ../frontend && npm install --legacy-peer-deps
```

### **2. Database Setup**
```bash
cd backend
npx prisma db push
npm run seed
```

### **3. Launch**
**Backend:** `npm run start:dev` (Port 3000)  
**Frontend:** `npm run dev` (Port 3001)

---

## 🧪 Testing Scenarios

1. **Admin/Manager India:** Go to the Restaurants page, add items, click "View in Cart", and proceed to Checkout.
2. **Member India:** Add items to cart, click "View in Cart". Notice the checkout/payment section is hidden.
3. **Regional Privacy:** Log in as "Manager India". Verify that American orders are not visible in the Orders history.
