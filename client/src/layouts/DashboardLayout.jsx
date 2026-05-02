import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function DashboardLayout({ children }) {

  return (

    <div className='flex bg-[#f4f7fb] min-h-screen'>

      <Sidebar />

      <div className='flex-1'>

        <Navbar />

        <div className='p-8'>
          {children}
        </div>

      </div>

    </div>
  );
}

export default DashboardLayout;