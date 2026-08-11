export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidMobile = (mobile: string): boolean => {
  const mobileRegex = /^[\+\d\s\-]{8,20}$/;
  return mobileRegex.test(mobile);
};

export const validateCustomerInput = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Customer Name is required');
  }

  if (!data.mobile || !isValidMobile(data.mobile)) {
    errors.push('Valid Mobile Number is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid Email address is required');
  }

  if (!data.business_name || typeof data.business_name !== 'string' || !data.business_name.trim()) {
    errors.push('Business Name is required');
  }

  const validTypes = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
  if (data.customer_type) {
    const formattedType = String(data.customer_type).trim().toUpperCase();
    if (!validTypes.includes(formattedType)) {
      errors.push('Customer Type must be Retail, Wholesale, or Distributor');
    }
  }

  const validStatuses = ['LEAD', 'ACTIVE', 'INACTIVE'];
  if (data.status) {
    const formattedStatus = String(data.status).trim().toUpperCase();
    if (!validStatuses.includes(formattedStatus)) {
      errors.push('Customer Status must be Lead, Active, or Inactive');
    }
  }

  return errors;
};

export const validateProductInput = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Product Name is required');
  }

  if (!data.sku || typeof data.sku !== 'string' || !data.sku.trim()) {
    errors.push('Product SKU / Code is required');
  }

  if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
    errors.push('Category is required');
  }

  if (data.unit_price === undefined || isNaN(Number(data.unit_price)) || Number(data.unit_price) < 0) {
    errors.push('Unit Price must be a non-negative number');
  }

  if (data.current_stock !== undefined) {
    const stockNum = Number(data.current_stock);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.push('Current Stock must be a non-negative integer');
    }
  }

  if (data.min_stock_alert !== undefined) {
    const minNum = Number(data.min_stock_alert);
    if (isNaN(minNum) || minNum < 0 || !Number.isInteger(minNum)) {
      errors.push('Minimum Stock Alert Quantity must be a non-negative integer');
    }
  }

  return errors;
};

export const validateStockMovementInput = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.product_id || isNaN(Number(data.product_id))) {
    errors.push('Valid Product ID is required');
  }

  const qty = Number(data.quantity_changed);
  if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
    errors.push('Quantity Changed must be a strict positive integer greater than 0');
  }

  if (!data.movement_type || !['IN', 'OUT'].includes(String(data.movement_type).toUpperCase())) {
    errors.push('Movement Type must be either IN or OUT');
  }

  if (!data.reason || typeof data.reason !== 'string' || !data.reason.trim()) {
    errors.push('Reason for stock movement is required');
  }

  return errors;
};

export const validateChallanInput = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.customer_id || isNaN(Number(data.customer_id))) {
    errors.push('Valid Customer ID is required');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Challan must contain at least one product item');
  } else {
    data.items.forEach((item: any, idx: number) => {
      if (!item.product_id || isNaN(Number(item.product_id))) {
        errors.push(`Item ${idx + 1}: Valid Product ID is required`);
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        errors.push(`Item ${idx + 1}: Quantity must be a strict positive integer greater than 0`);
      }
    });
  }

  return errors;
};
