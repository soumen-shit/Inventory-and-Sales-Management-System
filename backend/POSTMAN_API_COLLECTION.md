# 📋 Complete API Documentation for Postman Testing

**Base URL:** `http://localhost:3000/api`

> **Note:** All protected endpoints require JWT authentication via cookie (`access_token`). Set cookies in Postman: Request → Cookies → Add cookie with name `access_token` and value from signin response.

---

## 🔐 1. AUTHENTICATION APIs

### 1.1 Signup Admin (First Time Only)
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

---

### 1.2 Signin
```http
POST http://localhost:3000/api/auth/signin
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login Success"
}
```
> **Note:** Cookie `access_token` is automatically set. In Postman, enable cookie handling.

---

### 1.3 Get Current User Profile
```http
GET http://localhost:3000/api/auth/me
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Response:**
```json
{
  "userId": "uuid",
  "role": "ADMIN",
  "email": "admin@example.com"
}
```

---

### 1.4 Change Password
```http
PATCH http://localhost:3000/api/auth/change-password
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Request Body:**
```json
{
  "old_password": "admin123",
  "new_password": "newpassword123"
}
```

---

### 1.5 Logout
```http
POST http://localhost:3000/api/auth/logout
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 👥 2. USER MANAGEMENT APIs

### 2.1 Create User (Staff/Manager)
```http
POST http://localhost:3000/api/users
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN only)

**Request Body:**
```json
{
  "name": "John Manager",
  "email": "manager@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "MANAGER",
  "is_active": true
}
```

**Demo Data Variations:**
```json
// Create STAFF
{
  "name": "Jane Staff",
  "email": "staff@example.com",
  "password": "password123",
  "phone": "9876543211",
  "role": "STAFF",
  "is_active": true
}
```

---

### 2.2 Get All Users
```http
GET http://localhost:3000/api/users
```
**Auth Required:** ✅ (ADMIN only)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "1234567890",
    "role": "ADMIN",
    "is_active": true
  }
]
```

---

### 2.3 Get Roles Dropdown
```http
GET http://localhost:3000/api/users/roles
```
**Auth Required:** ✅ (ADMIN only)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "ADMIN"
  },
  {
    "id": "uuid",
    "name": "MANAGER"
  },
  {
    "id": "uuid",
    "name": "STAFF"
  }
]
```

---

### 2.4 Get User by ID
```http
GET http://localhost:3000/api/users/{userId}
```
**Auth Required:** ✅ (ADMIN only)

**Example:**
```
GET http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000
```

---

### 2.5 Update User
```http
PATCH http://localhost:3000/api/users/{userId}
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN only)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "9999999999",
  "role": "MANAGER",
  "is_active": true
}
```

---

## 📁 3. PRODUCT CATEGORIES APIs

### 3.1 Create Category
```http
POST http://localhost:3000/api/product-categories
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body (Parent Category):**
```json
{
  "name": "Electronics",
  "description": "Electronic products and devices",
  "is_active": true
}
```

**Request Body (Sub Category):**
```json
{
  "name": "Laptops",
  "description": "Laptop computers",
  "parent_id": "category-uuid-here",
  "is_active": true
}
```

**Demo Data:**
```json
// Category 1
{
  "name": "Electronics",
  "description": "Electronic products and devices"
}

// Category 2
{
  "name": "Clothing",
  "description": "Apparel and fashion items"
}

// Category 3
{
  "name": "Food & Beverages",
  "description": "Food items and drinks"
}
```

---

### 3.2 Get All Categories
```http
GET http://localhost:3000/api/product-categories
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

---

