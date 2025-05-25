import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './context/UserProvider';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import Tutor from './components/Tutor';
import Resident from './components/Resident';
import Announcement from './components/Announcement';
import TemplateForms from './components/TemplateForms';
import AddForm from './components/AddForm';
import EditForm from './components/EditForm';
import ViewForm from './components/ViewForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/tutor" element={<Tutor/>}/>
            <Route path="/resident" element={<Resident/>}/>
            <Route path="/announcement" element={<Announcement />} />
            <Route path="/form" element={<TemplateForms />} />
            <Route path="/add-form" element={<AddForm />} />
            <Route path="/edit-form/:formId" element={<EditForm />} />
            <Route path="/view-form/:formId" element={<ViewForm />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/" element={<Navigate to="/tutor" replace />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
