import { useState, useEffect } from "react";
import { ShoppingCart, AlertCircle, Search, Heart, Star, Package, Shield, Plus } from "lucide-react";
import { getAllInventoryItems, updateInventoryItem } from "../apis/inventoryApi";
import { addItemToCart } from "../apis/cartApi";
import { currentUserEmail } from "../contexts/userContext";

const EPharmacy = () => {
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const { data } = await getAllInventoryItems("");
      setInventories(data || []);
      setFilteredInventories(data || []);
      setError(null);
    } catch (e) {
      setError("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    const onChanged = () => fetchInventories();
    window.addEventListener("inventory:changed", onChanged);
    return () => window.removeEventListener("inventory:changed", onChanged);
  }, []);

  // No backend search on type; we filter client-side in real time

  // Client-side combined search + category filter + sorting (real-time)
  useEffect(() => {
    let filtered = [...inventories];

    // Search by name, code, or description (case-insensitive, partial)
    if (searchTerm && typeof searchTerm === "string") {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const name = (item.itemName || "").toLowerCase();
        const code = (item.itemCode || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        return (
          name.includes(term) ||
          code.includes(term) ||
          desc.includes(term)
        );
      });
    }

    // Category filter
    if (selectedCategory !== "all") {
      const selected = selectedCategory.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const itemCategory = (item.category || "").toLowerCase();
        return itemCategory === selected;
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

  const handleAddToCart = async (item) => {
    if (item.inStockQuantity <= 0) return;
    setCartLoading((prev) => ({ ...prev, [item._id]: true }));
    try {
      // 1) Add or increment item in cart backend
      await addItemToCart(currentUserEmail, {
        inventoryItemId: item._id,
        quantity: 1
      });

      // 2) Decrement stock in inventory
      const newQty = Math.max(0, item.inStockQuantity - 1);
      await updateInventoryItem(item._id, { inStockQuantity: newQty });
      
      setInventories((prev) => prev.map((it) => it._id === item._id ? { ...it, inStockQuantity: newQty } : it));
      setFilteredInventories((prev) => prev.map((it) => it._id === item._id ? { ...it, inStockQuantity: newQty } : it));
      window.dispatchEvent(new CustomEvent("inventory:changed"));
    } catch (e) {
      console.error("Add to cart error:", e);
      alert(`Failed to add to cart. ${e.response?.data?.error || e.message}`);
    } finally {
      setCartLoading((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  // Format currency
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
                <option value="First Aid & Emergency">First Aid & Emergency</option>
                <option value="Medical Equipment & Devices">Medical Equipment & Devices</option>
                <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                <option value="Chronic Care & Specialty Medicines">Chronic Care & Specialty Medicines</option>
                <option value="Baby & Pediatric Care">Baby & Pediatric Care</option>
                <option value="Dermatology / Skin Care">Dermatology / Skin Care</option>
                <option value="Surgical & Hospital Supplies">Surgical & Hospital Supplies</option>
                <option value="Prescription">Prescription</option>
                <option value="Over-the-Counter">Over-the-Counter</option>
                <option value="Supplements">Supplements</option>
                <option value="Personal Care">Personal Care</option>
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
                      {item.inStockQuantity <= 0 ? "Out of Stock" : `${item.inStockQuantity} left`}
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

export default EPharmacy;
