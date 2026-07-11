import { integer, pgTable, serial, text, timestamp, boolean, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone").unique(),
  password: text("password"), // Hashed password for Admins only
  role: text("role").notNull().default("Customer"), // 'Super Admin' | 'Admin' | 'Customer'
  isBlocked: boolean("is_blocked").notNull().default(false),
  savedAddresses: text("saved_addresses"), // JSON array of strings/objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  image: text("image"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  discount: integer("discount").notNull().default(0),
  weight: text("weight"),
  ingredients: text("ingredients"), // JSON array as text
  shelfLife: text("shelf_life"),
  isVeg: boolean("is_veg").notNull().default(true),
  isBestSeller: boolean("is_bestseller").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isFestivalSpecial: boolean("is_festival_special").notNull().default(false),
  isFreshlyMadeToday: boolean("is_freshly_made_today").notNull().default(false),
  stockQuantity: integer("stock_quantity").notNull().default(100),
  images: text("images"), // JSON list of image URLs
  rating: real("rating").notNull().default(5.0),
  reviewsCount: integer("reviews_count").notNull().default(0),
  nutrition: text("nutrition"), // JSON string
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const homepageContent = pgTable("homepage_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g. "hero_banner", "featured_categories", "testimonials" etc.
  value: text("value").notNull(), // JSON text representation of sections
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // e.g. MS-XXXXXX
  userId: text("user_id").references(() => users.uid),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  deliveryMethod: text("delivery_method").notNull(), // 'delivery' | 'pickup'
  address: text("address"), // JSON string
  paymentMethod: text("payment_method").notNull(), // 'cod' | 'upi' | 'card' | 'netbanking'
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending' | 'paid' | 'refunded'
  orderStatus: text("order_status").notNull().default("pending"), // 'pending' | 'confirmed' | 'preparing' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
  couponCode: text("coupon_code"),
  subtotal: integer("subtotal").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  tax: integer("tax").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull().default(0),
  items: text("items").notNull(), // JSON list of order items
  createdAt: timestamp("created_at").defaultNow(),
});

export const cateringInquiries = pgTable("catering_inquiries", {
  id: text("id").primaryKey(), // CAT-XXXX
  userId: text("user_id").references(() => users.uid),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  date: text("date").notNull(),
  guestsCount: integer("guests_count").notNull(),
  occasion: text("occasion").notNull(),
  packageType: text("package_type").notNull(),
  selectedSweets: text("selected_sweets"), // JSON text
  selectedNamkeens: text("selected_namkeens"), // JSON text
  additionalRequirements: text("additional_requirements"),
  estimatedPrice: integer("estimated_price").notNull().default(0),
  status: text("status").notNull().default("pending"), // 'pending' | 'contacted' | 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.uid),
  productName: text("product_name").notNull(),
  customerName: text("customer_name").notNull(),
  location: text("location"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  image: text("image"), // optional image url
  approved: boolean("approved").notNull().default(false),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percentage"), // 'percentage' | 'flat'
  value: integer("value").notNull(),
  expiryDate: text("expiry_date").notNull(), // YYYY-MM-DD
  usageLimit: integer("usage_limit").notNull().default(100),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.uid).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
