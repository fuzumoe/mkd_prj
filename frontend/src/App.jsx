import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { CartProvider } from './CartContext';
import Home from './pages/Home.jsx';
import Analyzer from './pages/Analyzer.jsx';
import Results from './pages/Results.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Shop from './pages/Shop.jsx';
import Contact from './pages/Contact.jsx';
import Welcome from './pages/Welcome.jsx';
import Consent from './pages/Consent.jsx';
import PhotoInstructions from './pages/PhotoInstructions.jsx';
import EditProfile from './pages/EditProfile.jsx';
// Admin pages
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminConsultations from './pages/admin/AdminConsultations.jsx';
import AdminImages from './pages/admin/AdminImages.jsx';
import ConsultationForm from './pages/ConsultationForm.jsx';
import About from './pages/About.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AnalysisDetail from './pages/AnalysisDetail.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';
import Orders from './pages/Orders.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import OrderSuccess from './pages/admin/OrderSuccess.jsx';
import AdminCarousel from './pages/admin/AdminCarousel.jsx';
import AdminFAQ from './pages/admin/AdminFAQ.jsx';
import PublicFAQ from './pages/PublicFAQ.jsx';
import AdminBlogs from './pages/admin/AdminBlogs.jsx';
import UserBlogs from './pages/UserBlogs.jsx';
import AdminRatings from './pages/admin/AdminRatings.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';

const isAuthenticated = () => sessionStorage.getItem('isAuthenticated') === 'true';
const isAdminAuthenticated = () => sessionStorage.getItem('isAdminAuthenticated') === 'true';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/admin-login';


  return (
    <CartProvider>
      <>
      {/* Hide main Navbar and Footer on admin routes except login */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/analyzer"
          element={isAuthenticated() ? <Analyzer /> : <Navigate to="/login" state={{ from: 'analyzer' }} replace />}
        />
        <Route path="/results" element={<Results />} />
        <Route
          path="/profile"
          element={isAuthenticated() ? <Profile /> : <Navigate to="/login" state={{ from: 'profile' }} replace />}
        />
        <Route
          path="/checkout"
          element={
            isAuthenticated() ? <Checkout /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/orders"
          element={
            isAuthenticated() ? <Orders /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/photo-instructions" element={<PhotoInstructions />} />
        <Route path="/consultations" element={<ConsultationForm />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/public-faq" element={<PublicFAQ />} />
        <Route path="/blogs" element={<UserBlogs />} />
        <Route path="/payment-success" element={<PaymentSuccess/>} />

        {/* Admin login route */}
        <Route path="/admin-login" element={<AdminLogin />} />
      
        {/* Admin dashboard and subpages (protected) */}
        <Route
          path="/admin"
          element={isAdminAuthenticated() ? <AdminDashboard /> : <Navigate to="/admin-login" replace />}
        >
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="consultations" element={<AdminConsultations />} />
          <Route path="images" element={<AdminImages />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path='carousel' element={<AdminCarousel />} />
          <Route path='faqs' element={<AdminFAQ />} />
          <Route path='blogs' element={<AdminBlogs />} />
          <Route path='ratings' element={<AdminRatings />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
      </>
    </CartProvider>
  );
}

export default App;
