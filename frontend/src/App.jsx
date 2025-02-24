import { useState, useEffect } from 'react'
import './App.css'
import Footer from './Components/Footer/Footer'
import Navbar from './Components/Navbar/Navbar'
import AdminNavbar from './Components/AdminNavbar/AdminNavbar'

import { BrowserRouter } from 'react-router-dom';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';
import MainPage from './Page/MainPage/MainPage';
import About from './Page/About/About';
import Leadership from './Page/Leadership/Leadership';
import Board from './Page/Board/Board';
import Services from './Page/Services/Services';
import Contact from './Page/Contact/Contact';
import AdminLogin from './Page/Admin/AdminLogin';
import AdminEditPost from './Page/Admin/AdminEditPost';
import AdminContacts from './Page/Admin/AdminContacts';
import AdminCreatePost from './Page/Admin/AdminCreatePost';
import AdminPosts from './Page/Admin/AdminPosts';


function AuthRedirectRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/verify-token', {}, { withCredentials: true }); //쿠키토큰 보내기
        setIsAuthenticated(true);
      } catch (error) {
        console.log('토큰 검증 실패: ', error);
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);
  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/admin/posts" replace /> : <Outlet />;
}

function Layout() {//1
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div>
      <AdminNavbar />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([//2
  {
    path: '/', //최초접속
    element: <Layout />,
    children: [ //중첩 라우터
      {
        index: true,
        element: <MainPage />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/leadership',
        element: <Leadership />
      },
      {
        path: '/board',
        element: <Board />
      },
      {
        path: '/our-services',
        element: <Services />
      },
      {
        path: '/contact',
        element: <Contact />
      },

    ],
  },
  {
    path: '/admin',
    element: <AuthRedirectRoute />,
    children: [{ index: true, element: <AdminLogin /> }],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'posts',
        element: <AdminPosts />
      },
      {
        path: 'create-post',
        element: <AdminCreatePost />
      },
      {
        path: 'edit-post/:id',
        element: <AdminEditPost />
      },
      {
        path: 'contacts',
        element: <AdminContacts />
      },
    ]
  }
]);

function App() {//3

  return (
    <RouterProvider router={router} />
  );
}

export default App