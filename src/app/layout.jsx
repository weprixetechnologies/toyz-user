import { Montserrat, Ledger } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const ledger = Ledger({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-ledger',
});
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWidgets from '../components/FloatingWidgets';
import ScrollReset from '../components/ScrollReset';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'WePrixe Store — Enterprise E-Commerce Platform',
  description: 'Shop top quality products with retail & wholesale reseller pricing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`flex flex-col min-h-screen ${montserrat.variable} ${ledger.variable} font-sans`}>
        <ScrollReset />
        <AuthProvider>
          <Toaster position="top-center" />
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <FloatingWidgets />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