### 3.3 Get Category by ID
```http
GET http://localhost:3000/api/product-categories/{categoryId}
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

---

### 3.4 Update Category
```http
PATCH http://localhost:3000/api/product-categories/{categoryId}
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "parent_id": "new-parent-uuid-here"
}
```

---

### 3.5 Disable Category
```http
PATCH http://localhost:3000/api/product-categories/{categoryId}/status
```
**Auth Required:** ✅ (ADMIN only)

---

## 📦 4. PRODUCTS APIs

### 4.1 Create Product
```http
POST http://localhost:3000/api/products
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "name": "Dell XPS 13 Laptop",
  "sku": "PROD-DELL-XPS13",
  "category_id": "category-uuid-here",
  "reorder_level": 10,
  "is_active": true
}
```

**Demo Data:**
```json
// Product 1
{
  "name": "MacBook Pro 14",
  "sku": "PROD-MBP-14",
  "category_id": "electronics-category-uuid",
  "reorder_level": 5,
  "is_active": true
}

// Product 2
{
  "name": "Cotton T-Shirt",
  "sku": "PROD-TSHIRT-001",
  "category_id": "clothing-category-uuid",
  "reorder_level": 50,
  "is_active": true
}

// Product 3
{
  "name": "Wireless Mouse",
  "sku": "PROD-MOUSE-001",
  "category_id": "electronics-category-uuid",
  "reorder_level": 20,
  "is_active": true
}
```

---

### 4.2 Get All Products (with pagination)
```http
GET http://localhost:3000/api/products?page=1&limit=10&search=laptop
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Example:**
```
GET http://localhost:3000/api/products?page=1&limit=10
GET http://localhost:3000/api/products?search=laptop
```

---

### 4.3 Get Product by ID
```http
GET http://localhost:3000/api/products/{productId}
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

---

### 4.4 Update Product
```http
PATCH http://localhost:3000/api/products/{productId}
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "reorder_level": 15,
  "description": "Updated description"
}
```

---

### 4.5 Activate/Deactivate Product
```http
PATCH http://localhost:3000/api/products/{productId}/status
```
**Auth Required:** ✅ (ADMIN only)

---

## 🎨 5. PRODUCT VARIANTS APIs

### 5.1 Create Product Variant
```http
POST http://localhost:3000/api/product-variants
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "variant_name": "MacBook Pro 14 - Space Gray - 512GB",
  "sku": "VARIANT-MBP14-SG-512",
  "price": 1999.99,
  "product_id": "product-uuid-here",
  "is_active": true
}
```

**Demo Data:**
```json
// Variant 1
{
  "variant_name": "Dell XPS 13 - Silver - 256GB",
  "sku": "VARIANT-XPS13-SIL-256",
  "price": 1299.99,
  "product_id": "dell-xps-product-uuid",
  "is_active": true
}

// Variant 2 (Size variant)
{
  "variant_name": "Cotton T-Shirt - Medium - Blue",
  "sku": "VARIANT-TS-M-BLUE",
  "price": 29.99,
  "product_id": "tshirt-product-uuid",
  "is_active": true
}

// Variant 3 (Color variant)
{
  "variant_name": "Cotton T-Shirt - Large - Red",
  "sku": "VARIANT-TS-L-RED",
  "price": 29.99,
  "product_id": "tshirt-product-uuid",
  "is_active": true
}
```

---

### 5.2 Get All Variants
```http
GET http://localhost:3000/api/product-variants?page=1&limit=10&search=mouse
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

---

### 5.3 Get Product with Variants
```http
GET http://localhost:3000/api/product-variants/{productId}/variants
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Example:**
```
GET http://localhost:3000/api/product-variants/123e4567-e89b-12d3-a456-426614174000/variants
```

---

### 5.4 Update Variant
```http
PATCH http://localhost:3000/api/product-variants/{variantId}
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "variant_name": "Updated Variant Name",
  "price": 1499.99,
  "is_active": true
}
```

---

### 5.5 Disable Variant
```http
PATCH http://localhost:3000/api/product-variants/{variantId}/status
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN only)

**Request Body:**
```json
{
  "is_active": false
}
```

---

## 📊 6. INVENTORY APIs

### 6.1 Get All Inventory
```http
GET http://localhost:3000/api/inventory
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Response:**
```json
[
  {
    "id": "uuid",
    "quantity": 50,
    "variant": {
      "id": "uuid",
      "variant_name": "MacBook Pro 14 - Space Gray",
      "sku": "VARIANT-MBP14-SG-512"
    }
  }
]
```

---

### 6.2 Get Low Stock Items
```http
GET http://localhost:3000/api/inventory/low-stock
```
**Auth Required:** ✅ (ADMIN/MANAGER)

---

### 6.3 Get Inventory by Variant ID
```http
GET http://localhost:3000/api/inventory/{variantId}/variant
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

