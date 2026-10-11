import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-night text-stone-200 font-body pb-16 lg:pb-0">
      <Navbar />
      <main className="flex-1 pt-18 sm:pt-20">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
