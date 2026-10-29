import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { apiRequest } from "./api";

function readUser() {
  try { return JSON.parse(localStorage.getItem("vahanashare_user") || "null"); }
  catch { return null; }
}

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <Link className="brand" to="/">Vahana<span>Share</span></Link>
      <nav>
        <Link to="/">Vehicles</Link>
        {user && <Link to="/bookings">My bookings</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        {user ? <button className="nav-button" onClick={onLogout}>Log out</button> : <Link to="/login">Log in</Link>}
      </nav>
    </header>
  );
}

function Home({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [message, setMessage] = useState("");
  const [dates, setDates] = useState({});
  const [busy, setBusy] = useState(false);

  async function loadVehicles() {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (type !== "All") params.set("type", type);
      setVehicles(await apiRequest(`/vehicles?${params.toString()}`));
      setMessage("");
    } catch (error) { setMessage(error.message); }
  }

  useEffect(() => { loadVehicles(); }, [type]);

  async function book(vehicle) {
    if (!user) {
      setMessage("Please log in before booking a vehicle.");
      return;
    }
    const chosen = dates[vehicle._id] || {};
    if (!chosen.startDate || !chosen.endDate) {
      setMessage("Choose a start date and end date on a vehicle card first.");
      return;
    }
    setBusy(true);
    try {
      const booking = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({ vehicleId: vehicle._id, ...chosen })
      });
      setMessage(`Booking confirmed for ${vehicle.name}. Estimated total: ₹${booking.totalPrice}.`);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">YOUR JOURNEY, YOUR WAY</p>
        <h1>Find a ride.<br /><span>Make it yours.</span></h1>
        <p className="hero-copy">Browse bikes and cars, choose your dates, and book your next journey with ease.</p>
        <a className="primary-link" href="#vehicles">Explore vehicles ↓</a>
      </section>

      <section className="section" id="vehicles">
        <div className="section-heading">
          <div><p className="eyebrow">THE FLEET</p><h2>Available vehicles</h2></div>
          <span className="count">{vehicles.length} listed</span>
        </div>
        <form className="filters" onSubmit={(event) => { event.preventDefault(); loadVehicles(); }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, brand, location..." />
          <select value={type} onChange={e => setType(e.target.value)}>
            <option>All</option><option>Bike</option><option>Car</option>
          </select>
          <button className="secondary-button" type="submit">Search</button>
        </form>
        {message && <p className="notice" role="status">{message}</p>}
        {vehicles.length === 0 ? <div className="empty"><h3>No vehicles found yet</h3><p>Add a vehicle using the admin account, then it will appear here.</p></div> :
          <div className="vehicle-grid">
            {vehicles.map(vehicle => (
              <article className="vehicle-card" key={vehicle._id}>
                {vehicle.imageUrl ? <img className="vehicle-image" src={vehicle.imageUrl} alt={vehicle.name} /> :
                  <div className="vehicle-placeholder"><span>{vehicle.type === "Bike" ? "🏍️" : "🚗"}</span><small>{vehicle.type}</small></div>}
                <div className="vehicle-body">
                  <div className="card-top"><span className="pill">{vehicle.type}</span><span className="location">⌖ {vehicle.location}</span></div>
                  <h3>{vehicle.name}</h3>
                  <p className="muted">{vehicle.brand || "Independent listing"}{vehicle.description ? ` · ${vehicle.description}` : ""}</p>
                  <p className="price">₹{vehicle.pricePerDay}<span> / day</span></p>
                  <div className="date-fields">
                    <label>From<input type="date" min={new Date().toISOString().slice(0,10)} value={dates[vehicle._id]?.startDate || ""} onChange={e => setDates(prev => ({...prev, [vehicle._id]: {...prev[vehicle._id], startDate: e.target.value}}))} /></label>
                    <label>Until<input type="date" min={dates[vehicle._id]?.startDate || new Date().toISOString().slice(0,10)} value={dates[vehicle._id]?.endDate || ""} onChange={e => setDates(prev => ({...prev, [vehicle._id]: {...prev[vehicle._id], endDate: e.target.value}}))} /></label>
                  </div>
                  <button className="primary-button full" disabled={busy} onClick={() => book(vehicle)}>{user ? "Book this vehicle" : "Log in to book"}</button>
                </div>
              </article>
            ))}
          </div>}
      </section>
    </main>
  );
}

