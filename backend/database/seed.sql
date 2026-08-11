-- Mini ERP + CRM Operations Portal Seed Data
USE `mini_erp_crm`;

-- Standard password for demo accounts is 'password123'
-- Bcrypt hash below corresponds to 'password123'
-- $2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `name`, `role`) VALUES
(1, 'admin', 'admin@fundsroom-erp.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'System Administrator', 'ADMIN'),
(2, 'sales_user', 'sales@fundsroom-erp.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Rajesh Sharma (Sales Exec)', 'SALES'),
(3, 'warehouse_user', 'warehouse@fundsroom-erp.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Suresh Kumar (Inventory Mgr)', 'WAREHOUSE'),
(4, 'accounts_user', 'accounts@fundsroom-erp.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Priya Patel (Accounts Head)', 'ACCOUNTS')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Seed Customers
INSERT INTO `customers` (`id`, `name`, `mobile`, `email`, `business_name`, `gst_number`, `customer_type`, `address`, `status`, `follow_up_date`, `notes`, `created_by`) VALUES
(1, 'Amit Verma', '+91 9876543210', 'amit@apexdistributors.com', 'Apex Distributors Pvt Ltd', '27AAACA12341Z5', 'Distributor', '45 Industrial Estate, Andheri East, Mumbai', 'Active', '2026-08-20', 'Key wholesale partner for Western Zone.', 2),
(2, 'Sneha Reddi', '+91 9123456789', 'sneha@metrotraders.in', 'Metro Retail Traders', '27AABCM98761Z1', 'Wholesale', '12 Station Road, Dadar, Mumbai', 'Lead', '2026-08-15', 'Requested updated pricing catalog for bulk orders.', 2),
(3, 'Vikram Malhotra', '+91 9988776655', 'vikram@malhotrastores.com', 'Malhotra Departmental Store', '27AACCS55441Z2', 'Retail', '88 Main Market, Bandra West, Mumbai', 'Active', '2026-08-25', 'Prefers bi-weekly delivery schedules.', 2)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed Customer Followups
INSERT INTO `customer_followups` (`id`, `customer_id`, `note`, `follow_up_date`, `created_by`, `created_at`) VALUES
(1, 1, 'Initial onboarding completed. Account activated.', '2026-08-20', 2, '2026-08-01 10:00:00'),
(2, 2, 'Sent product brochure via email. Scheduled follow-up call.', '2026-08-15', 2, '2026-08-05 14:30:00')
ON DUPLICATE KEY UPDATE `note`=`note`;

-- Seed Products
INSERT INTO `products` (`id`, `name`, `sku`, `category`, `unit_price`, `current_stock`, `min_stock_alert`, `location`, `status`) VALUES
(1, 'Wireless Ergonomic Mouse X100', 'PROD-MSE-001', 'Electronics & Peripherals', 850.00, 45, 10, 'Main Warehouse - Bay A1', 'ACTIVE'),
(2, 'Mechanical RGB Keyboard K500', 'PROD-KBD-002', 'Electronics & Peripherals', 2499.00, 4, 10, 'Main Warehouse - Bay A2', 'ACTIVE'),
(3, '27-inch IPS UltraHD Monitor', 'PROD-MON-003', 'Displays', 18500.00, 18, 5, 'Main Warehouse - Bay B1', 'ACTIVE'),
(4, 'USB-C Heavy Duty Braided Cable 2m', 'PROD-CBL-004', 'Accessories', 299.00, 120, 25, 'Secondary Store - Rack C', 'ACTIVE'),
(5, 'Noise Cancelling Headset H70', 'PROD-AUD-005', 'Audio & Communication', 3450.00, 2, 8, 'Main Warehouse - Bay A3', 'ACTIVE')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed Initial Stock Movements
INSERT INTO `stock_movements` (`id`, `product_id`, `quantity_changed`, `movement_type`, `reason`, `created_by`, `timestamp`) VALUES
(1, 1, 50, 'IN', 'Initial Stock Import', 3, '2026-08-01 09:00:00'),
(2, 2, 20, 'IN', 'Initial Stock Import', 3, '2026-08-01 09:15:00'),
(3, 3, 20, 'IN', 'Initial Stock Import', 3, '2026-08-01 09:30:00'),
(4, 4, 150, 'IN', 'Initial Stock Import', 3, '2026-08-01 09:45:00'),
(5, 5, 10, 'IN', 'Initial Stock Import', 3, '2026-08-01 10:00:00'),
(6, 1, 5, 'OUT', 'Sales Order #CHAL-2026-0001', 2, '2026-08-02 11:30:00'),
(7, 2, 16, 'OUT', 'Sales Order #CHAL-2026-0001', 2, '2026-08-02 11:30:00'),
(8, 5, 8, 'OUT', 'Damaged goods return to vendor', 3, '2026-08-06 16:00:00')
ON DUPLICATE KEY UPDATE `reason`=`reason`;

-- Seed Sample Challans
INSERT INTO `challans` (`id`, `challan_number`, `customer_id`, `total_quantity`, `total_amount`, `status`, `created_by`, `created_at`) VALUES
(1, 'CHAL-2026-0001', 1, 21, 44234.00, 'CONFIRMED', 2, '2026-08-02 11:30:00'),
(2, 'CHAL-2026-0002', 2, 2, 37000.00, 'DRAFT', 2, '2026-08-08 15:20:00')
ON DUPLICATE KEY UPDATE `challan_number`=`challan_number`;

-- Seed Challan Items (Snapshots)
INSERT INTO `challan_items` (`id`, `challan_id`, `product_id`, `product_name`, `sku`, `unit_price`, `quantity`) VALUES
(1, 1, 1, 'Wireless Ergonomic Mouse X100', 'PROD-MSE-001', 850.00, 5),
(2, 1, 2, 'Mechanical RGB Keyboard K500', 'PROD-KBD-002', 2499.00, 16),
(3, 2, 3, '27-inch IPS UltraHD Monitor', 'PROD-MON-003', 18500.00, 2)
ON DUPLICATE KEY UPDATE `product_name`=`product_name`;
