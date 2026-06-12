import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  Settings,
  Bell,
  Filter,
} from "lucide-react";

export default function Dashboard({ onCreateCase }) {
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchCases = async (searchTerm = "") => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("user_id");

      let url = `${BASE_URL}/api/v1/cases?user_id=${userId}`;

      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      const data = await response.json();

      setCases(data);
    } catch (err) {
      console.error("Fetch Cases Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("legalai_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");

    sessionStorage.clear();

    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#f8f9fc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#081f4d]">
            LegalAI
          </h1>
          <p className="text-sm text-gray-500">
            Premium LegalTech
          </p>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            <li className="bg-[#eef2ff] text-[#081f4d] rounded-lg">
              <button className="w-full flex items-center gap-3 px-4 py-3">
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FolderOpen size={18} />
                Cases
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings size={18} />
                Settings
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome Back
            </h1>

            <p className="text-gray-500 mt-2">
              Manage and search your legal cases.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Bell className="text-gray-500" />

            <button
              onClick={onCreateCase}
              className="bg-[#081f4d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0f2f6d] transition"
            >
              + Create New Case
            </button>
          </div>
        </div>

        {/* Cases Card */}
        <div className="bg-white rounded-xl border border-gray-200 mt-10">
          {/* Top Bar */}
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Recent Cases
            </h2>

            <div className="flex gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSearch(value);

                    fetchCases(value);
                  }}
                  placeholder="Search cases..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-72"
                />
              </div>

              <button className="border rounded-lg px-4 py-2 flex items-center gap-2">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-4">CASE ID</th>
                <th className="px-6 py-4">CASE TITLE</th>
                <th className="px-6 py-4">CREATED DATE</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    Loading Cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    No Cases Found
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => console.log(item.id)}
                  >
                    <td className="px-6 py-5">
                      {item.id.slice(0, 8)}
                    </td>

                    <td className="px-6 py-5 font-medium">
                      {item.title}
                    </td>

                    <td className="px-6 py-5">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${item.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "pending_charge_review"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="flex justify-between p-5 border-t text-sm text-gray-500">
            <button>Previous</button>
            <span>
              Total Cases: {cases.length}
            </span>
            <button>Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}