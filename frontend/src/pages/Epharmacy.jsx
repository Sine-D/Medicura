import { useState, useEffect } from "react";
import { ShoppingCart, AlertCircle, Search, Heart, Star, Package, Shield, Plus } from "lucide-react";

const Home = () => {
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Local cart helpers (shared shape with MyCart page)
  const LOCAL_STORAGE_KEY = "demoCart";
  const loadCartFromStorage = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return { items: [], total: 0 };
      const parsed = JSON.parse(raw);
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        total: typeof parsed.total === "number" ? parsed.total : 0,
      };
    } catch {
      return { items: [], total: 0 };
    }
  };
  const saveCartToStorage = (cart) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
  };
  const calculateCartTotal = (cart) => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = Number(item?.inventoryItem?.price) || 0;
      const qty = Number(item?.quantity) || 0;
      return sum + price * qty;
    }, 0);
  };

  useEffect(() => {
    // Static demo items for customer view only (frontend only)
    const demoItems = [
      {
        _id: "1",
        itemName: "Paracetamol 500mg",
        itemCode: "MED-PCM-500",
        description: "Effective pain reliever and fever reducer.",
        price: 4.99,
        inStockQuantity: 34,
        imageUrl: "https://th.bing.com/th/id/OIP.W7NNdONWEXM2_wQ8QvEhYwHaHa?w=182&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "2",
        itemName: "Vitamin C 1000mg",
        itemCode: "SUP-VC-1000",
        description: "Immune system support and antioxidant.",
        price: 9.49,
        inStockQuantity: 12,
        imageUrl: "https://th.bing.com/th/id/OIP.6AkwCXVTpX-u34W-EVFYtwHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "3",
        itemName: "Cough Syrup (Honey Lemon)",
        itemCode: "OTC-CS-HL",
        description: "Soothes dry and productive coughs.",
        price: 6.25,
        inStockQuantity: 8,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.bNORoNCp4cLgzEAF6QZuDAHaHY?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "4",
        itemName: "Hand Sanitizer 250ml",
        itemCode: "PC-HS-250",
        description: "Kills 99.9% of germs without water.",
        price: 3.75,
        inStockQuantity: 0,
        imageUrl: "https://th.bing.com/th/id/OIP.lN_aTnUTF5__TKddT63J8QHaHa?w=189&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "5",
        itemName: "Antacid Tablets",
        itemCode: "OTC-ANT-24",
        description: "Fast relief from heartburn and indigestion.",
        price: 5.5,
        inStockQuantity: 25,
        imageUrl: "https://tse2.mm.bing.net/th/id/OIF.f2P1mr6gpiCEKp0GI8jGzQ?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "6",
        itemName: "Allergy Relief (Cetirizine)",
        itemCode: "OTC-ALR-10",
        description: "24-hour relief from sneezing and itching.",
        price: 7.99,
        inStockQuantity: 14,
        imageUrl: "https://tse1.mm.bing.net/th/id/OIP.hkgyiRTv-UpqwWm5KFoaUgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "7",
        itemName: "Digital Thermometer",
        itemCode: "PC-DT-01",
        description: "Accurate temperature readings in seconds.",
        price: 12.99,
        inStockQuantity: 6,
        imageUrl: "https://th.bing.com/th/id/OIP.LO_iW_1RrLGMCcJrWI_qiQHaGg?w=215&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "8",
        itemName: "Ibuprofen 200mg",
        itemCode: "MED-IBU-200",
        description: "Anti-inflammatory and pain relief tablets.",
        price: 5.99,
        inStockQuantity: 18,
        imageUrl: "https://th.bing.com/th/id/OIP.3lkJ6mZvaNZ1OIdjkc_pRgHaHa?w=180&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "9",
        itemName: "Amoxicillin 500mg",
        itemCode: "MED-AMX-500",
        description: "Broad-spectrum antibiotic for bacterial infections.",
        price: 14.99,
        inStockQuantity: 22,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.pe9PzhNHVRZOfujweFKRqAHaFl?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "10",
        itemName: "Insulin Syringes (10 pack)",
        itemCode: "MED-SYR-10",
        description: "Sterile syringes for insulin administration.",
        price: 8.99,
        inStockQuantity: 40,
        imageUrl: "https://th.bing.com/th/id/OIP.KmU5Gq8fyYVNgFZGMMJy7AHaGq?w=223&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "11",
        itemName: "Blood Pressure Monitor",
        itemCode: "DEV-BPM-01",
        description: "Automatic digital BP monitor with cuff.",
        price: 39.99,
        inStockQuantity: 10,
        imageUrl: "https://tse2.mm.bing.net/th/id/OIP.NZ6NGWTwbD4WTzB4lZ_doQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "12",
        itemName: "Glucometer Kit",
        itemCode: "DEV-GLU-01",
        description: "Blood glucose monitoring kit with strips.",
        price: 29.5,
        inStockQuantity: 15,
        imageUrl: "https://th.bing.com/th/id/OIP.WvhMeBWZNVgPBOp5RGx4FAHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "13",
        itemName: "Surgical Masks (50 pcs)",
        itemCode: "PC-MSK-50",
        description: "3-ply disposable face masks.",
        price: 11.99,
        inStockQuantity: 60,
        imageUrl: "https://th.bing.com/th/id/OIP.EKI4nOP5cEVmpcCG_iYgDAHaFR?w=257&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "14",
        itemName: "Sterile Gauze Pads",
        itemCode: "MED-GAU-25",
        description: "Absorbent pads for wound dressing.",
        price: 6.99,
        inStockQuantity: 35,
        imageUrl: "https://th.bing.com/th/id/OIP.IEX1DlhKvF8XCb0GL02EzQHaHa?w=242&h=181&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "15",
        itemName: "Antiseptic Wipes",
        itemCode: "MED-WIP-50",
        description: "Pre-injection and wound cleaning wipes.",
        price: 4.25,
        inStockQuantity: 48,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.3IzzbfA1F6G6BpNvi9ohcAHaGz?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "16",
        itemName: "Saline Nasal Spray",
        itemCode: "OTC-SAL-30",
        description: "Moisturizes dry nasal passages.",
        price: 3.99,
        inStockQuantity: 27,
        imageUrl: "https://th.bing.com/th/id/OIP.G_QlQNnBewtV6Qoy4sR6hAHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "17",
        itemName: "Lubricant Eye Drops",
        itemCode: "OTC-EYE-15",
        description: "Relieves dryness and irritation.",
        price: 5.75,
        inStockQuantity: 30,
        imageUrl: "https://th.bing.com/th/id/OIP.uCZOD2-F_D2dA2oH-a5YEAHaG7?w=209&h=195&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "18",
        itemName: "Oral Rehydration Salts",
        itemCode: "OTC-ORS-20",
        description: "Restores body fluids and electrolytes.",
        price: 2.99,
        inStockQuantity: 50,
        imageUrl: "https://th.bing.com/th/id/OIP.Q7d5A5iLyzIq6YKvy7tQXAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3Oral"
      },
      {
        _id: "19",
        itemName: "Probiotic Capsules",
        itemCode: "SUP-PRO-30",
        description: "Supports digestive and gut health.",
        price: 13.49,
        inStockQuantity: 19,
        imageUrl: "https://th.bing.com/th/id/OIP.7LRDJOoK2Gr-6_N3jg157wHaLH?w=128&h=192&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "20",
        itemName: "Antiseptic Cream",
        itemCode: "MED-ANT-CR",
        description: "Prevents infection in minor cuts and burns.",
        price: 4.49,
        inStockQuantity: 32,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.lU0BVuFE6Q54Cdj1XQf8pgHaFL?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "21",
        itemName: "Burn Relief Gel",
        itemCode: "MED-BRN-GEL",
        description: "Cooling gel for minor burns and scalds.",
        price: 5.25,
        inStockQuantity: 21,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.FFVimtvFBc9mgxXwzYKRhwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "22",
        itemName: "Throat Lozenges (Menthol)",
        itemCode: "OTC-THR-24",
        description: "Soothes sore throat and cough.",
        price: 3.5,
        inStockQuantity: 28,
        imageUrl: "https://th.bing.com/th/id/OIP.uFSGYSPLbU5PKeMLKLxPgAHaGb?w=225&h=196&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "23",
        itemName: "Nebulizer Machine",
        itemCode: "DEV-NEB-01",
        description: "Home-use nebulizer for respiratory therapy.",
        price: 49.99,
        inStockQuantity: 5,
        imageUrl: "https://th.bing.com/th/id/OIP.gt8ZYEqGXCq9BKgyQRDzogHaHa?w=199&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "24",
        itemName: "Stethoscope",
        itemCode: "DEV-STH-01",
        description: "Dual head lightweight stethoscope.",
        price: 24.99,
        inStockQuantity: 9,
        imageUrl: "https://th.bing.com/th/id/OIP.XppN5yTpG_86fT2-FaEqhwHaEx?w=280&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "25",
        itemName: "Elastic Bandage Roll",
        itemCode: "MED-BND-EL",
        description: "Compression support for sprains and strains.",
        price: 4.2,
        inStockQuantity: 36,
        imageUrl: "https://th.bing.com/th/id/OIP.aQIkoDyGYxH9KSnnEqif4wHaHa?w=168&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "26",
        itemName: "Hydrogen Peroxide 3%",
        itemCode: "MED-H2O2-3",
        description: "First-aid antiseptic for minor wounds.",
        price: 2.49,
        inStockQuantity: 44,
        imageUrl: "https://th.bing.com/th/id/OIP.E3Jwwg30ahg7o4Y653N3VQHaPM?w=115&h=196&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      },
      {
        _id: "27",
        itemName: "Alcohol Prep Pads",
        itemCode: "MED-ALC-100",
        description: "70% isopropyl alcohol swabs.",
        price: 3.2,
        inStockQuantity: 52,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.svmvGyDelIwhO4BC58TlYAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      },
      {
        _id: "28",
        itemName: "Surgical Gloves (Latex)",
        itemCode: "MED-GLV-LTX",
        description: "Powder-free sterile surgical gloves.",
        price: 7.5,
        inStockQuantity: 26,
        imageUrl: "https://th.bing.com/th/id/OIP.I4aPfngpQned6QGvYC5n_AHaHa?w=192&h=192&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
      }
    ];

    setInventories(demoItems);
    setFilteredInventories(demoItems);
    setError(null);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = inventories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter (you can extend this based on your data structure)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        // This is a placeholder - you might want to add a category field to your inventory model
        return true; // For now, show all items
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.itemName.localeCompare(b.itemName);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "stock":
          return b.inStockQuantity - a.inStockQuantity;
        default:
          return 0;
      }
    });

    setFilteredInventories(filtered);
  }, [inventories, searchTerm, selectedCategory, sortBy]);

  // Add-to-cart stores items in localStorage for MyCart page
  const handleAddToCart = (item) => {
    if (item.inStockQuantity <= 0) return;
    setCartLoading((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      const current = loadCartFromStorage();
      const existing = current.items.find(
        (i) => i.inventoryItem && i.inventoryItem._id === item._id
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        current.items.push({ inventoryItem: item, quantity: 1 });
      }
      current.total = calculateCartTotal(current);
      saveCartToStorage(current);
      setCartLoading((prev) => ({ ...prev, [item._id]: false }));
      alert(`${item.itemName} added to cart`);
    }, 400);
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Package className="text-white" size={28} />
                <h1 className="text-xl font-bold text-white">E-Pharmacy</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/my-cart"
                className="flex items-center gap-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                <ShoppingCart size={20} />
                <span className="font-medium">My Cart</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Trusted E-Pharmacy
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Quality medicines and healthcare products delivered to your doorstep
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="text-green-500" size={16} />
              <span>FDA Approved</span>
              <span>•</span>
              <Star className="text-yellow-500" size={16} />
              <span>Trusted by 10,000+ customers</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search medicines, products, or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="prescription">Prescription</option>
                <option value="otc">Over-the-Counter</option>
                <option value="supplements">Supplements</option>
                <option value="personal-care">Personal Care</option>
              </select>
              
              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock Available</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Products ({filteredInventories.length})
            </h2>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
              >
                <div className="bg-gray-200 rounded-lg h-48 w-full mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredInventories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? "No products found matching your search" : "No inventory items available"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventories.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image Section */}
                <div className="relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.itemName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/400x400?text=Medicine";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <Package className="text-blue-400" size={48} />
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.inStockQuantity <= 0
                          ? "bg-red-500 text-white"
                          : item.inStockQuantity < 10
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {item.inStockQuantity <= 0
                        ? "Out of Stock"
                        : `${item.inStockQuantity} left`}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button className="absolute top-3 left-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className="p-5">
                  {/* Product Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 mb-1">
                      {item.itemName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Code: {item.itemCode}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description || "No description available"}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">per unit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={cartLoading[item._id] || item.inStockQuantity <= 0}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.inStockQuantity <= 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : cartLoading[item._id]
                        ? "bg-blue-400 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                    }`}
                  >
                    {cartLoading[item._id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        {item.inStockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;