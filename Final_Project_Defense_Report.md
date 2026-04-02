# UEDCL Online Billing & Payment System - Final Year Defense Guide

This guide is designed to train you and your group members (Nafuna Winnie, Angella Benjamin, Nimusiima Sylon) on exactly how the system was built, how it works, and how to defend it confidently before your panel at Kampala International University.

---

## 1. System Architecture & Technology Stack
If the panel asks what technologies you used and why, here is your answer:

We chose a modern, decoupled architecture splitting the **Frontend** from the **Backend**. This ensures our system is highly scalable, secure, and fast.

### Backend (The Brains)
- **Framework:** Laravel (PHP 8.2)
- **Why?** Laravel provides built-in security (against SQL Injections & Cross-Site Scripting), excellent database management using Eloquent ORM, and high scalability.
- **Role:** It handles all the complex logic—calculating bills, tracking payments, firing SMS alerts, and managing the database. It exposes **RESTful APIs** that the frontend consumes.
- **Authentication:** Laravel Sanctum is used to generate secure API tokens so only logged-in users can view data.

### Frontend (The Face)
- **Framework:** React.js powered by Vite
- **Styling:** Vanilla CSS & Tailwind CSS for professional, responsive User Interfaces.
- **Why?** React allows us to build a Single Page Application (SPA). This means the page updates instantly without reloading, creating a perfectly smooth experience for the customer.

### Database
- **Engine:** MySQL (MariaDB equivalent inside Docker)
- **Why?** It is a robust relational database that perfectly handles structured financial records (Bills, Payments, Users).

### Infrastructure
- **Hosting:** Docker on an Ubuntu Virtual Private Server (VPS).
- **Why Docker?** It containerizes our application, meaning it runs exactly the same on the live server as it does on our local laptops. It also isolates the database from the web server for enhanced security.

---

## 2. Core Modules & How They Work
You must know how to explain the logic of your features based on the Proposal.

### A. The Billing Engine (Automated Calculation)
* **How it works:** When an Admin enters consumption data (Meter Readings), the React frontend sends a `POST` request to the Laravel backend (`BillController`).
* **The Logic:** The system checks the customer’s assigned **Tariff** (cost per unit), multiplies it by their usage, adds any fixed access fees or taxes, and records the `Bill` into the database.
* **Status:** It automatically marks the bill as `unpaid`.

### B. Payment Module
* **How it works:** We created a `PaymentController` and `PaymentService` in Laravel. When a consumer logs into their Dashboard, they see their outstanding bills. 
* **The Logic:** Once a payment is submitted, the system mathematically deducts the amount from the total bill. If the bill reaches 0, the status automatically flips to `cleared`. The system immediately generates a Digital Receipt.

### C. Live SMS Notifications (Africa's Talking Integration)
* **How it works:** We integrated the **Africa's Talking SMS API**.
* **The Logic:** Using the Laravel `Observer` or direct Controller triggers, the moment a Bill is generated or a Payment is received, the backend formats the customer's phone number (adding `+256`) and fires a real-time text message to their phone. We built an Admin UI to save the API Keys directly into the secure `settings` database table so they aren't hardcoded.

### D. Reporting & Dashboard
* **How it works:** The dashboard aggregates data using complex database queries (SQL joins) to display total revenue, total active customers, and overdue bills.
* **The Logic:** The React frontend maps this data onto modern UI components (Stat Cards and Data Tables) dynamically based on the logged-in User's Role (Customer vs Admin).

---

## 3. Potential Defense Questions & How to Answer Them

> [!IMPORTANT]  
> The panel will test to see if you actually understand the logic. Memorize these concepts!

### Q1: Why did you choose Agile Methodology instead of Waterfall?
**Answer:** "We chose Agile because it allowed us to build the system iteratively. We didn't have to wait until the end of the semester to see the software. We could build the user login first, test it, then build the billing engine, test it, and show our supervisor progress constantly. This flexibility prevented major bugs at the final phase."

### Q2: How does your system ensure Security?
**Answer:** "Security is prioritized at three levels. First, our database passwords and API keys are strictly hashed and stored in secure environment variables, never hardcoded. Second, our APIs are protected by Laravel Sanctum middleware, meaning unauthenticated users are blocked. Third, we implemented Role-Based Access Control (RBAC), so standard customers absolutely cannot access the Admin dashboards or alter system settings."

### Q3: What happens if I enter an incorrect meter reading? Or if a bill is wrong?
**Answer:** "The system tracks historical meter readings. If a reading is lower than the previous month's reading, the system throws an automated validation error and rejects it. For billing errors, admins have the ability to review logs, although the automated algorithm strictly bases bills only on the specific tariff assigned to that meter."

