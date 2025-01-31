import { useState } from 'react'
import './App.css'
import Footer from './Components/Footer/Footer'
import Navbar from './Components/Navbar/Navbar'
import { BrowserRouter } from 'react-router-dom';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import MainPage from './Page/MainPage/MainPage';
import About from './Page/About/About';
import Leadership from './Page/Leadership/Leadership';
import Board from './Page/Board/Board';
import Services from './Page/Services/Services';
import Contact from './Page/Contact/Contact';

function Layout() {//1
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
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

    ]
  }
]);

function App() {//3

  return (
    <RouterProvider router={router} />
  );
}

export default App