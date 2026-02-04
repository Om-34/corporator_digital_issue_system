import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Reasons = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reasons, setReasons] = useState([]);
  const [reasonName, setReasonName] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    const res = await api.get("/reasons");
    setReasons(res.data);
  };

  const handleCreateReason = async (e) => {
    e.preventDefault();

    if (!reasonName) {
      alert("Enter reason name");
      return;
    }

    await api.post("/reasons", { reasonName });
    setReasonName("");
    fetchReasons();
  };

  const deactivateReason = async (id) => {
    await api.patch(`/reasons/${id}/deactivate`);
    fetchReasons();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Issue Categories</h2>

      <form onSubmit={handleCreateReason}>
        <input
          placeholder="New category"
          value={reasonName}
          onChange={(e) => setReasonName(e.target.value)}
        />
        <button>Add</button>
      </form>

      <hr />

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Category</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reasons.map((r) => (
            <tr key={r.id}>
              <td>{r.reason_name}</td>
              <td>{r.is_active ? "Active" : "Inactive"}</td>
              <td>
                {r.is_active && (
                  <button onClick={() => deactivateReason(r.id)}>
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reasons;