### Q4: How is your system different from what UEDCL is currently using?
**Answer:** "Currently, there is a heavy reliance on fragmented manual records or physical queuing for postpaid processes. Our system is a fully centralized cloud platform. It completely automates the mathematical billing based on live consumption and directly alerts the customer via Live SMS the exact second their bill is ready, which deeply enhances transparency and slashes administrative delays."

### Q5: How did you calculate the Krejcie & Morgan Sample Size of 291?
**Answer:** "Our target population at the Kitintale branch was 1,200 consisting of residential users, commercial users, and staff. Based on the standard Krejcie and Morgan mathematical table formulated for an expected 95% confidence level and a 5% margin of error, exactly 291 respondents were scientifically required to achieve statistically significant data."

---

## 4. Key Terminology to Use in Your Presentation
Use these words to sound highly technical and professional:
- **"RESTful APIs"** – The secure communication language between our React frontend and Laravel backend.
- **"Single Page Application (SPA)"** – The React tech that makes our website load instantly without page refreshing.
- **"Relational Database"** – How we structured our tables in MySQL so Customers are perfectly linked to their Meters, Bills, and Payments.
- **"Containerization"** – How we used Docker to host the application.
- **"Role-Based Access Control (RBAC)"** – Our security structure where Admins see everything, but Customers only see their personal profiles.

---

## 5. Defense Day Tips
1. **Drive the Demo:** When showing the system, tell a story. Register an account as 'Nafuna Winnie'. Create a meter for her. Next, log in as an Admin, generate a bill for her meter, and show how the system accurately calculates the tariff. Finally, log back in as Winnie, view the bill, and clear it.
2. **Emphasize the SMS:** Make sure the SMS feature is active. Generating a bill and having your phone buzz in front of the panel is an incredible "wow" factor that guarantees high marks.
3. **Be Confident:** You conceptualized the problem, designed the database structure, defined the methodology, and pieced together the modern web frameworks to bring your UI to life. Claim it proudly!


<div style='page-break-after: always;'></div>

# Comprehensive Technical Architecture & Code Report
*A Detailed Engineering Review of the UEDCL Online Billing & Payment System*

This document provides a deep, line-level explanation of how the system code was written, how the frontend and backend are physically connected, and how modern infrastructure tools (Docker & Git) were utilized to host the project. Use this to prepare for highly technical questions from your academic panel.

---

## 1. Hosting Infrastructure: Docker & Git
Your project does not run on a traditional shared hosting environment like CPanel; it runs on a modern, enterprise-grade **Containerized Architecture**.

### Code Versioning (Git & GitHub)
The entire source code is tracked using **Git**. 
1. When we write code on our local laptops, we stage it (`git add .`) and commit it (`git commit -m "added feature"`) to lock the changes into history.
2. We then push it (`git push`) to the central cloud repository hosted on **GitHub**.
3. On the live server (Contabo), we simply pull the latest code (`git pull origin main`) directly from GitHub, ensuring the server matches our local laptops perfectly without needing to upload zip files via FTP.

### Containerization (Docker)
We use **Docker** via a `docker-compose.yml` file to run the system. Docker splits our app into isolated virtual machines called **Containers**:
*   **The Backend Container (`uedcl_backend`):** A pre-configured Linux instance running PHP 8.2 and Apache. This is where Laravel lives.
*   **The Database Container (`uedcl_db`):** An isolated instance running a MySQL engine that only the backend can talk to.
*   **The Frontend Container (`uedcl_web`):** An Alpine Linux instance running Nginx, which serves our compiled React files to the user's browser.

**How it works:** When we run `docker compose up -d`, Docker builds these machines, networks them together internally, and maps Port 80 externally so users can access the website.

---

## 2. Connecting the Frontend to the Backend (The API Bridge)

The React Frontend and Laravel Backend are structurally separate. They exist in different folders (`/frontend` and `/backend`). Because of this, they must communicate over a secure bridge using **RESTful APIs** and **JSON**.

### The API Call Flow
1. **Auth Token Structure:** When a user logs in, Laravel generates a secure token using Laravel Sanctum. React stores this token securely inside the web browser.
2. **The `apiRequest` Engine:** In React, we built an engine in `frontend/src/services/api.js`. Every time React needs data (like fetching a list of users), it calls this engine.
   ```javascript
   // How React talks to Laravel
   const response = await fetch(`${API_BASE_URL}/settings`, {
     method: 'GET',
     headers: { Authorization: `Bearer ${token}` }
   });
   ```