**Example:**
```
GET http://localhost:3000/api/inventory/123e4567-e89b-12d3-a456-426614174000/variant
```

---

## 🏢 7. SUPPLIERS APIs

### 7.1 Create Supplier
```http
POST http://localhost:3000/api/suppliers
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "name": "Tech Suppliers Ltd",
  "email": "contact@techsuppliers.com",
  "phone": "1234567890",
  "address": "123 Business Street, City, State, ZIP",
  "gst_number": "GST123456789",
  "is_active": true
}
```

**Demo Data:**
```json
// Supplier 1
{
  "name": "Global Electronics Inc",
  "email": "info@globalelectronics.com",
  "phone": "9876543210",
  "address": "456 Tech Avenue, New York, NY 10001",
  "gst_number": "GST987654321",
  "is_active": true
}

// Supplier 2
{
  "name": "Fashion Wholesale Co",
  "email": "sales@fashionwholesale.com",
  "phone": "5551234567",
  "address": "789 Fashion Blvd, Los Angeles, CA 90001",
  "gst_number": "GST555123456",
  "is_active": true
}

// Supplier 3
{
  "name": "Food Distributors LLC",
  "email": "contact@fooddist.com",
  "phone": "4449876543",
  "address": "321 Food Street, Chicago, IL 60601",
  "gst_number": "GST444987654",
  "is_active": true
}
```

---

### 7.2 Get All Suppliers
```http
GET http://localhost:3000/api/suppliers
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

---

### 7.3 Get Supplier by ID
```http
GET http://localhost:3000/api/suppliers/{supplierId}
```
**Auth Required:** ✅ (ADMIN/MANAGER/STAFF)

---

### 7.4 Update Supplier
```http
PATCH http://localhost:3000/api/suppliers/{supplierId}
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "name": "Updated Supplier Name",
  "email": "updated@supplier.com",
  "phone": "9999999999",
  "address": "Updated Address",
  "gst_number": "GST999999999"
}
```

---

### 7.5 Activate/Deactivate Supplier
```http
PATCH http://localhost:3000/api/suppliers/{supplierId}/status
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN only)

**Request Body:**
```json
{
  "is_active": false
}
```

---

## 🛒 8. PURCHASE ORDERS APIs

### 8.1 Create Purchase Order
```http
POST http://localhost:3000/api/purchase-orders
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "supplier_id": "supplier-uuid-here"
}
```

**Demo Data:**
```json
{
  "supplier_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**
```json
{
  "id": "po-uuid",
  "status": "PENDING",
  "total_amount": "0.00",
  "order_date": "2024-01-15T10:30:00.000Z",
  "supplier": {
    "id": "supplier-uuid",
    "name": "Tech Suppliers Ltd"
  }
}
```

---

### 8.2 Add Items to Purchase Order
```http
POST http://localhost:3000/api/purchase-orders/{purchaseOrderId}/items
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "product_variant_id": "variant-uuid-here",
  "quantity": 50,
  "unit_price": 1299.99
}
```

**Demo Data:**
```json
// Item 1
{
  "product_variant_id": "variant-uuid-1",
  "quantity": 10,
  "unit_price": 1999.99
}

// Item 2
{
  "product_variant_id": "variant-uuid-2",
  "quantity": 25,
  "unit_price": 29.99
}

// Item 3
{
  "product_variant_id": "variant-uuid-3",
  "quantity": 100,
  "unit_price": 15.50
}
```

---

### 8.3 Get All Purchase Orders
```http
GET http://localhost:3000/api/purchase-orders?page=1&limit=10&status=PENDING&supplier_id={supplierId}
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (PENDING, RECEIVED, CANCELLED)
- `supplier_id` (optional): Filter by supplier

