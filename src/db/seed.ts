import { db } from "./index.ts";
import { categories, products, users, homepageContent, coupons } from "./schema.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  try {
    console.log("Checking database seeding status...");

    // 1. Seed Categories
    const existingCats = await db.select().from(categories).limit(1);
    if (existingCats.length === 0) {
      console.log("Seeding categories...");
      const defaultCategories = [
        { name: "Dry Fruit Sweets", image: "https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=600", displayOrder: 1 },
        { name: "Milk Sweets", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600", displayOrder: 2 },
        { name: "Bengali Sweets", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=600", displayOrder: 3 },
        { name: "Traditional Sweets", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=600", displayOrder: 4 },
        { name: "Breakfast", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600", displayOrder: 5 },
        { name: "Snacks", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600", displayOrder: 6 },
        { name: "Chaat", image: "https://images.unsplash.com/photo-1547245320-f87ea310d4f1?auto=format&fit=crop&q=80&w=600", displayOrder: 7 },
        { name: "Namkeen", image: "https://images.unsplash.com/photo-1547245320-f87ea310d4f1?auto=format&fit=crop&q=80&w=600", displayOrder: 8 },
        { name: "Gift Boxes", image: "https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=600", displayOrder: 9 },
      ];
      await db.insert(categories).values(defaultCategories);
    }

    // 2. Seed Default Products
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      console.log("Seeding products...");
      const defaultProducts = [
        {
          name: "Premium Kaju Katli",
          category: "Dry Fruit Sweets",
          description: "Rich, melt-in-the-mouth diamonds crafted with premium Goan cashews and purified sugar syrup, adorned with pure silver leaf (vark). A timeless royal classic.",
          price: 250,
          discount: 10,
          weight: "250g",
          ingredients: JSON.stringify(["Premium Cashews", "Sugar", "Water", "Pure Silver Leaf"]),
          shelfLife: "20 Days",
          isVeg: true,
          isBestSeller: true,
          isFeatured: true,
          isFreshlyMadeToday: true,
          stockQuantity: 120,
          images: JSON.stringify(["https://images.unsplash.com/photo-1605197585662-7935b0b2e84f?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.9,
          reviewsCount: 142,
          nutrition: JSON.stringify({ calories: "478 kcal", protein: "9.2g", carbohydrates: "57g", fat: "24.5g" }),
        },
        {
          name: "Royal Kesaria Rasmalai",
          category: "Milk Sweets",
          description: "Soft, spongy cottage cheese patties soaked in thick, saffron-infused creamy milk, garnished with pistachio and almond shavings. Served chilled.",
          price: 120,
          discount: 0,
          weight: "2 pcs",
          ingredients: JSON.stringify(["Cottage Cheese (Chhena)", "Milk", "Saffron", "Pistachio", "Almonds", "Sugar"]),
          shelfLife: "2 Days (Keep Refrigerated)",
          isVeg: true,
          isBestSeller: true,
          isFeatured: true,
          isFreshlyMadeToday: true,
          stockQuantity: 45,
          images: JSON.stringify(["https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.8,
          reviewsCount: 98,
          nutrition: JSON.stringify({ calories: "180 kcal", protein: "6g", carbohydrates: "21g", fat: "8g" }),
        },
        {
          name: "Pure Desi Ghee Milk Cake",
          category: "Milk Sweets",
          description: "Traditional grainy, slow-cooked caramelized milk sweet flavored with green cardamom. Sweetened to perfection with a rich golden center.",
          price: 180,
          discount: 5,
          weight: "250g",
          ingredients: JSON.stringify(["Pure Milk", "Sugar", "Desi Ghee", "Cardamom"]),
          shelfLife: "7 Days",
          isVeg: true,
          isBestSeller: true,
          isFeatured: false,
          isFreshlyMadeToday: false,
          stockQuantity: 8, // low stock for alert testing
          images: JSON.stringify(["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.7,
          reviewsCount: 86,
          nutrition: JSON.stringify({ calories: "395 kcal", protein: "8.5g", carbohydrates: "48g", fat: "18g" }),
        },
        {
          name: "Premium Dry Fruit Bites",
          category: "Dry Fruit Sweets",
          description: "An exquisite sugar-free healthy delight made entirely of premium dates, figs, almonds, cashews, and pistachios. Perfect for guilt-free festive gifting.",
          price: 350,
          discount: 0,
          weight: "250g",
          ingredients: JSON.stringify(["Dates", "Figs (Anjeer)", "Almonds", "Cashews", "Pistachios", "Desi Ghee"]),
          shelfLife: "30 Days",
          isVeg: true,
          isBestSeller: false,
          isFeatured: true,
          isFreshlyMadeToday: true,
          stockQuantity: 80,
          images: JSON.stringify(["https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.9,
          reviewsCount: 54,
          nutrition: JSON.stringify({ calories: "410 kcal", protein: "7g", carbohydrates: "52g", fat: "19g" }),
        },
        {
          name: "Sponge Rasgulla",
          category: "Bengali Sweets",
          description: "Super soft, light-as-air white chhena dumplings squeezed gently and saturated with light, aromatic cardamom sugar syrup.",
          price: 100,
          discount: 0,
          weight: "5 pcs",
          ingredients: JSON.stringify(["Fresh Chhena", "Sugar Syrup", "Cardamom Essence"]),
          shelfLife: "3 Days (Keep Refrigerated)",
          isVeg: true,
          isBestSeller: true,
          isFeatured: false,
          isFreshlyMadeToday: true,
          stockQuantity: 60,
          images: JSON.stringify(["https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.8,
          reviewsCount: 112,
          nutrition: JSON.stringify({ calories: "125 kcal", protein: "4g", carbohydrates: "26g", fat: "1.5g" }),
        },
        {
          name: "Satna Special Poha Jalebi Combo",
          category: "Breakfast",
          description: "Satna's favorite morning ritual! Lightly spiced flattened rice (Poha) garnished with sev, pomegranate, and coriander, paired with piping hot, crispy, syrupy Pure Ghee Jalebi.",
          price: 80,
          discount: 0,
          weight: "1 Plate",
          ingredients: JSON.stringify(["Rice Flakes", "Mustard Seeds", "Curry Leaves", "Turmeric", "Sev", "Maida", "Pure Ghee", "Sugar Syrup"]),
          shelfLife: "Consume within 4 Hours",
          isVeg: true,
          isBestSeller: true,
          isFeatured: true,
          isFreshlyMadeToday: true,
          stockQuantity: 150,
          images: JSON.stringify(["https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.9,
          reviewsCount: 215,
          nutrition: JSON.stringify({ calories: "380 kcal", protein: "5.2g", carbohydrates: "65g", fat: "11g" }),
        },
        {
          name: "Special Ratlami Sev",
          category: "Namkeen",
          description: "Crispy, highly spiced gram flour noodles infused with the robust flavors of clove (laung), black pepper, and premium spices. A classic Madhya Pradesh savory.",
          price: 90,
          discount: 10,
          weight: "250g",
          ingredients: JSON.stringify(["Gram Flour (Besan)", "Groundnut Oil", "Cloves", "Black Pepper", "Asafoetida", "Salt"]),
          shelfLife: "45 Days",
          isVeg: true,
          isBestSeller: true,
          isFeatured: false,
          isFreshlyMadeToday: false,
          stockQuantity: 200,
          images: JSON.stringify(["https://images.unsplash.com/photo-1547245320-f87ea310d4f1?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.7,
          reviewsCount: 110,
          nutrition: JSON.stringify({ calories: "520 kcal", protein: "14g", carbohydrates: "38g", fat: "34g" }),
        },
        {
          name: "Pure Ghee Motichoor Laddoo",
          category: "Traditional Sweets",
          description: "Irresistibly soft laddoos crafted from tiny gram flour globules (boondi) slow-cooked in pure aromatic cow ghee, flavored with saffron, cardamom, and melon seeds.",
          price: 160,
          discount: 0,
          weight: "250g",
          ingredients: JSON.stringify(["Gram Flour", "Pure Ghee", "Sugar", "Saffron", "Cardamom", "Melon Seeds"]),
          shelfLife: "10 Days",
          isVeg: true,
          isBestSeller: true,
          isFeatured: true,
          isFreshlyMadeToday: true,
          stockQuantity: 90,
          images: JSON.stringify(["https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.9,
          reviewsCount: 184,
          nutrition: JSON.stringify({ calories: "385 kcal", protein: "4.5g", carbohydrates: "54g", fat: "16.5g" }),
        },
        {
          name: "Royal Gold Sweets Box (Assorted)",
          category: "Gift Boxes",
          description: "An incredibly luxurious gold-foiled gifting box containing a fine assortment of Kaju Katli, Dry Fruit Bites, Milk Cake, and Premium Laddoos.",
          price: 650,
          discount: 15,
          weight: "500g Box",
          ingredients: JSON.stringify(["Mixed Premium Sweets", "High-Quality Packaging Material"]),
          shelfLife: "15 Days",
          isVeg: true,
          isBestSeller: false,
          isFeatured: true,
          isFreshlyMadeToday: true,
          stockQuantity: 50,
          images: JSON.stringify(["https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=600"]),
          rating: 4.9,
          reviewsCount: 89,
          nutrition: JSON.stringify({ calories: "450 kcal Avg", protein: "8.2g", carbohydrates: "52g", fat: "21g" }),
        }
      ];
      await db.insert(products).values(defaultProducts);
    }

    // 3. Seed Default Admin (Super Admin)
    const existingAdmins = await db.select().from(users).where(eq(users.role, "Super Admin")).limit(1);
    if (existingAdmins.length === 0) {
      console.log("Seeding Super Admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        uid: "superadmin-uid-maheshwari",
        email: "admin@maheshwarisweets.com",
        name: "Super Admin",
        phone: "9999999999",
        password: hashedPassword,
        role: "Super Admin",
        isBlocked: false,
      });
    }

    // 4. Seed Dynamic Homepage Content
    const existingHomeContent = await db.select().from(homepageContent).limit(1);
    if (existingHomeContent.length === 0) {
      console.log("Seeding dynamic homepage content...");
      const homeContents = [
        {
          key: "announcement",
          value: JSON.stringify({ text: "✨ Festive Offer: Free Delivery Satna-wide on orders above ₹300! Use code FESTIVE10 for 10% off. ✨" }),
        },
        {
          key: "hero_banner",
          value: JSON.stringify({
            title: "Royal Taste of Traditional Satna",
            subtitle: "Delivering pure-ghee bliss and premium handmade sweet boxes to your doorstep since 2001",
            image: "https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=1200",
            buttonText: "Explore Collection",
          }),
        },
        {
          key: "homepage_slider",
          value: JSON.stringify([
            {
              title: "Freshly Made Daily Breakfast",
              subtitle: "Start your morning with our traditional Satna-special Poha Jalebi",
              image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=1200",
            },
            {
              title: "Luxurious Wedding Gift Boxes",
              subtitle: "Premium gold-foiled customization hampers for special celebrations",
              image: "https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=1200",
            },
          ]),
        },
        {
          key: "promotional_banner",
          value: JSON.stringify({
            title: "Plan Your Next Grand Event",
            subtitle: "Maheshwari Sweets offers catering services for weddings, corporate parties, and family gatherings in Satna.",
            buttonText: "Get Live Catering Quote",
            image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
          }),
        }
      ];
      for (const content of homeContents) {
        await db.insert(homepageContent).values(content).onConflictDoNothing();
      }
    }

    // 5. Seed Coupons
    const existingCoupons = await db.select().from(coupons).limit(1);
    if (existingCoupons.length === 0) {
      console.log("Seeding default coupons...");
      await db.insert(coupons).values([
        {
          code: "FESTIVE10",
          type: "percentage",
          value: 10,
          expiryDate: "2028-12-31",
          usageLimit: 500,
          usageCount: 0,
          isActive: true,
        },
        {
          code: "WELCOME50",
          type: "flat",
          value: 50,
          expiryDate: "2028-12-31",
          usageLimit: 1000,
          usageCount: 0,
          isActive: true,
        },
      ]);
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}
