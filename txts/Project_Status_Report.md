# Diamond Chemist Platform — Project Status Report
**Developer:** Advait
**Date:** May 2026

---

## 🟢 Phase 1: Completed & Ready for Review
The core foundation of the Diamond Chemist platform has been successfully developed and is ready for your feedback.

### 1. Medicine E-Commerce Store
- **Beautiful Storefront:** A modern, mobile-friendly interface with product categories and a "Most Ordered" section.
- **Smart Search (with Fuzzy Spell Check):** Customers can search for medicines by name or symptom (e.g., "fever"), and it automatically handles spelling mistakes (e.g., "adalas" -> "Adulsa").
- **Cart & Checkout:** Full shopping cart functionality with a seamless checkout process.
- **Customer Convenience:** Amazon-style auto-fill remembers customer details, and a dedicated "My Orders" page allows users to view their complete order history without needing a complex login.
- **Admin Dashboard:** A real-time dashboard for you to view, manage, and update the status of incoming medicine orders instantly.

### 2. Print-on-Demand E-Commerce
- **Automated Print Wizard:** A simple 4-step process for customers to upload PDFs/Images, configure settings, and pay.
- **Advanced Print Settings:** Customers can select colour/B&W, copies, paper size, and binding type (Long Edge Book flip vs. Short Edge Calendar flip), accompanied by a live visual preview.
- **Special Instructions:** Customers can add custom notes directly to the shopkeeper before printing.
- **Real-Time Pricing:** The price calculates automatically based on colour, sides, paper size, and copies.
- **Automated Print Agent:** Custom software built for your shop computer that automatically receives paid orders and sends them directly to your physical printer without human intervention.
- **Privacy & Security:** Customer documents are stored securely and automatically deleted after 48 hours. Secure 4-character pickup codes ensure the right person collects the prints.

### 3. Security & Infrastructure
- **Data Privacy:** Bank-level AES-256 encryption protects customer phone numbers and sensitive data.
- **Cloud Infrastructure:** Built on scalable, high-performance cloud servers for maximum speed and reliability.

---

## ⏸️ On Hold: Waiting for Your Information
These features are fully designed and coded, but they are currently "paused" because we need specific business details and accounts from you to activate them for the public.

**1. Live Online Payments (Razorpay)**
- *Status:* Currently in "Test Mode".
- *Reason:* We need your Business PAN, GST (if applicable), and Bank Account details to complete Razorpay KYC and accept real UPI/Card payments.

**2. Automated SMS Notifications**
- *Status:* Code is ready to send alerts.
- *Reason:* We need your Shop Mobile Number and a registered MSG91/DLT account to legally send transactional SMS (order updates, print failure alerts) to customers in India.

**3. Hyper-Local Delivery Geofencing**
- *Status:* The distance calculator is built.
- *Reason:* We need the exact GPS coordinates (Latitude/Longitude) of the shop to restrict deliveries strictly within the agreed 50-metre radius.

**4. Automated Printing (Agent Setup)**
- *Status:* The agent software is built.
- *Reason:* We need to install it on your specific Windows computer and get the exact Windows Printer Name (e.g., "HP LaserJet M404").

**5. Live Web Domain**
- *Status:* Running on a test server.
- *Reason:* We need to finalize and purchase your `.in` or `.com` domain name (e.g., diamondchemist.in).

---

## 📋 Checklist: What I Need From You Today
To take this platform live, please provide the following details:

- [ ] Exact Shop Name & Full Address (for invoices and terms of service).
- [ ] Owner's Mobile Number & Email Address (to create your secure Admin Login).
- [ ] Business PAN and GST Number (for Razorpay).
- [ ] Cancelled Cheque (for payment gateway payouts).
- [ ] Exact Shop GPS Coordinates (we can get this from Google Maps today).
- [ ] Your preferred Domain Name choice.
- [ ] A CSV/Excel list of your real medicines and prices to replace the demo data.
- [ ] Your exact Printer Brand & Model name.

---

## 🚀 Phase 2: Planned Future Updates
Once we launch this core platform and everything is running smoothly, here is what we are planning to build next:

- **Bulk Stock Upload:** An easy Excel uploader in the admin panel to update hundreds of product prices at once.
- **WhatsApp API Integration:** Richer order updates via WhatsApp instead of standard SMS.
- **Automated GST Invoices:** Auto-generating and emailing PDF invoices to customers.
- **Low Stock Alerts:** Automatic warnings when popular medicines are running out of stock.
- **Prescription Verification:** A dedicated workflow for you to verify customer prescriptions before approving Schedule H drug orders.

---

## 🏦 Appendix: How to Register for Razorpay (Action for Chemist)
To start accepting live UPI, Credit Card, and Debit Card payments on your website, you need to create your own merchant account on Razorpay. Follow these steps:

### Step 1: Create an Account
1. Go to [https://razorpay.com](https://razorpay.com) and click **"Sign Up"**.
2. Sign up using your official business email address (e.g., `diamondchemist@gmail.com`).
3. Verify your email address by clicking the link sent to your inbox.

### Step 2: Fill in Business Details
1. Log in to your new Razorpay Dashboard.
2. Select your business type (usually **"Proprietorship"** or **"Partnership"** depending on your shop's registration).
3. Enter your business category (Healthcare / Pharmacy) and your business name exactly as it appears on your PAN card.

### Step 3: Complete KYC (Know Your Customer)
You will need to upload digital photos/scans of the following documents:
- **Personal PAN Card** (or Business PAN if registered as a company)
- **Aadhar Card / Voter ID** (for identity verification)
- **GST Registration Certificate** (If you have GST. If not, select "My business does not have a GST number" and provide your Shop Act / Gumasta License instead).
- **Bank Account Details**: A scanned copy of a cancelled cheque or a recent bank statement for the account where you want the daily money deposited.

### Step 4: Generate TEST API Keys for the Developer
You don't need KYC approval to generate *Test* keys! We need these immediately to start building the integration.
1. Log in to the Razorpay Dashboard.
2. Ensure you are in **"Test Mode"** (toggle in the top left corner).
3. Go to **Settings** -> **API Keys** -> **Generate Key**.
4. Send the `Test Key Id` and `Test Key Secret` to your developer.

### Step 5: Website Approval & Going LIVE
Razorpay requires a functioning website with legal policies (Terms & Conditions, Privacy Policy, Refunds) before they will give you the **Live Keys**. Here is how we handle it:
1. The developer will use your Test Keys to host a temporary version of the website (e.g., `diamondchemist.netlify.app`) with all the required legal pages already built in.
2. You will submit this temporary website URL inside your Razorpay KYC dashboard.
3. Razorpay will review the website (usually takes 1-3 days).
4. Once approved, switch your Razorpay dashboard to **"Live Mode"**, generate the **Live API Keys**, and send them to the developer.
5. The developer will swap out the test keys for the live keys, and your website will start accepting real money into your bank account!
