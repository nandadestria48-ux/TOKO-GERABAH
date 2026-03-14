import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { formatRupiah } from "../utils/formatCurrency";
import "./Profile.css";

function Profile() {
  const { user, updateUser, orders, isLoading } = useContext(CartContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

   const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target.result);
        setFormData({ ...formData, profilePhoto: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateUser({
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        profilePhoto: formData.profilePhoto
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error.message);
    }
  };

  if (!user) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }

  const totalBelanja = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 Profil Saya</h1>
        <p>Kelola informasi akun Anda</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="avatar-image" />
            ) : (
            <span>👨‍💼</span>
            )}
            {isEditing && (
              <label className="photo-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <span className="upload-icon">📷</span>
              </label>
            )}
          </div>

          {!isEditing ? (
            <>
              <div className="profile-info">
                <div className="info-group">
                  <label>Username</label>
                  <p>{user.username}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-group">
                  <label>Nomor Telepon</label>
                  <p>{user.phone || "-"}</p>
                </div>
                <div className="info-group">
                  <label>Alamat</label>
                  <p>{user.address || "-"}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  ✏️ Edit Profil
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={false}
                  />
                </div>
                <div className="form-group">
                  <label>Nomor Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    disabled={false}
                  />
                </div>
                <div className="form-group">
                  <label>Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    rows="3"
                    disabled={false}
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setFormData(user);
                    setIsEditing(false);
                  }}
                  disabled={isLoading}
                >
                  ✕ Batal
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "✓ Simpan"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="profile-sidebar">
          <div className="stats-card">
            <h3>📊 Statistik</h3>
            <div className="stat-item">
              <p>Total Pesanan</p>
              <span>{orders.length}</span>
            </div>
            <div className="stat-item">
              <p>Total Belanja</p>
              <span>{formatRupiah(totalBelanja)}</span>
            </div>
            <div className="stat-item">
              <p>Poin Loyalty</p>
              <span>{Math.floor(totalBelanja / 1000)}</span>
            </div>
          </div>

          <div className="settings-card">
            <h3>⚙️ Pengaturan</h3>
            <button className="setting-btn">🔐 Ubah Password</button>
            <button className="setting-btn">🔔 Notifikasi</button>
            <button className="setting-btn">🌙 Tema Gelap</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
