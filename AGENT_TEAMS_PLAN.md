# Grocery Order Tracker - Agent Teams Development Plan

## Project Overview
A grocery order tracking application with Node.js backend and React.js frontend.
Features: Menu creation (CRUD) and Order taking (random customer names, mobile, items, quantity).

---

## Agent Teams Structure

### Team 1: Backend Team (2 members)
| Member | Role | Responsibility |
|--------|------|----------------|
| Backend Coder | Developer | Writes Node.js/Express API code |
| Backend Reviewer | Node.js Specialist | Reviews code for best practices, security, performance |

### Team 2: Frontend Team (2 members)
| Member | Role | Responsibility |
|--------|------|----------------|
| Frontend Coder | Developer | Writes React.js UI components |
| Frontend Reviewer | React.js Specialist | Reviews component patterns, hooks usage, accessibility |

### Team 3: QA & DevOps Team (2 members)
| Member | Role | Responsibility |
|--------|------|----------------|
| Test Engineer | QA | Creates test cases for backend API and frontend components |
| DevOps Engineer | Packaging | Sets up scripts, builds, and runs the full app locally |

---

## Phase 1: Backend Development (Team 1)

### Backend Coder Tasks:
1. Create project structure:
   ```
   backend/
     server.js
     routes/menuRoutes.js
     routes/orderRoutes.js
     data/store.js
   ```

2. **data/store.js** - In-memory data store:
   - menuItems array with seed data (8 grocery items)
   - orders array (empty initially)
   - Seed items: Tomato (Vegetables, ₹40), Onion (Vegetables, ₹30), Potato (Vegetables, ₹25), Apple (Fruits, ₹150), Banana (Fruits, ₹50), Milk (Dairy, ₹60), Curd (Dairy, ₹45), Rice (Grains, ₹80)

3. **routes/menuRoutes.js** - Menu CRUD:
   - GET /api/menu - List all menu items
   - POST /api/menu - Create item (fields: name, category, price, description, available)
   - PUT /api/menu/:id - Update item
   - DELETE /api/menu/:id - Delete item

4. **routes/orderRoutes.js** - Order management:
   - GET /api/orders - List all orders (newest first)
   - POST /api/orders - Create order (customerName, customerMobile, items[], totalAmount, status, orderDate)
   - GET /api/orders/:id - Get single order
   - PUT /api/orders/:id/status - Update status (pending/preparing/ready/delivered)

5. **server.js** - Express server:
   - Port 5000
   - CORS for localhost:3000
   - JSON body parser
   - Health check: GET /api/health
   - Mount all routes

### Backend Reviewer Tasks:
- Review all backend files for:
  - Input validation on all endpoints
  - Proper HTTP status codes (200, 201, 400, 404, 500)
  - Error handling with try-catch
  - Security (no injection risks, proper CORS)
  - Code organization and modularity
  - Edge cases (empty arrays, missing fields, invalid IDs)

---

## Phase 2: Frontend Development (Team 2)

### Frontend Coder Tasks:
1. Install react-router-dom
2. Create component structure:
   ```
   frontend/src/
     App.js (Router + Navbar)
     App.css (All styles)
     components/
       MenuPage.js
       OrderForm.js
       OrderList.js
       OrderDetail.js
   ```

3. **App.js** - Main app with navigation:
   - Navbar: "Grocery Order Tracker" title
   - Links: Menu | Place Order | Orders
   - React Router routes for all pages

4. **MenuPage.js** - Menu management:
   - Table/card display of all menu items
   - Add new item form (name, category dropdown, price, description)
   - Categories: Vegetables, Fruits, Dairy, Grains, Beverages, Snacks
   - Edit button (inline or modal)
   - Delete button with confirmation
   - Loading and error states

5. **OrderForm.js** - Place order page:
   - "Generate Random Customer" button
   - Random name from list: Rahul Sharma, Priya Patel, Amit Kumar, Sneha Gupta, Vikram Singh, Anita Desai, Rajesh Verma, Kavita Nair, Suresh Reddy, Meena Iyer, Arjun Malhotra, Deepa Joshi, Karan Mehta, Pooja Rao, Nitin Agarwal, Lakshmi Menon, Sanjay Bhat, Divya Pillai, Manoj Tiwari, Ritu Saxena
   - Random 10-digit mobile (starts with 9/8/7/6)
   - Menu items list with quantity inputs
   - Running total calculation
   - Submit order button

