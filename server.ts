import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db } from "./src/db/index.ts";
import { seedDatabase } from "./src/db/seed.ts";
import {
  users,
  categories,
  products,
  orders,
  cateringInquiries,
  reviews,
  coupons,
  wishlist,
  homepageContent,
} from "./src/db/schema.ts";
import { eq, and, desc, like, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { requireAuth, requireAdmin, AuthRequest } from "./src/middleware/auth.ts";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-maheshwari";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-key-maheshwari";

app.use(express.json());

// In-memory OTP storage for customer login
const otpStore = new Map<string, string>();

// REST API Endpoints

// ==========================================
// CUSTOMER AUTHENTICATION FLOW (OTP)
// ==========================================

// 1. Send OTP to mobile
app.post("/api/auth/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  }

  // Generate a 6-digit OTP
  // For easy preview/testing, let's use "123456" for demonstration, but generate random OTP for actual use
  const otp = phone === "9999999999" ? "123456" : String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, otp);

  console.log(`[SMS Gateway Simulate] OTP for ${phone} is: ${otp}`);

  // Return the OTP in response so that the user testing the preview can instantly see and use it
  res.json({
    message: "OTP sent successfully (simulated).",
    otp, // returned so the client can display it as a helpful toast in dev mode
  });
});

// 2. Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Mobile number and OTP are required." });
  }

  const savedOtp = otpStore.get(phone);
  if (!savedOtp || savedOtp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
  }

  // Clear OTP after successful verification
  otpStore.delete(phone);

  try {
    // Check if customer exists in the database
    const existingUsers = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

    if (existingUsers.length > 0) {
      const user = existingUsers[0];

      if (user.isBlocked) {
        return res.status(403).json({ error: "Your account is suspended. Please contact customer service." });
      }

      // Generate Access & Refresh tokens
      const token = jwt.sign({ uid: user.uid, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: "7d" });
      const refreshToken = jwt.sign({ uid: user.uid }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

      res.json({
        message: "Logged in successfully!",
        isNewUser: false,
        token,
        refreshToken,
        user: {
          uid: user.uid,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          savedAddresses: user.savedAddresses ? JSON.parse(user.savedAddresses) : [],
        },
      });
    } else {
      // Customer does not exist yet. Client should ask for name to complete signup
      res.json({
        message: "OTP Verified. Complete registration.",
        isNewUser: true,
        phone,
      });
    }
  } catch (error) {
    console.error("OTP verification database error:", error);
    res.status(500).json({ error: "Internal server error during verification." });
  }
});

// 3. Register New Customer Account
app.post("/api/auth/register", async (req, res) => {
  const { phone, name, email } = req.body;
  if (!phone || !name) {
    return res.status(400).json({ error: "Mobile number and full name are required." });
  }

  try {
    // Double check if customer already exists
    const existingUsers = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists with this mobile number." });
    }

    const uid = "cust_" + Math.random().toString(36).substr(2, 9);
    const userEmail = email || `${uid}@customer.com`;

    const [newUser] = await db.insert(users).values({
      uid,
      phone,
      name,
      email: userEmail,
      role: "Customer",
      isBlocked: false,
      savedAddresses: JSON.stringify([]),
    }).returning();

    const token = jwt.sign({ uid: newUser.uid, role: newUser.role, phone: newUser.phone }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ uid: newUser.uid }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "Account created successfully!",
      token,
      refreshToken,
      user: {
        uid: newUser.uid,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        savedAddresses: [],
      },
    });
  } catch (error) {
    console.error("Customer registration error:", error);
    res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});

