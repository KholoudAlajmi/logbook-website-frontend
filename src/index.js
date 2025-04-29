import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './components/Home';
import Login from './components/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Tutor from './components/Tutor';
import Resident from './components/Resident';
import Announcement from './components/Announcement';
import TemplateForms from './components/TemplateForms';

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "*",
    element: <Login />,
  },
  {
  path: "/home",
  element: <Home/>
  },
  {
    path: "/tutor",
    element: <Tutor/>
  },
  {
    path: "/resident",
    element: <Resident/>
  },
{
  path: "/announcement",
  element: <Announcement />
},
{
  path: "/form",
  element: <TemplateForms />
}
]);



root.render(
  <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
