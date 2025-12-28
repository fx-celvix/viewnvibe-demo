
// This file is no longer used for fetching menu data in the application.
// The menu is now fetched dynamically from the Firebase Firestore database.
// To manage the menu, please use the "Edit Menu" feature on the dashboard.

// You can use this file to seed the database for the first time if needed.
// Updated for View N Vibe Café - 100% Pure Vegetarian Menu

interface Price {
  label?: string;
  price: number;
}

interface MenuItemData {
  name: string;
  description: string;
  prices: Price[];
  imageUrl: string;
  imageHint: string;
  isVeg: boolean;
  popular?: boolean;
  mustTry?: boolean;
}

interface MenuCategoryData {
  id: string;
  title: string;
  items: MenuItemData[];
}

export const menuData: MenuCategoryData[] = [
  {
    id: 'indian-main', title: 'Indian Main Course', items: [
      { name: 'Dal Makhani', isVeg: true, prices: [{ label: 'Half', price: 150 }, { label: 'Full', price: 250 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "dal makhani", description: "Creamy black lentils slow-cooked with butter and aromatic spices.", popular: true },
      { name: 'Shahi Paneer', isVeg: true, prices: [{ label: 'Half', price: 180 }, { label: 'Full', price: 280 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "shahi paneer", description: "Soft paneer cubes in a rich, creamy tomato-cashew gravy.", popular: true },
      { name: 'Palak Paneer', isVeg: true, prices: [{ label: 'Half', price: 170 }, { label: 'Full', price: 270 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "palak paneer", description: "Fresh spinach curry with soft paneer cubes." },
      { name: 'Kadai Paneer', isVeg: true, prices: [{ label: 'Half', price: 180 }, { label: 'Full', price: 280 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "kadai paneer", description: "Paneer cooked with bell peppers in a spicy tomato-onion masala." },
      { name: 'Malai Kofta', isVeg: true, prices: [{ label: 'Half', price: 180 }, { label: 'Full', price: 290 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "malai kofta", description: "Soft vegetable dumplings in a rich, creamy gravy." },
      { name: 'Mix Veg', isVeg: true, prices: [{ label: 'Half', price: 140 }, { label: 'Full', price: 230 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "mix vegetable", description: "Seasonal vegetables cooked in a flavorful masala." },
    ]
  },
  {
    id: 'tibetan', title: 'Tibetan Specialties', items: [
      { name: 'Veg Momos (Steamed)', isVeg: true, prices: [{ price: 100 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "steamed momos", description: "Soft steamed dumplings filled with vegetables, served with spicy chutney.", popular: true, mustTry: true },
      { name: 'Veg Momos (Fried)', isVeg: true, prices: [{ price: 120 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "fried momos", description: "Crispy fried dumplings with vegetable filling." },
      { name: 'Paneer Momos', isVeg: true, prices: [{ price: 130 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "paneer momos", description: "Momos stuffed with spiced paneer filling." },
      { name: 'Thukpa', isVeg: true, prices: [{ price: 120 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "thukpa", description: "Traditional Tibetan noodle soup with vegetables." },
      { name: 'Tingmo with Aloo Curry', isVeg: true, prices: [{ price: 100 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "tingmo", description: "Soft steamed Tibetan bread served with spicy potato curry." },
    ]
  },
  {
    id: 'italian', title: 'Italian', items: [
      { name: 'Margherita Pizza', isVeg: true, prices: [{ label: 'Regular', price: 220 }, { label: 'Large', price: 350 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "margherita pizza", description: "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.", popular: true },
      { name: 'Veg Supreme Pizza', isVeg: true, prices: [{ label: 'Regular', price: 280 }, { label: 'Large', price: 420 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "vegetable pizza", description: "Loaded with bell peppers, olives, mushrooms, onions, and cheese." },
      { name: 'Penne Arabiata', isVeg: true, prices: [{ price: 200 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "penne arabiata", description: "Penne pasta in a spicy tomato sauce with garlic and herbs." },
      { name: 'White Sauce Pasta', isVeg: true, prices: [{ price: 220 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "white sauce pasta", description: "Creamy pasta with mushrooms and herbs.", popular: true },
      { name: 'Garlic Bread', isVeg: true, prices: [{ label: 'Plain', price: 80 }, { label: 'Cheese', price: 120 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "garlic bread", description: "Crispy toasted bread with garlic butter." },
    ]
  },
  {
    id: 'chinese', title: 'Chinese', items: [
      { name: 'Veg Manchurian', isVeg: true, prices: [{ label: 'Dry', price: 140 }, { label: 'Gravy', price: 160 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "veg manchurian", description: "Deep-fried vegetable balls in tangy manchurian sauce." },
      { name: 'Paneer Chilli', isVeg: true, prices: [{ label: 'Dry', price: 180 }, { label: 'Gravy', price: 200 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "chilli paneer", description: "Crispy paneer tossed with peppers in spicy chili sauce." },
      { name: 'Veg Noodles', isVeg: true, prices: [{ price: 140 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "veg noodles", description: "Stir-fried noodles with mixed vegetables.", popular: true },
      { name: 'Veg Fried Rice', isVeg: true, prices: [{ price: 140 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "fried rice", description: "Classic fried rice with vegetables and soy sauce." },
      { name: 'Sweet Corn Soup', isVeg: true, prices: [{ price: 100 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "corn soup", description: "Creamy sweet corn soup with vegetables." },
    ]
  },
  {
    id: 'snacks-sandwiches', title: 'Snacks & Sandwiches', items: [
      { name: 'Veg Burger', isVeg: true, prices: [{ price: 120 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "veg burger", description: "Crispy veggie patty with fresh vegetables and sauces.", popular: true },
      { name: 'Paneer Burger', isVeg: true, prices: [{ price: 150 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "paneer burger", description: "Juicy paneer patty with lettuce, tomato, and special sauce." },
      { name: 'Club Sandwich', isVeg: true, prices: [{ price: 160 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "club sandwich", description: "Triple-layered sandwich with veggies, cheese, and special dressing." },
      { name: 'Grilled Sandwich', isVeg: true, prices: [{ price: 120 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "grilled sandwich", description: "Toasted sandwich with vegetables and cheese." },
      { name: 'Paneer Wrap', isVeg: true, prices: [{ price: 140 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "paneer wrap", description: "Soft wrap filled with spiced paneer and vegetables." },
      { name: 'French Fries', isVeg: true, prices: [{ label: 'Regular', price: 80 }, { label: 'Peri Peri', price: 100 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "french fries", description: "Crispy golden potato fries." },
    ]
  },
  {
    id: 'parantha', title: 'Parantha & Breads', items: [
      { name: 'Aloo Parantha', isVeg: true, prices: [{ price: 80 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "aloo parantha", description: "Stuffed wheat bread with spiced potato filling.", popular: true },
      { name: 'Paneer Parantha', isVeg: true, prices: [{ price: 100 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "paneer parantha", description: "Parantha stuffed with spiced cottage cheese." },
      { name: 'Mix Parantha', isVeg: true, prices: [{ price: 90 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "mix parantha", description: "Parantha with mixed vegetable filling." },
      { name: 'Plain Parantha', isVeg: true, prices: [{ price: 40 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "plain parantha", description: "Simple butter-fried wheat bread." },
      { name: 'Butter Naan', isVeg: true, prices: [{ price: 40 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "butter naan", description: "Soft leavened bread brushed with butter." },
      { name: 'Garlic Naan', isVeg: true, prices: [{ price: 50 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "garlic naan", description: "Naan bread with garlic and herbs." },
    ]
  },
  {
    id: 'beverages', title: 'Coffee & Beverages', items: [
      { name: 'Hot Coffee', isVeg: true, prices: [{ price: 60 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "hot coffee", description: "Freshly brewed aromatic coffee." },
      { name: 'Cold Coffee', isVeg: true, prices: [{ price: 80 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "cold coffee", description: "Chilled coffee blended with ice cream.", popular: true },
      { name: 'Cappuccino', isVeg: true, prices: [{ price: 90 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "cappuccino", description: "Italian-style espresso with foamed milk." },
      { name: 'Masala Tea', isVeg: true, prices: [{ price: 40 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "masala chai", description: "Traditional Indian spiced tea." },
      { name: 'Green Tea', isVeg: true, prices: [{ price: 50 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "green tea", description: "Refreshing and healthy green tea." },
      { name: 'Lemon Mint Cooler', isVeg: true, prices: [{ price: 70 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "lemon cooler", description: "Refreshing lime with fresh mint." },
    ]
  },
  {
    id: 'shakes', title: 'Shakes & Smoothies', items: [
      { name: 'Chocolate Shake', isVeg: true, prices: [{ price: 120 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "chocolate shake", description: "Rich and creamy chocolate milkshake.", popular: true },
      { name: 'Mango Shake', isVeg: true, prices: [{ price: 100 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "mango shake", description: "Fresh mango blended with milk and ice cream." },
      { name: 'Banana Shake', isVeg: true, prices: [{ price: 90 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "banana shake", description: "Creamy banana milkshake." },
      { name: 'Strawberry Shake', isVeg: true, prices: [{ price: 110 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "strawberry shake", description: "Sweet strawberry milkshake with fresh berries." },
      { name: 'Oreo Shake', isVeg: true, prices: [{ price: 130 }], imageUrl: "https://placehold.co/150x150.png", imageHint: "oreo shake", description: "Cookies and cream milkshake." },
    ]
  },
];
