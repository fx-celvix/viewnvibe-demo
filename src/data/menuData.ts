
// This file is no longer used for fetching menu data in the application.
// The menu is now fetched dynamically from the Firebase Firestore database.
// To manage the menu, please use the "Edit Menu" feature on the dashboard.

// You can use this file to seed the database for the first time if needed.

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
      { id: 'biryani', title: 'Biryani', items: [
        { name: 'Chicken Biryani', isVeg: false, prices: [{label: 'Half', price: 100}, {label: 'Full', price: 170}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken biryani", description: "Aromatic basmati rice cooked with succulent chicken pieces and a blend of traditional spices." },
        { name: 'Chicken Leg Biryani', isVeg: false, prices: [{label: 'Half', price: 110}, {label: 'Full', price: 180}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken leg biryani", description: "A flavorful biryani featuring a tender, marinated chicken leg piece, slow-cooked to perfection." },
        { name: 'Chicken Special Biryani', isVeg: false, prices: [{label: 'Half', price: 150}, {label: 'Full', price: 220}], imageUrl: "https://placehold.co/150x150.png", imageHint: "special chicken biryani", description: "Our signature biryani, made with extra chicken, a special masala blend, and garnished with fried onions." },
        { name: 'Egg Biryani', isVeg: false, prices: [{price: 120}], imageUrl: "https://placehold.co/150x150.png", imageHint: "egg biryani", description: "Fragrant basmati rice cooked with spiced, boiled eggs for a simple yet satisfying meal." },
      ]},
      { id: 'tandoor-kabab', title: 'Tandoor & Kabab', items: [
        { name: 'Tandoori Chicken', isVeg: false, prices: [{label: 'Half', price: 180}, {label: 'Full', price: 300}], imageUrl: "https://placehold.co/150x150.png", imageHint: "tandoori chicken", description: "Juicy chicken marinated in yogurt and spices, roasted in a traditional tandoor for a smoky flavor." },
        { name: 'Chicken Afghani', isVeg: false, prices: [{label: 'Half', price: 200}, {label: 'Full', price: 300}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken afghani", description: "Creamy and mild, this chicken is marinated in a rich blend of cream, cashews, and gentle spices." },
        { name: 'Chicken Tikka Kabab', isVeg: false, prices: [{label: 'Half', price: 200}, {label: 'Full', price: 300}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken tikka kabab", description: "Boneless chicken chunks marinated in spiced yogurt and grilled to perfection." },
        { name: 'Malai Tikka Kabab', isVeg: false, prices: [{label: 'Half', price: 140}, {label: 'Full', price: 240}], imageUrl: "https://placehold.co/150x150.png", imageHint: "malai tikka kabab", description: "Melt-in-your-mouth chicken kababs with a creamy, cheesy marinade." },
        { name: 'Leg Tandoori (1 Pcs)', isVeg: false, prices: [{price: 60}], imageUrl: "https://placehold.co/150x150.png", imageHint: "leg tandoori", description: "A single, succulent chicken leg piece marinated and roasted in the tandoor." },
      ]},
      { id: 'chinese-gravy', title: 'Chinese / Gravy', items: [
        { name: 'Paneer Chilli (8 Pcs)', isVeg: true, prices: [{label: 'Half', price: 130}, {label: 'Full', price: 200}], imageUrl: "https://placehold.co/150x150.png", imageHint: "paneer chilli", description: "Soft paneer cubes tossed in a tangy and spicy chili sauce with bell peppers and onions." },
        { name: 'Paneer Manchurian (8 Pcs)', isVeg: true, prices: [{label: 'Half', price: 130}, {label: 'Full', price: 230}], imageUrl: "https://placehold.co/150x150.png", imageHint: "paneer manchurian", description: "Fried paneer balls in a savory and aromatic Manchurian gravy." },
        { name: 'Chicken Lollipop (6 Pcs)', isVeg: false, prices: [{label: 'Half', price: 100}, {label: 'Full', price: 180}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken lollipop", description: "Frenched chicken winglets, marinated and deep-fried, served with a zesty sauce." },
        { name: 'Chicken Chilli (8 Pcs)', isVeg: false, prices: [{label: 'Half', price: 130}, {label: 'Full', price: 200}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken chilli", description: "Tender chicken pieces cooked in a classic spicy and savory chili sauce." },
        { name: 'Manchurian (8 Pcs)', isVeg: true, prices: [{label: 'Half', price: 80}, {label: 'Full', price: 140}], imageUrl: "https://placehold.co/150x150.png", imageHint: "manchurian", description: "Vegetable balls fried and tossed in a flavorful Manchurian sauce." },
        { name: 'Chicken Korma (2 Pcs)', isVeg: false, prices: [{label: '2 Pcs', price: 140}, {label: '4 Pcs', price: 280}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken korma", description: "A rich and creamy chicken curry made with yogurt, nuts, and delicate spices." },
        { name: 'Chicken 65 (4 Pcs)', isVeg: false, prices: [{label: '4 Pcs', price: 140}, {label: '8 Pcs', price: 200}], imageUrl: "https://placehold.co/150x150.png", imageHint: "chicken 65", description: "Spicy, deep-fried chicken chunks bursting with the flavor of ginger, garlic, and red chilies." },
      ]},
      { id: 'roti', title: 'Roti', items: [
        { name: 'Rumali Roti', isVeg: true, prices: [{price: 15}], imageUrl: "https://placehold.co/150x150.png", imageHint: "rumali roti", description: "A thin, soft, and foldable bread, perfect with gravies." },
        { name: 'Tandoori Roti', isVeg: true, prices: [{price: 15}], imageUrl: "https://placehold.co/150x150.png", imageHint: "tandoori roti", description: "Whole wheat bread baked in a traditional clay tandoor." },
        { name: 'Tandoor Butter Naan', isVeg: true, prices: [{price: 30}], imageUrl: "https://placehold.co/150x150.png", imageHint: "butter naan", description: "Soft, fluffy naan bread baked in a tandoor and brushed with butter." },
        { name: 'Lachha Paratha', isVeg: true, prices: [{price: 30}], imageUrl: "https://placehold.co/150x150.png", imageHint: "lachha paratha", description: "A multi-layered and flaky whole wheat bread." },
        { name: 'Roti', isVeg: true, prices: [{price: 20}], imageUrl: "https://placehold.co/150x150.png", imageHint: "roti", description: "A simple, unleavened whole wheat flatbread." },
      ]},
      { id: 'water-soft-drink', title: 'Water / Soft Drink', items: [
        { name: 'Water Bottle', isVeg: true, prices: [{price: 20}], imageUrl: "https://placehold.co/150x150.png", imageHint: "water bottle", description: "A standard bottle of purified drinking water." },
        { name: 'Cold Drink', isVeg: true, prices: [{price: 20}], imageUrl: "https://placehold.co/150x150.png", imageHint: "soft drink", description: "Choose from a selection of popular carbonated soft drinks." },
      ]},
];
