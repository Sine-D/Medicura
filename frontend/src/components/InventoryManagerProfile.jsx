import { useState } from "react";

const InventoryManagerProfile = () => {
  const [name, setName] = useState("Dumindu Liyanaarachchi");
  const [email, setEmail] = useState("dumindu.liyanaarachchi@example.lk");
  const [mobile, setMobile] = useState("+94 71 234 5678");
  const [department, setDepartment] = useState("Inventory Management");
  const [location, setLocation] = useState("Colombo, Sri Lanka");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could call an API to persist updates
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-white/80">Personal information and account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              DL
            </div>
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="text-sm text-gray-500">Inventory Manager</p>
              <p className="text-sm text-gray-500">
                {email}
              </p>
            </div>
          </div>

          <p>
            <span className="font-semibold">Employee ID:</span> INV-SL-2025-002
          </p>
          <p>
            <span className="font-semibold">Department:</span> {department}
          </p>
          <p>
            <span className="font-semibold">Join Date:</span> March 10, 2022
          </p>
          <p>
            <span className="font-semibold">Last Login:</span> September 25,
            2025 14:45
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p>
              <span className="font-semibold">NIC:</span> 992345678V
            </p>
            <p>
              <span className="font-semibold">Mobile:</span> {mobile}
            </p>
            <p>
              <span className="font-semibold">Address:</span> 123, Galle Road, Colombo 03, Sri Lanka
            </p>
            <p>
              <span className="font-semibold">Time Zone:</span> GMT+5:30 (Sri Lanka Standard Time)
            </p>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">
            Update Profile Information
          </h2>
          {saved && (
            <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-2 text-sm">
              Profile updated successfully
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerProfile;