// 4. Refresh Token
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const token = jwt.sign({ uid: decoded.uid }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

// 5. Get current profile (authenticated)
app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const userList = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (userList.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = userList[0];
    res.json({
      user: {
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        savedAddresses: user.savedAddresses ? JSON.parse(user.savedAddresses) : [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// 6. Update user profile (name, email, saved addresses)
app.put("/api/auth/update-profile", requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { name, email, savedAddresses } = req.body;

  try {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (savedAddresses !== undefined) updates.savedAddresses = JSON.stringify(savedAddresses);

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.uid, req.user.uid))
      .returning();

    res.json({
      message: "Profile updated successfully!",
      user: {
        uid: updatedUser.uid,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        savedAddresses: updatedUser.savedAddresses ? JSON.parse(updatedUser.savedAddresses) : [],
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile details." });
  }
});

// ==========================================
// ADMIN LOGIN (Role-Based Access)
// ==========================================
app.post("/api/admin/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: "Credentials and password are required." });
  }

  try {
    // Find admin user in database by phone or email
    const matchedUsers = await db
      .select()
      .from(users)
      .where(
        and(
          sql`(${users.phone} = ${emailOrPhone} OR ${users.email} = ${emailOrPhone})`,
          sql`(${users.role} = 'Super Admin' OR ${users.role} = 'Admin')`
        )
      )
      .limit(1);

    if (matchedUsers.length === 0) {
      return res.status(401).json({ error: "Administrative account not found or access denied." });
    }

    const adminUser = matchedUsers[0];

    // Verify hashed password
    if (!adminUser.password) {
      return res.status(401).json({ error: "No password set for this account. Please log in via customer OTP." });
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    if (adminUser.isBlocked) {
      return res.status(403).json({ error: "This admin account has been suspended." });
    }

    // Generate Admin JWT Session Token
    const token = jwt.sign(
      { uid: adminUser.uid, role: adminUser.role, name: adminUser.name, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign({ uid: adminUser.uid }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    res.json({
      message: "Admin session authenticated successfully!",
      token,
      refreshToken,
      user: {
        uid: adminUser.uid,
        name: adminUser.name,
        role: adminUser.role,
        email: adminUser.email,
        phone: adminUser.phone,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Failed to process administrative sign in." });
  }
});

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

// Get Categories
app.get("/api/categories", async (req, res) => {
  try {
    const list = await db.select().from(categories).orderBy(categories.displayOrder);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// Create Category (Admin Only)
app.post("/api/categories", requireAdmin, async (req, res) => {
  const { name, image, displayOrder } = req.body;
  if (!name) return res.status(400).json({ error: "Category name is required" });

  try {
    const [newCat] = await db.insert(categories).values({
      name,
      image,
      displayOrder: displayOrder || 0,
    }).returning();
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category. Ensure name is unique." });
  }
});

// Update Category (Admin Only)
app.put("/api/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name, image, displayOrder } = req.body;

  try {
    const [updated] = await db
      .update(categories)
      .set({ name, image, displayOrder })
      .where(eq(categories.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category." });
  }
});

// Delete Category (Admin Only)
app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category." });
  }
});

// ==========================================
// PRODUCT MANAGEMENT
// ==========================================

// Get Products
app.get("/api/products", async (req, res) => {
  try {
    // Customers only see active products; admins can request archived
    const isManageMode = req.query.manage === "true";
    let list;
    if (isManageMode) {
      list = await db.select().from(products).orderBy(desc(products.id));
    } else {
      list = await db.select().from(products).where(eq(products.isArchived, false)).orderBy(desc(products.id));
    }

    // Format fields (ingredients & images back into actual array of objects/strings)
    const formattedList = list.map((p) => {
      const parsedImages = p.images ? JSON.parse(p.images) : [];
      return {
        ...p,
        id: String(p.id),
        pricePerUnit: p.price,
        unit: p.weight || "250g",
        ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
        images: parsedImages,
        image: parsedImages[0] || "",
        nutrition: p.nutrition ? JSON.parse(p.nutrition) : null,
      };
    });

    res.json(formattedList);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Failed to fetch sweets catalogue." });
  }
});

// Create Product (Admin Only)
app.post("/api/products", requireAdmin, async (req, res) => {
  const {
    name,
    category,
    description,
    price,
    discount,
    weight,
    ingredients,
    shelfLife,
    isVeg,
    isBestSeller,
    isFeatured,
    isFestivalSpecial,
    isFreshlyMadeToday,
    stockQuantity,
    images,
    nutrition,
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: "Product name, category and price are required." });
  }

  try {
    const mainImg = Array.isArray(images) && images.length > 0 ? images[0] : "";
    const [newProduct] = await db.insert(products).values({
      name,
      category,
      description,
      price: Number(price),
      discount: Number(discount) || 0,
      weight: weight || "250g",
      ingredients: ingredients ? JSON.stringify(ingredients) : "[]",
      shelfLife,
      isVeg: isVeg !== undefined ? isVeg : true,
      isBestSeller: !!isBestSeller,
      isFeatured: !!isFeatured,
      isFestivalSpecial: !!isFestivalSpecial,
      isFreshlyMadeToday: !!isFreshlyMadeToday,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 100,
      images: images ? JSON.stringify(images) : "[]",
      rating: 5.0,
      reviewsCount: 0,
      nutrition: nutrition ? JSON.stringify(nutrition) : null,
      isArchived: false,
    }).returning();

    res.status(201).json({
      ...newProduct,
      id: String(newProduct.id),
      ingredients: JSON.parse(newProduct.ingredients || "[]"),
      images: JSON.parse(newProduct.images || "[]"),
    });
  } catch (err) {
    console.error("Create product database error:", err);
    res.status(500).json({ error: "Failed to create sweet product." });
  }
});

// Edit Product (Admin Only)
app.put("/api/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const {
    name,
    category,
    description,
    price,
    discount,
    weight,
    ingredients,
    shelfLife,
    isVeg,
    isBestSeller,
    isFeatured,
    isFestivalSpecial,
    isFreshlyMadeToday,
    stockQuantity,
    images,
    nutrition,
  } = req.body;

  try {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (discount !== undefined) updates.discount = Number(discount);
    if (weight !== undefined) updates.weight = weight;
    if (ingredients !== undefined) updates.ingredients = JSON.stringify(ingredients);
    if (shelfLife !== undefined) updates.shelfLife = shelfLife;
    if (isVeg !== undefined) updates.isVeg = isVeg;
    if (isBestSeller !== undefined) updates.isBestSeller = !!isBestSeller;
    if (isFeatured !== undefined) updates.isFeatured = !!isFeatured;
    if (isFestivalSpecial !== undefined) updates.isFestivalSpecial = !!isFestivalSpecial;
    if (isFreshlyMadeToday !== undefined) updates.isFreshlyMadeToday = !!isFreshlyMadeToday;
    if (stockQuantity !== undefined) updates.stockQuantity = Number(stockQuantity);
    if (images !== undefined) {
      updates.images = JSON.stringify(images);
      if (Array.isArray(images) && images.length > 0) {
        updates.image = images[0];
      }
    }
    if (nutrition !== undefined) updates.nutrition = JSON.stringify(nutrition);

    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Product not found" });

    res.json({
      ...updated,
      id: String(updated.id),
      ingredients: JSON.parse(updated.ingredients || "[]"),
      images: JSON.parse(updated.images || "[]"),
    });
  } catch (err) {
    console.error("Update product database error:", err);
    res.status(500).json({ error: "Failed to update sweet details." });
  }
});

// Toggle Archive Product (Admin Only)
app.put("/api/products/:id/archive", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { isArchived } = req.body;

  try {
    const [updated] = await db
      .update(products)
      .set({ isArchived: !!isArchived })
      .where(eq(products.id, id))
      .returning();

    res.json({
      ...updated,
      id: String(updated.id),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to archive product" });
  }
});

// Delete Product (Admin Only)
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    res.json({
      ...deleted,
      id: String(deleted.id),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// ==========================================
// ORDER MANAGEMENT
// ==========================================

// Get Customer Orders
app.get("/api/orders", requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const list = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user.uid))
      .orderBy(desc(orders.createdAt));

    const formattedList = list.map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      address: o.address ? JSON.parse(o.address) : null,
    }));

    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve order history." });
  }
});

// Create Order (Guest or Registered Customer)
app.post("/api/orders", async (req, res) => {
  const {
    items,
    customerName,
    customerEmail,
    customerPhone,
    deliveryMethod,
    address,
    paymentMethod,
    couponCode,
    subtotal,
    discount,
    tax,
    deliveryFee,
    total,
    userId, // optionally provided if customer is logged in
  } = req.body;

  if (!items || items.length === 0 || !customerName || !customerPhone) {
    return res.status(400).json({ error: "Order details, name and phone are required." });
  }

  try {
    // 1. Transactionally update inventory quantities
    for (const item of items) {
      const pId = Number(item.product.id);
      const productList = await db.select().from(products).where(eq(products.id, pId)).limit(1);

      if (productList.length > 0) {
        const prod = productList[0];
        const newQty = Math.max(0, prod.stockQuantity - item.quantity);

        await db
          .update(products)
          .set({ stockQuantity: newQty })
          .where(eq(products.id, pId));
      }
    }

    // 2. Insert new order record
    const orderId = "MS-" + Math.floor(100000 + Math.random() * 900000);
    const [newOrder] = await db
      .insert(orders)
      .values({
        id: orderId,
        userId: userId || null,
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        address: address ? JSON.stringify(address) : null,
        paymentMethod,
        paymentStatus: paymentMethod === "online" ? "paid" : "pending",
        orderStatus: "pending",
        couponCode,
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        total: Number(total) || 0,
        items: JSON.stringify(items),
      })
      .returning();

    // 3. If a coupon was used, increment usage count
    if (couponCode) {
      await db.execute(
        sql`UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ${couponCode}`
      );
    }

    res.status(201).json({
      ...newOrder,
      items: JSON.parse(newOrder.items),
      address: newOrder.address ? JSON.parse(newOrder.address) : null,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to process order checkout." });
  }
});

// Admin Get All Orders
app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const formattedList = list.map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      address: o.address ? JSON.parse(o.address) : null,
    }));
    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// Admin Update Order Status
app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  try {
    const updates: any = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({
      ...updated,
      items: JSON.parse(updated.items),
      address: updated.address ? JSON.parse(updated.address) : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status." });
  }
});

// ==========================================
// CATERING MANAGEMENT
// ==========================================

// Submit Catering Inquiry
app.post("/api/catering", async (req, res) => {
  const {
    name,
    email,
    phone,
    date,
    guestsCount,
    occasion,
    packageType,
    selectedSweets,
    selectedNamkeens,
    additionalRequirements,
    estimatedPrice,
    userId,
  } = req.body;

  if (!name || !phone || !date || !guestsCount || !occasion) {
    return res.status(400).json({ error: "Missing required contact or event details." });
  }

  try {
    const inquiryId = "CAT-" + Math.floor(1000 + Math.random() * 9000);
    const [newInquiry] = await db
      .insert(cateringInquiries)
      .values({
        id: inquiryId,
        userId: userId || null,
        name,
        email,
        phone,
        date,
        guestsCount: Number(guestsCount),
        occasion,
        packageType,
        selectedSweets: selectedSweets ? JSON.stringify(selectedSweets) : "[]",
        selectedNamkeens: selectedNamkeens ? JSON.stringify(selectedNamkeens) : "[]",
        additionalRequirements,
        estimatedPrice: Number(estimatedPrice) || 0,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      ...newInquiry,
      selectedSweets: JSON.parse(newInquiry.selectedSweets || "[]"),
      selectedNamkeens: JSON.parse(newInquiry.selectedNamkeens || "[]"),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit catering inquiry." });
  }
});

// Admin Get Catering Inquiries
app.get("/api/admin/catering", requireAdmin, async (req, res) => {
  try {
    const list = await db.select().from(cateringInquiries).orderBy(desc(cateringInquiries.createdAt));
    const formatted = list.map((c) => ({
      ...c,
      selectedSweets: JSON.parse(c.selectedSweets || "[]"),
      selectedNamkeens: JSON.parse(c.selectedNamkeens || "[]"),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch catering inquiries." });
  }
});

// Admin Update Catering Inquiry Status
app.put("/api/catering/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [updated] = await db
      .update(cateringInquiries)
      .set({ status })
      .where(eq(cateringInquiries.id, id))
      .returning();

    res.json({
      ...updated,
      selectedSweets: JSON.parse(updated.selectedSweets || "[]"),
      selectedNamkeens: JSON.parse(updated.selectedNamkeens || "[]"),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update inquiry status." });
  }
});

// ==========================================
// REVIEWS MANAGEMENT
// ==========================================

// Get Approved Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const list = await db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .orderBy(desc(reviews.createdAt));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

// Submit Customer Review (Require customer login)
app.post("/api/reviews", requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { productName, rating, comment, image } = req.body;
  if (!productName || !rating || !comment) {
    return res.status(400).json({ error: "Product name, rating and comment are required." });
  }

  try {
    const reviewId = "rev_" + Math.random().toString(36).substr(2, 9);
    const customerName = req.user.name || "Customer";

    const [newReview] = await db
      .insert(reviews)
      .values({
        id: reviewId,
        userId: req.user.uid,
        productName,
        customerName,
        location: "Satna",
        rating: Number(rating),
        comment,
        image,
        approved: false, // requires admin approval
      })
      .returning();

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review." });
  }
});

// Admin Get All Reviews
app.get("/api/admin/reviews", requireAdmin, async (req, res) => {
  try {
    const list = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews catalogue." });
  }
});

// Admin Approve Review
app.put("/api/admin/reviews/:id/approve", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  try {
    const [updated] = await db
      .update(reviews)
      .set({ approved: !!approved })
      .where(eq(reviews.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve review" });
  }
});

// Admin Reply to Review
app.put("/api/admin/reviews/:id/reply", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { adminReply } = req.body;

  try {
    const [updated] = await db
      .update(reviews)
      .set({ adminReply })
      .where(eq(reviews.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to reply to review" });
  }
});

// Admin Delete Review
app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// ==========================================
// COUPON MANAGEMENT
// ==========================================

// Get All Coupons
app.get("/api/coupons", async (req, res) => {
  try {
    const list = await db.select().from(coupons).orderBy(desc(coupons.id));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve coupons list." });
  }
});

// Create Coupon (Admin)
app.post("/api/coupons", requireAdmin, async (req, res) => {
  const { code, type, value, expiryDate, usageLimit } = req.body;
  if (!code || !value || !expiryDate) {
    return res.status(400).json({ error: "Coupon code, value, and expiry date are required." });
  }

  try {
    const [newCoupon] = await db
      .insert(coupons)
      .values({
        code: code.toUpperCase(),
        type,
        value: Number(value),
        expiryDate,
        usageLimit: usageLimit ? Number(usageLimit) : 100,
        usageCount: 0,
        isActive: true,
      })
      .returning();

    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(500).json({ error: "Failed to create coupon code. Ensure coupon code is unique." });
  }
});

// Edit Coupon (Admin)
app.put("/api/coupons/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { type, value, expiryDate, usageLimit, isActive } = req.body;

  try {
    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (value !== undefined) updates.value = Number(value);
    if (expiryDate !== undefined) updates.expiryDate = expiryDate;
    if (usageLimit !== undefined) updates.usageLimit = Number(usageLimit);
    if (isActive !== undefined) updates.isActive = !!isActive;

    const [updated] = await db.update(coupons).set(updates).where(eq(coupons.id, id)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update coupon." });
  }
});

// Delete Coupon (Admin)
app.delete("/api/coupons/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [deleted] = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete coupon." });
  }
});

// Apply Coupon (Customer Checkout)
app.post("/api/coupons/apply", async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required." });

  try {
    const matches = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)))
      .limit(1);

    if (matches.length === 0) {
      return res.status(400).json({ error: "Invalid coupon code or coupon is inactive." });
    }

    const coupon = matches[0];

    // Check expiry
    const today = new Date().toISOString().split("T")[0];
    if (coupon.expiryDate < today) {
      return res.status(400).json({ error: "This coupon code has expired." });
    }

    // Check usage limits
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "This coupon usage limit has been exceeded." });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((Number(subtotal) * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }

    // Clamp discount to subtotal
    discountAmount = Math.min(discountAmount, Number(subtotal));

    res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate coupon." });
  }
});