6. **OrderList.js** - Orders table:
   - Columns: Order ID, Customer, Mobile, Total, Status, Date
   - Color-coded status badges (pending=yellow, preparing=blue, ready=green, delivered=gray)
   - Status update dropdown
   - Click to view details

7. **OrderDetail.js** - Single order view:
   - Customer info
   - Items table with quantities and prices
   - Order total
   - Status with update option

8. **App.css** - Clean, functional styling:
   - Responsive layout
   - Table styles
   - Form styles
   - Status badge colors
   - Navbar styling

### Frontend Reviewer Tasks:
- Review all frontend files for:
  - Proper React patterns (functional components, hooks)
  - State management (no unnecessary re-renders)
  - Error handling (loading states, API failures)
  - Accessibility basics (labels, semantic HTML)
  - Consistent styling approach
  - API integration correctness
  - Component reusability where appropriate

---

## Phase 3: Testing (QA & DevOps Team)

### Test Engineer Tasks:
1. **Backend tests** (using Jest + supertest):
   - Install: npm install --save-dev jest supertest
   - Test file: backend/__tests__/api.test.js
   - Test cases:
     - GET /api/health returns 200
     - GET /api/menu returns seed data
     - POST /api/menu creates item (valid + invalid inputs)
     - PUT /api/menu/:id updates item (valid + not found)
     - DELETE /api/menu/:id deletes item (valid + not found)
     - POST /api/orders creates order (valid + invalid)
     - GET /api/orders returns orders
     - PUT /api/orders/:id/status updates status (valid + invalid status)

2. **Frontend tests** (using React Testing Library):
   - Test file: frontend/src/__tests__/App.test.js
   - Test cases:
     - App renders navbar with all links
     - MenuPage loads and displays menu items
     - OrderForm generates random customer
     - OrderForm calculates total correctly
     - OrderList renders orders table

---

## Phase 4: Packaging & Running (QA & DevOps Team)

### DevOps Engineer Tasks:
1. Update backend package.json:
   - "start": "node server.js"
   - "test": "jest --verbose"

2. Create root-level package.json with convenience scripts:
   ```json
   {
     "name": "grocery-order-tracker",
     "scripts": {
       "start:backend": "cd backend && npm start",
       "start:frontend": "cd frontend && npm start",
       "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
       "install:all": "cd backend && npm install && cd ../frontend && npm install",
       "test:backend": "cd backend && npm test",
       "test:frontend": "cd frontend && npm test"
     }
   }
   ```

3. Install concurrently: npm install concurrently
4. Run both servers and verify:
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:3000
   - Test API endpoints with curl
   - Verify frontend connects to backend

---

## Prompt to Use After Restart

Copy-paste this into Claude Code after restarting:

```
I need to build a Grocery Order Tracking app. The project is already scaffolded
at c:\Users\chaks\grocery with backend/ (Node.js, express+cors+uuid installed)
and frontend/ (create-react-app).

Read the plan at c:\Users\chaks\grocery\AGENT_TEAMS_PLAN.md

Create these agent teams with 2 members each:

1. Backend Team: A backend coder who writes the Node.js/Express API code, and a
   backend reviewer who is a Node.js specialist reviewing for best practices,
   security, and proper error handling.

2. Frontend Team: A frontend coder who writes React.js components, and a frontend
   reviewer who is a React.js specialist reviewing for proper patterns, hooks
   usage, and accessibility.

3. QA & DevOps Team: A test engineer who creates Jest test cases for both backend
   and frontend, and a DevOps engineer who packages everything and gets it running
   locally.

Follow the phased approach in the plan:
- Phase 1: Backend Team builds the API
- Phase 2: Frontend Team builds the UI (can start in parallel with Phase 1)
- Phase 3: QA writes tests after code is reviewed
- Phase 4: DevOps packages and runs everything

Each team's reviewer should review the coder's work and suggest fixes before
moving to the next phase.
```

---

## Tech Stack Summary
| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Frontend | React.js (create-react-app) |
| Data Storage | In-memory (arrays) |
| Testing | Jest + Supertest + React Testing Library |
| Package Runner | concurrently |
| Port (Backend) | 5000 |
| Port (Frontend) | 3000 |