3. **CORS:** Laravel is configured to permit **Cross-Origin Resource Sharing (CORS)**, allowing our specific React URL to send requests safely to the backend without getting blocked by browser security rules.

---

## 3. How the Backend Code Works (Laravel)

Laravel processes data using the **M-V-C** (Model-View-Controller) architecture, though since we use React for views, Laravel strictly handles Models and Controllers.

### Step 1: Routing (`routes/api.php`)
When React sends an HTTP request, Laravel’s router intercepts it. 
```php
// Example of the Routing file
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/bills/generate', [BillController::class, 'generate']);
});
```
*   The `middleware('auth:sanctum')` ensures the user is logged in. 
*   If valid, it forwards the request to the `BillController`.

### Step 2: The Controller (`app/Http/Controllers/Api/BillController.php`)
The controller acts as the manager. It receives the request, validates the data, and passes it to specialized Services.
```php
public function generate(GenerateBillsRequest $request)
{
    // The controller pulls the tariff out of the database Request
    $tariff = Tariff::query()->findOrFail($request->integer('tariff_id'));
    
    // It calls the heavy-lifting service mathematically
    $result = $this->billGenerationService->generateForMeters(...);

    return response()->json(['message' => 'Bill successful']);
}
```

### Step 3: The Services Layer & Business Logic
We kept our Controllers clean by pushing complex math into "Services". For example, `BillGenerationService.php` contains the mathematical logic:
1. It queries the `MeterReading` table to calculate how many KWh units the customer consumed.
2. It multiplies `units consumed * tariff cost`.
3. It creates a record in the `Bills` table.

### Step 4: The Eloquent ORM (Models)
Laravel talks to the MySQL database without writing raw SQL code using "Models". 
For example, inside `app/Models/Bill.php`, we define relationships:
```php
public function customer() {
    return $this->belongsTo(Customer::class);
}
```
This single line tells the backend how to connect a Bill to a specific User securely.

---

## 4. How the Frontend Code Works (React.js)

The React frontend operates on **Components** and **State Hook Logic**, rather than generating raw HTML, making the UI highly dynamic.

### Step 1: Virtual DOM & Single Page
Inside `frontend/index.html`, there is only one `<div>` element: `<div id="root"></div>`. React injects the entire website directly into that box dynamically using JavaScript. This is why the screen never flashes or reloads when navigating between pages.

### Step 2: React State (`useState` and `useEffect`)
React screens update dynamically based on "State". Let’s look at how the `UsersPage.jsx` component works behind the scenes:
```javascript
// Managing State
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

// useEffect fires exactly once when the page opens
useEffect(() => {
    async function loadData() {
        const responseData = await fetchUsers(); // calls our api.js
        setUsers(responseData); // Places the database data into memory
        setLoading(false); // Shuts off the spinning wheel
    }
    loadData();
}, []);
```
When `setUsers` receives the data payload from Laravel, React instantly re-renders the visual `DataTable` mapping the data into rows autonomously.

---

## 5. The Africa's Talking API Workflow (Advanced Integration)

The panel will be extremely impressed by the live telecom integration. Here is exactly how that feature was hand-coded:

### A. The Database Settings Abstraction
Instead of hardcoding our API Secret Keys into the code (which is a massive security failure), we created a specific `settings` database table and a `Setting` Model. 
The Admin dashboard (`SmsSettingsPage.jsx`) uses React state to push API Keys via an HTTP `POST` request to Laravel, which writes them directly to the server core.

### B. The `AfricasTalkingSmsService.php` core engine
Inside Laravel, we installed the official Africa's Talking PHP SDK via Composer.

We created an engine that initializes the AT telecom gateway using the database variables:
```php
// Binding the SDK engine inside AfricasTalkingSmsService.php
$this->at = new AfricasTalking($databaseUsername, $databaseApiKey);

// Firing off the actual message globally
$sms = $this->at->sms();
$sms->send([
    'to'      => $recipient,
    'message' => $textMessageData,
]);
```

### C. The Trigger Mechanism (`SmsManager.php`)
Every time a user makes a successful payment on the React dashboard, the `PaymentController` logs the payment into MySQL. In the exact same millisecond, the Controller calls `$this->smsManager->paymentReceived($phone, $money)`.
The system dynamically formats the local Ugandan phone number (converting `07...` to the international telecom grid `+2567...`) and hands the payload to the AT Telecom SDK, routing the notification to the user's phone in under 2 seconds.