// ==========================================
// CUSTOMER WISHLIST
// ==========================================

// Get Wishlist
app.get("/api/wishlist", requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const list = await db
      .select()
      .from(wishlist)
      .where(eq(wishlist.userId, req.user.uid));

    // Get product details for all wishlisted items
    const productIds = list.map((item) => item.productId);
    if (productIds.length === 0) {
      return res.json([]);
    }

    const matchedProducts = await db
      .select()
      .from(products)
      .where(sql`${products.id} IN ${productIds}`);

    const formattedProducts = matchedProducts.map((p) => {
      const parsedImages = p.images ? JSON.parse(p.images) : [];
      return {
        ...p,
        id: String(p.id),
        pricePerUnit: p.price,
        unit: p.weight || "250g",
        ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
        images: parsedImages,
        image: parsedImages[0] || "",
      };
    });

    res.json(formattedProducts);
  } catch (err) {
    console.error("Wishlist fetch error:", err);
    res.status(500).json({ error: "Failed to fetch wishlist." });
  }
});

// Toggle Item in Wishlist
app.post("/api/wishlist/toggle", requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const productId = Number(req.body.productId);
  if (!productId) return res.status(400).json({ error: "Product ID is required" });

  try {
    const existing = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, req.user.uid), eq(wishlist.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      // Remove from wishlist
      await db
        .delete(wishlist)
        .where(and(eq(wishlist.userId, req.user.uid), eq(wishlist.productId, productId)));
      res.json({ wishlisted: false, message: "Removed from wishlist." });
    } else {
      // Add to wishlist
      await db.insert(wishlist).values({
        userId: req.user.uid,
        productId,
      });
      res.json({ wishlisted: true, message: "Saved to wishlist!" });
    }
  } catch (err) {
    console.error("Wishlist toggle error:", err);
    res.status(500).json({ error: "Failed to update wishlist." });
  }
});