function AuthPage({ mode, onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const data = await apiRequest(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST", body: JSON.stringify(form)
      });
      onAuth(data);
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">{isRegister ? "JOIN THE JOURNEY" : "WELCOME BACK"}</p>
        <h1>{isRegister ? "Create your account" : "Log in"}</h1>
        <p className="muted">{isRegister ? "Make booking your next ride simple." : "Log in to manage your vehicle bookings."}</p>
        {isRegister && <label>Full name<input required maxLength="80" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></label>}
        <label>Email address<input type="email" required autoComplete="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></label>
        <label>Password<input type="password" required minLength="8" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={e => setForm({...form, password:e.target.value})} /><small>At least 8 characters.</small></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary-button full" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}</button>
        <p className="auth-switch">{isRegister ? "Already registered?" : "New to VahanaShare?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></p>
      </form>
    </main>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/bookings/my").then(setBookings).catch(e => setError(e.message)); }, []);
  return <main className="section page-section"><p className="eyebrow">YOUR TRIPS</p><h1>My bookings</h1>
    {error && <p className="error">{error}</p>}
    {!error && bookings.length === 0 && <div className="empty"><h3>No bookings yet</h3><p>Your confirmed bookings will appear here.</p><Link to="/">Browse vehicles</Link></div>}
    <div className="booking-list">{bookings.map(b => <article className="booking-row" key={b._id}><div><span className="pill">{b.status}</span><h3>{b.vehicle?.name || "Vehicle"}</h3><p className="muted">{new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</p></div><strong>₹{b.totalPrice}</strong></article>)}</div>
  </main>;
}

function Admin() {
  const [form, setForm] = useState({ name: "", type: "Bike", brand: "", location: "", pricePerDay: "", imageUrl: "", description: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setMessage(""); setError("");
    try {
      await apiRequest("/vehicles", { method: "POST", body: JSON.stringify(form) });
      setMessage("Vehicle added successfully. It is now visible in the vehicle list.");
      setForm({ name: "", type: "Bike", brand: "", location: "", pricePerDay: "", imageUrl: "", description: "" });
    } catch (e) { setError(e.message); }
  }
  return <main className="auth-wrap"><form className="auth-card wide" onSubmit={submit}><p className="eyebrow">ADMIN TOOLS</p><h1>Add a vehicle</h1><p className="muted">Create a listing for a bike or car in the fleet.</p>
    <label>Vehicle name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></label>
    <div className="two-cols"><label>Type<select value={form.type} onChange={e => setForm({...form,type:e.target.value})}><option>Bike</option><option>Car</option></select></label><label>Brand<input value={form.brand} onChange={e => setForm({...form,brand:e.target.value})} /></label></div>
    <div className="two-cols"><label>Location<input required value={form.location} onChange={e => setForm({...form,location:e.target.value})} /></label><label>Price per day (₹)<input type="number" min="1" required value={form.pricePerDay} onChange={e => setForm({...form,pricePerDay:e.target.value})} /></label></div>
    <label>Image URL (optional)<input type="url" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({...form,imageUrl:e.target.value})} /></label>
    <label>Description (optional)<textarea rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></label>
    {message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}
    <button className="primary-button full">Add vehicle</button>
  </form></main>;
}

export default function App() {
  const [user, setUser] = useState(readUser);
  function onAuth(data) {
    localStorage.setItem("vahanashare_token", data.token);
    localStorage.setItem("vahanashare_user", JSON.stringify(data.user));
    setUser(data.user);
  }
  function logout() {
    localStorage.removeItem("vahanashare_token");
    localStorage.removeItem("vahanashare_user");
    setUser(null);
  }
  return <><Header user={user} onLogout={logout} /><Routes>
    <Route path="/" element={<Home user={user} />} />
    <Route path="/login" element={<AuthPage mode="login" onAuth={onAuth} />} />
    <Route path="/register" element={<AuthPage mode="register" onAuth={onAuth} />} />
    <Route path="/bookings" element={user ? <Bookings /> : <AuthPage mode="login" onAuth={onAuth} />} />
    <Route path="/admin" element={user?.role === "admin" ? <Admin /> : <main className="section"><h1>Admin access required</h1><p>Log in with an administrator account to manage vehicles.</p></main>} />
    <Route path="*" element={<main className="section"><h1>Page not found</h1><Link to="/">Return home</Link></main>} />
  </Routes><footer className="footer">VahanaShare <span>·</span> Share the journey, simply.</footer></>;
}