**Examples:**
```
GET http://localhost:3000/api/purchase-orders
GET http://localhost:3000/api/purchase-orders?status=PENDING
GET http://localhost:3000/api/purchase-orders?supplier_id=uuid-here
GET http://localhost:3000/api/purchase-orders?page=1&limit=20&status=RECEIVED
```

---

### 8.4 Get Purchase Order by ID
```http
GET http://localhost:3000/api/purchase-orders/{purchaseOrderId}
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Example:**
```
GET http://localhost:3000/api/purchase-orders/123e4567-e89b-12d3-a456-426614174000
```

---

### 8.5 Update Purchase Order Status
```http
PATCH http://localhost:3000/api/purchase-orders/{purchaseOrderId}/status
Content-Type: application/json
```
**Auth Required:** ✅ (ADMIN/MANAGER)

**Request Body:**
```json
{
  "status": "RECEIVED"
}
```

**Status Options:**
- `PENDING` - Order is pending
- `RECEIVED` - Order received (triggers batch creation, inventory update)
- `CANCELLED` - Order cancelled

**Demo Data:**
```json
// Mark as Received (creates batches and updates inventory)
{
  "status": "RECEIVED"
}

// Cancel Order
{
  "status": "CANCELLED"
}
```

> **Important:** When status changes to `RECEIVED`, the system automatically:
> - Creates batches for each item
> - Creates inventory movements (IN)
> - Updates inventory quantities

---

## 📋 Complete Testing Flow Example

### Step-by-Step Test Flow:

1. **Signup Admin** (First Time Only)
   ```
   POST /api/auth/signup
   ```

2. **Signin** (Get Auth Cookie)
   ```
   POST /api/auth/signin
   ```
   > Copy the `access_token` cookie value

3. **Create Category**
   ```
   POST /api/product-categories
   ```
   > Save the category UUID

4. **Create Product**
   ```
   POST /api/products
   ```
   > Save the product UUID

5. **Create Product Variant**
   ```
   POST /api/product-variants
   ```
   > Save the variant UUID

6. **Create Supplier**
   ```
   POST /api/suppliers
   ```
   > Save the supplier UUID

7. **Create Purchase Order**
   ```
   POST /api/purchase-orders
   ```
   > Save the purchase order UUID

8. **Add Items to Purchase Order**
   ```
   POST /api/purchase-orders/{poId}/items
   ```

9. **Update Purchase Order Status to RECEIVED**
   ```
   PATCH /api/purchase-orders/{poId}/status
   ```
   > This will create batches and update inventory

10. **Check Inventory**
    ```
    GET /api/inventory
    ```

---

## 🔑 Authentication Setup in Postman

### Method 1: Using Cookies
1. After signing in, go to **Cookies** in Postman
2. Click **Add Cookie**
3. Domain: `localhost`
4. Name: `access_token`
5. Value: (paste JWT token from response)
6. Path: `/`
7. Save

### Method 2: Using Environment Variables
1. Create Postman Environment
2. Add variable `base_url` = `http://localhost:3000/api`
3. Add variable `access_token` = (will be set after signin)
4. Use `{{base_url}}` in requests

### Method 3: Manual Cookie Header (Not Recommended)
```
Cookie: access_token=your-jwt-token-here
```

---

## ✅ Response Status Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 📝 Notes

1. **UUIDs**: Replace `{uuid}` placeholders with actual UUIDs from previous responses
2. **Authentication**: All endpoints except `/auth/signup` and `/auth/signin` require authentication
3. **Roles**: Check role requirements for each endpoint
4. **Pagination**: Default page=1, limit=10 for list endpoints
5. **Date Formats**: Use ISO 8601 format for dates
6. **Decimal Values**: Use proper decimal format for prices (e.g., 1999.99)

---

## 🚀 Quick Start Testing

1. Start your server: `npm run start:dev`
2. Import this document or use the URLs above
3. Test in order:
   - Auth (Signup → Signin)
   - Categories
   - Products
   - Variants
   - Suppliers
   - Purchase Orders
   - Inventory

---

**Happy Testing! 🎉**