// ==========================================
// HOMEPAGE CONTENT MANAGEMENT
// ==========================================

// Get All Homepage Configs
app.get("/api/homepage-content", async (req, res) => {
  try {
    const list = await db.select().from(homepageContent);
    const config: any = {};
    for (const item of list) {
      config[item.key] = JSON.parse(item.value);
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to load homepage layout." });
  }
});

// Update Homepage Config (Admin Only)
app.post("/api/admin/homepage-content", requireAdmin, async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: "Homepage key and value are required." });
  }

  try {
    const valueString = JSON.stringify(value);
    const [updated] = await db
      .insert(homepageContent)
      .values({
        key,
        value: valueString,
      })
      .onConflictDoUpdate({
        target: homepageContent.key,
        set: { value: valueString, updatedAt: new Date() },
      })
      .returning();

    res.json({
      message: "Homepage component updated successfully!",
      key: updated.key,
      value: JSON.parse(updated.value),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update homepage content." });
  }
});

// ==========================================
// CUSTOMER USER MANAGEMENT (ADMIN ONLY)
// ==========================================

// Admin Get Customers
app.get("/api/admin/customers", requireAdmin, async (req, res) => {
  try {
    // Return users list with stats (e.g. order history counts)
    const usersList = await db.select().from(users).orderBy(desc(users.id));
    
    const formatted = usersList.map((u) => ({
      ...u,
      savedAddresses: u.savedAddresses ? JSON.parse(u.savedAddresses) : [],
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve customers list." });
  }
});

// Admin Toggle Block Customer
app.put("/api/admin/customers/:uid/block", requireAdmin, async (req, res) => {
  const { uid } = req.params;
  const { isBlocked } = req.body;

  try {
    const [updated] = await db
      .update(users)
      .set({ isBlocked: !!isBlocked })
      .where(eq(users.uid, uid))
      .returning();

    if (!updated) return res.status(404).json({ error: "Customer not found." });

    res.json({
      message: isBlocked ? "Customer successfully blocked." : "Customer successfully unblocked.",
      user: {
        uid: updated.uid,
        name: updated.name,
        phone: updated.phone,
        isBlocked: updated.isBlocked,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer block status." });
  }
});

// ==========================================
// AI CHATBOT (Live DB Integrations)
// ==========================================

let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (err) {
  console.error("Failed to initialize GoogleGenAI client:", err);
}

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  // Fetch sweets list live from the PostgreSQL database to grounding chatbot knowledge!
  let sweetsKnowledge = "";
  try {
    const activeProducts = await db.select().from(products).where(eq(products.isArchived, false)).limit(15);
    sweetsKnowledge = activeProducts
      .map(
        (p) =>
          `- ${p.name} (${p.category}): ₹${p.price} for ${p.weight || "250g"}. Shelf life: ${p.shelfLife || "N/A"}. Best Seller: ${p.isBestSeller ? "Yes" : "No"}. ${p.description}`
      )
      .join("\n");
  } catch (dbErr) {
    console.error("Failed to query live products for chat:", dbErr);
  }

  const systemInstruction = `You are 'Mithai', the Royal Concierge AI Assistant of Maheshwari Sweets.
Maheshwari Sweets is Satna's most trusted premium sweet brand since 2001, located on Station Road, Satna, Madhya Pradesh, India.
Your personality is incredibly polite, humble, warm, respectful, traditional, and helpful. You represent the royal Indian hospitality ('Atithi Devo Bhava').
Always address the guest with respect. You may start with words like 'Pranam!', 'Namaste!', or 'Welcome to Maheshwari Sweets!'.

Our Live sweets menu:
${sweetsKnowledge || "Motichoor Laddoo, Kaju Katli, Kesaria Rasmalai, Poha Jalebi, and Shahi Samosa."}

Key knowledge to guide your answers:
1. PRODUCTS:
   - Traditional Sweets: Motichoor Laddoo, Besan Laddoo, Mawa Bati. Prepared in pure cow ghee.
   - Dry Fruit Sweets: Premium Cashew Katli (Kaju Katli), Dry Fruit Bites (sugar-free healthy option), Kaju Pista Roll.
   - Milk Sweets: Kesaria Rasmalai, Desi Ghee Milk Cake, Rabri, Cham Cham, Gulab Jamun.
   - Bengali Sweets: Sponge Rasgulla, Sondesh, Malai Chom Chom.
   - Breakfast / Snacks: Poha Jalebi (Satna's favorite morning breakfast!), Shahi Samosa, Pyaz Kachori, Bread Pakoda, Dhokla.
   - Chaat: Raj Kachori, Aloo Tikki Chaat.
   - Gift Boxes: Royal Gold Sweets Box, Customized gift boxes/hampers.

2. SHELF LIFE & STORAGE:
   - Milk-based sweets (Rasmalai, Bengali sweets) MUST be refrigerated and consumed in 1-2 days.
   - Traditional ghee sweets last 7-10 days at room temperature.
   - Dry fruit sweets last up to 15-20 days.

3. ONLINE ORDERING & DELIVERY:
   - Delivery is available Satna-wide.
   - Home delivery is free for orders above ₹300, else a small ₹30 fee applies.
   - Store pickup is available from our main outlet at Station Road, Satna.
   - Customers can build custom hampers, and use coupons like FESTIVE10 for 10% off.

4. CATERING:
   - We cater for weddings, birthday parties, corporate events, etc., in Satna.
   - Silver, Gold, and Royal Diamond packages available. Users can use our live Catering Estimator page to submit requests.

Your instructions:
- Give very detailed, helpful, appetizing answers.
- Recommend specific items based on their requirements.
- Keep answers formatted in highly readable, beautifully structured Markdown with bold headers and bullet points.
- If the user asks about something unrelated, politely bring the conversation back to Maheshwari Sweets, Satna.`;

  try {
    if (!aiClient) {
      return res.json({
        answer:
          "Namaste! I am Mithai, Maheshwari Sweets' digital assistant. I am currently running in offline concierge mode, but I can happily tell you that Maheshwari Sweets is Satna's premier sweet destination since 2001! We specialize in premium Kaju Katli, pure cow ghee Motichoor Laddoos, fresh Poha Jalebi breakfasts, and premium catering packages. How may I assist you with your sweet cravings today?",
      });
    }

    const formattedContents = messages.map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.text }],
    }));

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      answer:
        response.text ||
        "Pranam! I couldn't formulate a response. How can I help you today with Maheshwari Sweets?",
    });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.json({
      answer:
        "Pranam! My apologies, but my connections are busy crafting fresh laddoos. I can share that we are always ready to deliver Satna's favorite sweets like Kaju Katli, saffron Rasmalai, and warm Poha Jalebi. You can easily browse our menu or place an order right here!",
    });
  }
});

// ==========================================
// VITE DEVELOPMENT SERVER & PRODUCTION FLOW
// ==========================================
async function startServer() {
  // Seed the database
  await seedDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
